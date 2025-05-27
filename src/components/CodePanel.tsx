import React, { useEffect, useRef } from 'react';

import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { StateField, StateEffect, Transaction, RangeSetBuilder, Facet } from '@codemirror/state';

import { useHoverStore } from '@/lib/hoverStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import { useVizStore } from '@/state/vizStore';
import { scenes } from '@/constants/scenes';
import { Panel } from './ui/Panel';

import { fullPythonCode } from '@/constants/pythonCode';
import { useThemeStore } from '@/lib/themeStore';
import { createHighlightMap } from '@/lib/codeHighlightingUtils'; // 导入新的工具函数
import { dynamicHighlightExtension, highlightedLines } from '../lib/highlightExtension'; // 导入实际导出的扩展和 Facet
import { hideTagsExtension } from '../lib/hideTagsExtension.js'; // 导入新扩展

interface CodePanelProps {}

// 定义一个接口来描述高亮范围 (可以是行号或字符范围)
export interface HighlightRange {
  from: number; // 起始位置 (行号或字符偏移)
  to: number;   // 结束位置 (行号或字符偏移)
  className?: string; // 应用的 CSS 类名 (可选)
  type: 'line' | 'range'; // 新增：指定高亮类型
}

// 定义一个 StateEffect 类型，用于从外部更新高亮范围数组
const highlightEffect = StateEffect.define<HighlightRange[]>();

// 定义自定义样式的高亮 Decoration
const activeLineMark = Decoration.line({
  attributes: { class: 'cm-activeLine' }
});

// 定义用于段落高亮的 Decoration
const paragraphHighlightMark = (className: string) => Decoration.line({
  attributes: { class: className }
});

// 定义用于范围高亮的 Decoration
const rangeHighlightMark = (className: string) => Decoration.mark({
  attributes: { class: className }
});

// Define a StateField to manage decorations
const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value: DecorationSet, transaction: Transaction) {
    // 应用来自 transaction 的更改到现有装饰 (对于不通过 effect 更新的装饰有用)
    // value = value.map(transaction.changes); 


    // 检查是否有来自外部的 highlightEffect
    for (const effect of transaction.effects) {
      if (effect.is(highlightEffect)) {
        const highlightRanges = effect.value;
        
        const builder = new RangeSetBuilder<Decoration>();

        highlightRanges.forEach(range => {
          if (range.type === 'line') {
            // 处理行高亮
            const fromLine = Math.max(1, range.from);
            const toLine = Math.min(transaction.state.doc.lines, range.to);

            for (let i = fromLine; i <= toLine; i++) {
              const line = transaction.state.doc.line(i);
              const mark = range.className ? paragraphHighlightMark(range.className) : activeLineMark;
              builder.add(line.from, line.from, mark);
            }
          } else if (range.type === 'range') {
            // 处理范围高亮 (基于字符偏移量)
            const className = range.className || 'cm-highlight'; // 默认类名
            const mark = rangeHighlightMark(className);
            builder.add(range.from, range.to, mark);
          }
        });
        
        return builder.finish();
      }
    }

    // 如果没有 highlightEffect，并且有旧的装饰，映射它们（对于不通过 effect 管理的装饰）
    // For this specific field which is fully managed by effects, this might not be needed
    // But keeping it as a fallback for other potential decorations
     return value.map(transaction.changes);
  },
  // Provide the decorations to the EditorView
  provide: f => EditorView.decorations.from(f),
});

// 在组件外部或 memo 中计算一次代码标记映射
const codeHighlightMap = createHighlightMap(fullPythonCode);

