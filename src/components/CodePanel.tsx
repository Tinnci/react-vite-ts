import React, { useEffect, useRef } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
// import { useTheme } from 'next-themes'; // 暂时注释掉，根据项目实际情况调整
import { customHighlightExtension, setActiveTagEffect } from '../lib/customHighlightExtension'; // <--- Import new items

interface CodePanelProps {
  code: string;
  activeTag: string; // activeTag 不再是可选的
  theme: 'dark' | 'light'; // 添加 theme 属性
}

const CodePanel: React.FC<CodePanelProps> = ({ code, activeTag, theme }) => { // 接收 theme 属性
  // const { theme } = useTheme(); // 暂时注释掉，根据项目实际情况调整
  const viewRef = useRef<{ view?: EditorView }>(null); // Ref to access CodeMirror view

  // 使用 useEffect 来分发 activeTag 的变化
  useEffect(() => {
    if (viewRef.current?.view && activeTag !== undefined) {
      viewRef.current.view.dispatch({
        effects: setActiveTagEffect.of(activeTag),
      });
    }
  }, [activeTag]);

  // 扩展现在是静态的，不再需要 useMemo
  const extensions = [
    python(),
    EditorView.lineWrapping,
    customHighlightExtension, // <--- 使用统一的扩展
  ];

  return (
    <div className="flex-1 overflow-auto h-full">
      <CodeMirror
        ref={viewRef} // <--- 附加 ref
        value={code}
        theme={theme === 'dark' ? 'dark' : 'light'} // 重新启用 theme 属性
        extensions={extensions}
        readOnly
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default CodePanel;