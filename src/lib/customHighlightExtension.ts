import { ViewPlugin, Decoration, MatchDecorator, ViewUpdate, EditorView } from '@codemirror/view';
import { StateField, Compartment, StateEffect, Transaction } from '@codemirror/state';

// 标记的正则表达式
const TAG_REGEX = /^\s*# scene-id: (\w+)_(start|end)\s*$/;

// 定义高亮和隐藏的装饰器
const highlightDecoration = Decoration.line({ attributes: { class: 'cm-highlighted-line' } });
const hideDecoration = Decoration.replace({});

// 1. 创建并导出一个 Compartment
export const activeTagCompartment = new Compartment();

// 2. 创建一个 StateField 来存储 activeTag
const activeTagState = StateField.define<string>({
  create: () => '',
  update: (value, tr: Transaction) => {
    const effect = tr.effects.find(e => e.is(setActiveTagEffect));
    return effect ? effect.value : value;
  },
});

// 3. 创建一个 StateEffect 来更新 activeTag
export const setActiveTagEffect = StateEffect.define<string>();

const tagRegex = /# scene-id: (\\S+)/g;

function decorate(state: any) {
  const decorations = [];
  const activeTag = state.field(activeTagState);
  const startTag = `${activeTag}_start`;
  const endTag = `${activeTag}_end`;

  let highlightStartLine = -1;
  let highlightEndLine = -1;
  const linesToHide = [];

  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i);
    const match = tagRegex.exec(line.text);

    if (match) {
      const tag = match[1];
      linesToHide.push(line.from);

      if (tag === startTag) {
        highlightStartLine = i + 1;
      } else if (tag === endTag) {
        highlightEndLine = i - 1;
      }
    }
    tagRegex.lastIndex = 0; // Reset regex
  }

  // Hide all tags
  for (const from of linesToHide) {
    decorations.push(hideDecoration.range(from, state.doc.lineByPos(from).to));
  }

  // Add highlighting if start and end tags are found
  if (highlightStartLine !== -1 && highlightEndLine !== -1) {
    for (let i = highlightStartLine; i <= highlightEndLine; i++) {
      const line = state.doc.line(i);
      decorations.push(highlightDecoration.range(line.from));
    }
  }

  return Decoration.set(decorations);
}

// 4. 将 ViewPlugin 转换为 StateField 以便更好地与状态集成
export const customHighlightExtension = StateField.define({
  create(state) {
    return decorate(state);
  },
  update(value, tr) {
    if (tr.docChanged || tr.effects.some(e => e.is(setActiveTagEffect))) {
      return decorate(tr.state);
    }
    return value;
  },
  provide: f => [
    EditorView.decorations.from(f),
    activeTagState // Provide the state field
  ]
}); 