const CodePanel: React.FC<CodePanelProps> = () => {
  useCodeAnalysisStore();

  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const hoveredElement = useHoverStore((state) => state.hoveredElement);
  const pinnedElements = useHoverStore((state) => state.pinnedElements);

  const { currentSceneIndex } = useVizStore();
  const currentScene = scenes[currentSceneIndex];
  // const highlightedLines = currentScene.highlightLines; // 不再直接使用行号数组

  const code = fullPythonCode;
  
  // Get theme from useThemeStore
  const themeState = useThemeStore((state) => state.theme);
  const cmTheme = themeState === 'dark' ? 'dark' : 'light'; // Map theme state to CodeMirror theme string

  const editorRef = useRef<EditorView | null>(null);

  // Effect to update CodeMirror decorations when state changes
  useEffect(() => {
    if (editorRef.current) {
      const highlights: HighlightRange[] = [];

      // --- 添加基于 Tag 的代码块高亮 ---
      if (currentScene.highlightTag) {
        // 从 Facet 获取 highlightMap
        const map = editorRef.current.state.facet(highlightMapFacet); // 使用 Facet 获取 Map
        const range = map.get(currentScene.highlightTag);
        if (range) {
          // CodeMirror 范围是 [from, to), 所以结束位置需要加 1 (如果 to 是字符偏移量)
          // 但在 createHighlightMap 中，我们获取的是结束标记的起始位置，所以这里的 range.to 已经是结束位置
          // 我们需要获取结束标记那一行的结束字符位置，或者高亮到结束标记的起始位置即可
          // 让我们先高亮到结束标记的起始位置进行测试
          // 确保范围有效
           if (range.from >= 0 && range.to >= range.from) {
               highlights.push({ from: range.from, to: range.to, className: 'cm-highlight', type: 'range' }); // 使用 type: 'range'
           }
        }
      }

      // --- 添加悬停行的高亮 (保持不变) ---
      if (hoveredLine !== null && editorRef.current.state.doc.line(hoveredLine)) { // 检查行号是否存在
           // 确保悬停行不与当前场景高亮范围重叠 (简单检查，复杂场景可能需要更多逻辑)
           const currentSceneRange = currentScene.highlightTag ? codeHighlightMap.get(currentScene.highlightTag) : null;
           let isOverlappingWithSceneHighlight = false;
           if (currentSceneRange && hoveredLine >= editorRef.current.state.doc.lineAt(currentSceneRange.from).number && hoveredLine <= editorRef.current.state.doc.lineAt(currentSceneRange.to).number) {
               isOverlappingWithSceneHighlight = true;
           }

           if (!isOverlappingWithSceneHighlight) {
                highlights.push({ from: hoveredLine, to: hoveredLine, className: 'cm-hoveredLine', type: 'line' }); // 使用 type: 'line'
           }
      }

      // TODO: 根据 hoveredElement 和 pinnedElements 添加更多高亮范围
      // 这将需要 locations 信息的支持

      // 通过 dispatch 一个 effect 来动态更新高亮
      editorRef.current.dispatch({
        effects: highlightEffect.of(highlights),
      });

      // 滚动到当前场景高亮区域的起始位置
      if (currentScene.highlightTag) {
         const range = codeHighlightMap.get(currentScene.highlightTag);
         if (range && editorRef.current) {
             // 滚动到范围的起始位置
             editorRef.current.dispatch({
               effects: EditorView.scrollIntoView(range.from, { y: 'center' }),
             });
         }
      } else if (hoveredLine !== null && editorRef.current) { // 如果没有场景高亮，滚动到悬停行
           const line = editorRef.current.state.doc.line(hoveredLine);
           editorRef.current.dispatch({
             effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
           });
      }
    }
  }, [currentScene.highlightTag, hoveredLine, hoveredElement, pinnedElements, editorRef.current]);

  // TODO: Implement click handler for pinning elements using EditorView.domEventHandlers
  // This will require mapping CodeMirror positions back to our element names and types using locations.
  // TODO: Implement hover handler for updating hoveredElement using EditorView.domEventHandlers or hoverTooltip
  // Similar to click handler, requires mapping positions to elements.
  // TODO: Integrate explanation popover with CodeMirror, possibly using a custom ViewPlugin or position-matching logic.

  return (
    <Panel className="relative w-full font-mono text-sm" style={{ minHeight: 200 }}>
      <CodeMirror
        value={code}
        height="100%"
        extensions={[
          python(),
          EditorView.lineWrapping,
          EditorView.editable.of(false),
          highlightField, // Add the highlight field extension
          dynamicHighlightExtension([]), // 使用实际导出的函数，并提供初始空数组
          highlightedLines.of([]), // 提供 highlightedLines Facet 的初始值 (空数组)
          hideTagsExtension(), // 添加隐藏标记的扩展
          // TODO: Add event handlers for hover and click
        ]}
        theme={cmTheme} // Apply CodeMirror theme based on state
        onCreateEditor={(editor) => {
          editorRef.current = editor;
        }}
      />
    </Panel>
  );
};

// 定义一个 Facet 来传递 highlightMap
const highlightMapFacet = Facet.define<Map<string, { from: number; to: number }>, Map<string, { from: number; to: number }>>({
  combine: values => values.length > 0 ? values[0] : new Map() // 简单合并策略，取第一个值
});

export default CodePanel;