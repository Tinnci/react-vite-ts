import React, { useEffect, useRef } from 'react';

import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { StateField, StateEffect, Transaction, Range, RangeSet } from '@codemirror/state';

import { useHoverStore } from '@/lib/hoverStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import { useVizStore } from '@/state/vizStore';
import { scenes } from '@/constants/scenes';
import { Panel } from './ui/Panel';

import { fullPythonCode } from '@/constants/pythonCode';
import { useThemeStore } from '@/lib/themeStore';

interface CodePanelProps {}

// 定义一个接口来描述高亮范围
export interface HighlightRange {
  from: number; // 起始行号 (从 1 开始)
  to: number;   // 结束行号 (从 1 开始)
  className?: string; // 应用的 CSS 类名 (可选)
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

// Define a StateField to manage decorations
const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value: DecorationSet, transaction: Transaction) {
    // Apply changes from the transaction to the existing decorations
    // value = value.map(transaction.changes); // 这行在新逻辑中不再需要这样简单映射

    // 检查是否有来自外部的 highlightEffect
    for (const effect of transaction.effects) {
      if (effect.is(highlightEffect)) {
        const highlightRanges = effect.value;
        const decorations: Range<Decoration>[] = [];

        highlightRanges.forEach(range => {
          const fromLine = Math.max(1, range.from);
          const toLine = Math.min(transaction.state.doc.lines, range.to);
          const className = range.className || 'cm-highlight'; // 默认类名

          for (let i = fromLine; i <= toLine; i++) {
            const line = transaction.state.doc.line(i);
             // 根据是否有 className 选择不同的 Decoration
            const mark = range.className ? paragraphHighlightMark(range.className) : activeLineMark;
            decorations.push(mark.range(line.from));
          }
        });

        // 创建一个新的 DecorationSet 从更新的 decorations 数组
        // 使用 RangeSet.of 替换 Decoration.set
        return RangeSet.of(decorations, true); // true 表示按位置排序装饰
      }
    }

    // 如果没有 highlightEffect，保留旧的装饰并映射到新文档位置
    return value.map(transaction.changes);
  },
  // Provide the decorations to the EditorView
  provide: f => EditorView.decorations.from(f),
});

const CodePanel: React.FC<CodePanelProps> = () => {
  useCodeAnalysisStore();

  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const hoveredElement = useHoverStore((state) => state.hoveredElement);
  const pinnedElements = useHoverStore((state) => state.pinnedElements);

  const { currentSceneIndex } = useVizStore();
  const currentScene = scenes[currentSceneIndex];
  const highlightedLines = currentScene.highlightLines;

  const code = fullPythonCode;
  
  // Get theme from useThemeStore
  const themeState = useThemeStore((state) => state.theme);
  const cmTheme = themeState === 'dark' ? 'dark' : 'light'; // Map theme state to CodeMirror theme string

  const editorRef = useRef<EditorView | null>(null);

  // Effect to update CodeMirror decorations when state changes
  useEffect(() => {
    if (editorRef.current) {
      // 构建 HighlightRange[] 数组
      const highlights: HighlightRange[] = [];

      // 添加当前执行行的高亮 (使用默认类名或特定类名)
      highlightedLines.forEach(line => {
         if (line > 0 && line <= editorRef.current!.state.doc.lines) {
            highlights.push({ from: line, to: line, className: 'cm-activeLine' }); // 使用现有的 cm-activeLine 类
         }
      });

      // 添加悬停行的高亮 (使用不同的类名)
      if (hoveredLine !== null && hoveredLine > 0 && hoveredLine <= editorRef.current!.state.doc.lines) {
        // 确保悬停行不与高亮行重复，或者根据优先级处理
        // 为了简单，这里直接添加，实际应用中可能需要更复杂的逻辑
        if (!highlightedLines.includes(hoveredLine)) {
             highlights.push({ from: hoveredLine, to: hoveredLine, className: 'cm-hoveredLine' }); // 假设有一个 cm-hoveredLine 类
        }
      }

      // TODO: 根据 hoveredElement 和 pinnedElements 添加更多高亮范围
      // 这将需要 locations 信息的支持

      // 通过 dispatch 一个 effect 来动态更新高亮
      editorRef.current.dispatch({
        effects: highlightEffect.of(highlights),
      });

      // 滚动到第一个高亮行如果它不在视图中
      if (highlightedLines.length > 0 && editorRef.current) {
        const firstHighlightedLine = highlightedLines[0];
        // Check if the line number is valid within the current document
        if (firstHighlightedLine > 0 && firstHighlightedLine <= editorRef.current.state.doc.lines) {
           const { from } = editorRef.current.state.doc.line(firstHighlightedLine);
           editorRef.current.dispatch({
             effects: EditorView.scrollIntoView(from, { y: 'center' }),
           });
        }
      }
    }
  }, [highlightedLines, hoveredLine, hoveredElement, pinnedElements, editorRef.current]);

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

export default CodePanel;