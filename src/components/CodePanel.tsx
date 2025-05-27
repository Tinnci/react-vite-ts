import React, { useEffect, useRef } from 'react';

import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration, ViewPlugin, ViewUpdate, DecorationSet } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { EditorState, StateField, StateEffect, Transaction, Range } from '@codemirror/state';

import { useHoverStore } from '@/lib/hoverStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import { useVizStore } from '@/state/vizStore';
import { scenes } from '@/constants/scenes';
import { Panel } from './ui/Panel';

import { fullPythonCode } from '@/constants/pythonCode';
import { useThemeStore } from '@/lib/themeStore';

interface CodePanelProps {}

// Define a StateEffect to trigger highlight updates
const highlightEffect = StateEffect.define<{ line: number | null, hovered: any | null, pinned: any[] }>();

// Define custom styles for highlighting
const activeLineMark = Decoration.line({
  attributes: { class: 'cm-activeLine' }
});

// TODO: Define marks for hovered and pinned elements
const highlightMark = Decoration.mark({
  attributes: { class: 'cm-highlighted' }
});

const pinnedMark = Decoration.mark({
  attributes: { class: 'cm-pinned' }
});

// Define a StateField to manage decorations
const highlightField = StateField.define<DecorationSet>({
  create: (state: EditorState) => Decoration.none,
  update(value: DecorationSet, transaction: Transaction) {
    // Apply changes from the transaction to the existing decorations
    value = value.map(transaction.changes);

    // Process highlight effects
    for (const effect of transaction.effects) {
      if (effect.is(highlightEffect)) {
        const { line, hovered, pinned } = effect.value;
        const decorations: Range<Decoration>[] = [];

        // Highlight current execution line(s)
        // We should iterate through all highlightedLines, not just the first.
        // For now, keeping simplified for basic line highlight.
        if (line !== null) {
           const linePos = transaction.state.doc.line(line).from;
           decorations.push(activeLineMark.range(linePos));
        }

        // TODO: Add decorations for hovered and pinned elements based on locations
        // This will require access to locations and mapping element names to CodeMirror positions.

        // Create a new DecorationSet from the updated decorations array
        value = Decoration.set(decorations, true); // true means sort the decorations by position
      }
    }
    return value;
  },
  // Provide the decorations to the EditorView
  provide: f => EditorView.decorations.from(f),
});

const CodePanel: React.FC<CodePanelProps> = () => {
  const { locations } = useCodeAnalysisStore();

  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const hoveredElement = useHoverStore((state) => state.hoveredElement);
  const pinnedElements = useHoverStore((state) => state.pinnedElements);
  const togglePinElement = useHoverStore((state) => state.togglePinElement);

  const { currentSceneIndex } = useVizStore();
  const currentScene = scenes[currentSceneIndex];
  const highlightedLines = currentScene.highlightLines;
  const highlightedVars = currentScene.highlightedVars || [];

  const code = fullPythonCode;
  
  // Get theme from useThemeStore
  const themeState = useThemeStore((state) => state.theme);
  const cmTheme = themeState === 'dark' ? 'dark' : 'light'; // Map theme state to CodeMirror theme string

  const editorRef = useRef<EditorView | null>(null);

  // Effect to update CodeMirror decorations when state changes
  useEffect(() => {
    if (editorRef.current) {
      // Combine highlightedLines and hoveredLine for line highlighting dispatch
      const linesToHighlight = new Set([...highlightedLines]);
      if (hoveredLine !== null) {
        linesToHighlight.add(hoveredLine);
      }

      // Dispatch the effect with relevant state
      editorRef.current.dispatch({
        effects: highlightEffect.of({
          line: linesToHighlight.size > 0 ? Array.from(linesToHighlight)[0] : null, // Simplified line for effect
          hovered: hoveredElement,
          pinned: pinnedElements,
        }),
      });

      // Scroll to the first highlighted line if it's not in view
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