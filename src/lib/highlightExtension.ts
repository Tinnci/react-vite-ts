import { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
import { Facet } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import type { Range } from '@codemirror/state';

// 1. Facet 现在定义为接收和处理 number[]
// 我们将 combine 函数定义为合并所有传入的数组
export const highlightedLines = Facet.define<number[], readonly number[]>(
  {
    combine: (values) => values.flat(),
  }
);

// 2. Decoration 的定义保持不变
const highlightDecoration = Decoration.line({
  attributes: { class: 'cm-highlighted-line' },
});

// 3. ViewPlugin 的逻辑更新
const highlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // 仅当配置（Facet值）、文档或视口变化时才更新，更高效
      if (
        update.docChanged ||
        update.viewportChanged ||
        update.transactions.some((tr) => tr.reconfigured)
      ) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder: Range<Decoration>[] = [];
      // 从 Facet 获取行号数组
      const lineNumbers = view.state.facet(highlightedLines);

      // 遍历数组中的每一个行号
      for (const lineNumber of lineNumbers) {
        // 确保行号在有效范围内
        if (lineNumber > 0 && lineNumber <= view.state.doc.lines) {
          const line = view.state.doc.line(lineNumber);
          builder.push(highlightDecoration.range(line.from));
        }
      }

      // 根据构建的 decorations 创建 DecorationSet
      return Decoration.set(builder, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// 4. 导出的函数现在期望接收 number[]
export function dynamicHighlightExtension(
  lines: number[] | undefined
): any[] {
  // 即使没有高亮行，也需要加载插件本身来管理空的 DecorationSet
  if (!lines || lines.length === 0) {
    return [highlightPlugin];
  }

  // 如果有高亮行，则同时提供 Facet 值和插件
  return [
    highlightedLines.of(lines),
    highlightPlugin,
  ];
} 