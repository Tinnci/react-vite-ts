import { StateField, StateEffect, Transaction, RangeSetBuilder } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { findHighlightRangeByTag } from './codeHighlightingUtils';
import { fullPythonCode } from '../constants/pythonCode';

const highlightEffect = StateEffect.define<{ from: number; to: number } | null>();

const lineHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr: Transaction) {
    let newValue = value.map(tr.changes);

    for (const effect of tr.effects) {
      if (effect.is(highlightEffect)) {
        const range = effect.value;
        const builder = new RangeSetBuilder<Decoration>();

        if (range && range.from <= range.to) {
          const startLine = tr.state.doc.lineAt(range.from);
          const endLine = tr.state.doc.lineAt(range.to);

          for (let i = startLine.number; i <= endLine.number; i++) {
            const line = tr.state.doc.line(i);
            builder.add(line.from, line.from, Decoration.line({ class: 'cm-line-highlight' }));
          }

          newValue = builder.finish();
        } else {
          newValue = Decoration.none;
        }
      }
    }
    return newValue;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function highlightExtension(view: EditorView, sceneTag: string | undefined) {
  if (!view) return;

  const range = findHighlightRangeByTag(sceneTag, fullPythonCode);
  
  view.dispatch({
    effects: highlightEffect.of(range),
  });
}

export const highlightStateField = lineHighlightField;