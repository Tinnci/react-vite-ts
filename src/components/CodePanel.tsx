import React, { useEffect, useMemo } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { githubDark } from '@uiw/codemirror-theme-github';
import { useVizStore } from '../state/vizStore';
import { fullPythonCode } from '../constants/pythonCode';
import { customHighlightExtension } from '../lib/customHighlightExtension';
import { scenes } from '../constants/scenes';
import { EditorView } from '@codemirror/view';
import { useThemeStore } from '../lib/themeStore';

interface CodePanelProps {
    pythonCode: string;
}

const CodePanel: React.FC<CodePanelProps> = ({ }) => {
    const { theme } = useThemeStore();
    const { currentSceneIndex } = useVizStore();
    const scene = scenes[currentSceneIndex];
    const highlightTag = scenes[currentSceneIndex]?.highlightTag || '';

    const extensions = useMemo(() => {
        const exts = [
            python(),
            EditorView.lineWrapping,
            EditorView.editable.of(false),
            customHighlightExtension(highlightTag),
        ];
        return exts;
    }, [highlightTag, theme]);

    const { setContainer, view } = useCodeMirror({
        container: null,
        value: fullPythonCode,
        theme: githubDark,
        extensions,
        height: '100%%',
        basicSetup: {
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: false,
        },
        editable: false,
    });

    useEffect(() => {
        if (view && scene) {
            customHighlightExtension(scene.highlightTag || '');
        }
    }, [view, scene]);

    return <div ref={setContainer} className="h-full" />;
};

export default CodePanel;