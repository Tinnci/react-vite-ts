import React from 'react';

// Import SyntaxHighlighter and a style
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // Using hljs styles
import { useHoverStore } from '@/lib/hoverStore';

SyntaxHighlighter.registerLanguage('python', python);

interface CodePanelProps {
  code: string;
  highlightedLines: number[];
}

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines }) => {
  const hoveredLine = useHoverStore((state) => state.hoveredLine);

  return (
    <div className="code-panel panel-card p-4 min-h-[400px]">
      {/* Use SyntaxHighlighter component */}
      <SyntaxHighlighter
        language="python"
        style={atomOneDark} // Apply the chosen style theme
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