// src/lib/hideTagsExtension.ts

import {
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
  EditorView,
} from '@codemirror/view';
import { RangeSetBuilder, StateEffect } from '@codemirror/state';

// 正则表达式匹配 # scene-id: 标记行
const tagRegex = /^\s*# scene-id: .*$/;

// 创建一个专门用于隐藏的行装饰
const hiddenLineDecoration = Decoration.line({
  attributes: { class: 'cm-hidden-line' },
});

const hideTagsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      } else if (update.transactions.some(tr => tr.effects.some(e => e.is(StateEffect.appendConfig)))) {
         // 当配置（如插件）发生变化时，也需要重新构建装饰，
         // 否则新添加的插件（比如高亮）可能无法正确渲染。
         this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      // 遍历当前可见区域的所有行
      for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        
        // 在循环内部创建正则表达式实例以避免全局状态问题
        const localRegex = new RegExp(tagRegex.source, 'gm');
        let match;
        
        while ((match = localRegex.exec(text))) {
          const start = from + match.index;
          const line = view.state.doc.lineAt(start);
          // 使用行装饰来添加CSS类，而不是替换内容
          builder.add(line.from, line.from, hiddenLineDecoration);
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