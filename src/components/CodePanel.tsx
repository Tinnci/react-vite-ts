import React, { useEffect, useMemo } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { githubDark } from '@uiw/codemirror-theme-github';
import { useVizStore } from '../state/vizStore';
import { fullPythonCode } from '../constants/pythonCode';
import { hideTagsExtension } from '../lib/hideTagsExtension';
import { highlightStateField, highlightExtension } from '../lib/highlightExtension';
import { scenes } from '../constants/scenes';

const CodePanel: React.FC = () => {
    const { currentSceneIndex } = useVizStore();
    const scene = scenes[currentSceneIndex];

    const extensions = useMemo(
        () => [
            python(),
            hideTagsExtension(),
            highlightStateField,
        ],
        []
    );

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
            highlightExtension(view, scene.highlightTag);
        }
    }, [view, scene]);

    return <div ref={setContainer} className="h-full" />;
};

export default CodePanel;