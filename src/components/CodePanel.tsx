import React, { useEffect, useRef, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { basicSetup } from 'codemirror';
import { githubDark } from '@uiw/codemirror-theme-github';
import {
  customHighlightExtension,
  activeTagCompartment,
  setActiveTagEffect
} from '../lib/customHighlightExtension';
import { useVizStore } from '../state/vizStore';
import { fullPythonCode } from '../constants/pythonCode';
import { scenes } from '../constants/scenes';
import { useThemeStore } from '../lib/themeStore';

interface CodePanelProps {
  code: string;
  activeTag: string;
}

const CodePanel: React.FC<CodePanelProps> = ({ code, activeTag }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { theme } = useThemeStore();
  const { currentSceneIndex } = useVizStore();
  const scene = scenes[currentSceneIndex];
  const highlightTag = scenes[currentSceneIndex]?.highlightTag || '';

  const compartmentRef = useRef(activeTagCompartment);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const extensions = [
        basicSetup,
        python(),
        githubDark,
        customHighlightExtension
      ];

      const startState = EditorState.create({
        doc: code,
        extensions,
      });

      viewRef.current = new EditorView({
        state: startState,
        parent: editorRef.current,
      });
    }

    if (viewRef.current && viewRef.current.state.doc.toString() !== code) {
        viewRef.current.dispatch({
            changes: { from: 0, to: viewRef.current.state.doc.length, insert: code }
        });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [code]);

  useEffect(() => {
    if (viewRef.current) {
      const effect = setActiveTagEffect.of(activeTag);
      viewRef.current.dispatch({
        effects: [effect]
      });
    }
  }, [activeTag]);

  return <div ref={editorRef} style={{ height: '100%', overflow: 'auto' }} />;
};

export default CodePanel;