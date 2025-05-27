import React from 'react';

// Import SyntaxHighlighter and a style
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // 支持亮/暗主题
import { useHoverStore } from '@/lib/hoverStore';

SyntaxHighlighter.registerLanguage('python', python);

interface CodePanelProps {
  code: string;
  highlightedLines: number[];
}

// 预留主题切换逻辑（可用 zustand/context 实现 useTheme）
function useTheme() {
  // 简单实现：根据 html 是否有 .dark 类判断
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
}

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines }) => {
  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const theme = useTheme();

  return (
    <div className="code-panel panel-card p-4 min-h-[400px]">
      {/* Use SyntaxHighlighter component */}
      <SyntaxHighlighter
        language="python"
        style={theme === 'dark' ? atomOneDark : atomOneLight} // 动态切换主题
        showLineNumbers={true} // Show line numbers
        wrapLongLines={true} // 关键：强制长行换行
        customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        lineProps={lineNumber => {
          const style: React.CSSProperties = {};
          if (highlightedLines.includes(lineNumber) || hoveredLine === lineNumber) {
            style.backgroundColor = hoveredLine === lineNumber ? '#fde68a' : '#4a5568';
            style.borderLeft = '4px solid #60a5fa';
            style.transition = 'background 0.2s, border 0.2s';
            style.display = 'block';
          }
          style.paddingRight = '1rem';
          return { style };
        }}
      >
        {code.trim()} {/* Pass the code string directly */}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodePanel; 