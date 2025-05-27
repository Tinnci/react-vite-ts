// src/lib/hideTagsExtension.ts

import {
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
  EditorView,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// 正则表达式匹配 # scene-id: 标记行
const tagRegex = /# scene-id: .*/;

const hideTagsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      // 遍历当前可见区域的所有行
      for (const { from, to } of view.visibleRanges) {
        // 获取可见区域的起始和结束行号
        const startLine = view.state.doc.lineAt(from).number;
        const endLine = view.state.doc.lineAt(to).number;

        // 遍历行号范围
        for (let i = startLine; i <= endLine; i++) {
          const line = view.state.doc.line(i);
          const lineText = line.text;

          // 检查整行是否包含标记
          const match = tagRegex.test(lineText);
          if (match) {
            // 如果行匹配成功，创建一个替换装饰来"隐藏"整行。
            // Decoration.replace 使用 from 和 to 索引，这里我们用当前行的起始和结束位置。
            builder.add(
              line.from,
              line.to,
              Decoration.replace({})
            );
          }
        }
      }
      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// 导出这个插件，以便在 CodePanel 中使用
export const hideTagsExtension = () => hideTagsPlugin; 