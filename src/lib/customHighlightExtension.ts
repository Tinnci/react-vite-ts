import { StateField, StateEffect, Range } from '@codemirror/state';
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, EditorView } from '@codemirror/view';

// 1. 定义高亮和隐藏的 Decoration
const highlightedLineDecoration = Decoration.line({ class: 'cm-highlighted-line' });
const hiddenDecoration = Decoration.replace({});

// 2. 创建一个 StateEffect 来更新 activeTag
export const setActiveTagEffect = StateEffect.define<string>();

// 3. 创建一个 StateField 来存储当前的 activeTag
export const activeTagState = StateField.define<string>({
  create: () => '',
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setActiveTagEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

// 4. 主要的插件逻辑，现在从 StateField 读取 activeTag
const highlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // 检查文档、视口或我们自己的 StateField 是否发生变化
      if (update.docChanged || update.viewportChanged || update.state.field(activeTagState) !== update.startState.field(activeTagState)) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder: Range<Decoration>[] = [];
      const activeTag = view.state.field(activeTagState);
      const tagRegex = /# scene-id: (\w+)_(start|end)/;

      let highlightStartLine = -1;
      let highlightEndLine = -1;

      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; ) {
          const line = view.state.doc.lineAt(pos);
          const match = line.text.match(tagRegex);

          if (match) {
            builder.push(hiddenDecoration.range(line.from, line.to));
            const tagName = match[1];
            const tagType = match[2];
            if (activeTag && tagName === activeTag) {
              if (tagType === 'start') {
                highlightStartLine = line.number;
              } else if (tagType === 'end') {
                highlightEndLine = line.number;
              }
            }
          }
          pos = line.to + 1;
        }
      }

      if (highlightStartLine !== -1 && highlightEndLine !== -1) {
        for (let i = highlightStartLine + 1; i < highlightEndLine; i++) {
          const line = view.state.doc.line(i);
          builder.push(highlightedLineDecoration.range(line.from));
        }
      }

      return Decoration.set(builder, true);
    }
  },
  {
    decorations: v => v.decorations,
  }
);

// 5. 导出统一的扩展
export const customHighlightExtension = [activeTagState, highlightPlugin]; 