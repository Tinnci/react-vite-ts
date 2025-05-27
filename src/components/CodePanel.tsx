import React from 'react';

// Import SyntaxHighlighter and a style
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // 支持亮/暗主题
import { useHoverStore } from '@/lib/hoverStore';
import { useThemeStore } from '@/lib/themeStore';

SyntaxHighlighter.registerLanguage('python', python);

interface CodePanelProps {
  code: string;
  highlightedLines: number[];
}

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines }) => {
  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const hoveredVar = useHoverStore((state) => state.hoveredVar);
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className="bg-panel-bg text-foreground min-h-[200px] md:min-h-[400px]">
      {/* Use SyntaxHighlighter component */}
      <SyntaxHighlighter
        language="python"
        style={theme === 'dark' ? atomOneDark : atomOneLight} // 动态切换主题
        showLineNumbers={true} // Show line numbers
        wrapLongLines={true} // 关键：强制长行换行
        customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'transparent', color: 'inherit' }}
        lineProps={lineNumber => {
          const style: React.CSSProperties = {};
          // 变量名 hover 高亮支持
          let highlight = highlightedLines.includes(lineNumber) || hoveredLine === lineNumber;
          if (hoveredVar) {
            // 精确匹配变量名（单词边界）
            const codeLines = code.split('\n');
            const lineText = codeLines[lineNumber - 1] || '';
            const pattern = new RegExp(`\\b${hoveredVar}\\b`);
            if (pattern.test(lineText)) highlight = true;
          }
          if (highlight) {
            style.background = hoveredLine === lineNumber
              ? 'rgb(var(--highlight-bg))'
              : 'rgba(var(--highlight-bg), 0.5)';
            style.borderLeft = '4px solid rgb(var(--highlight-border))';
            style.color = 'rgb(var(--highlight-fg))';
            style.transition = 'background 0.3s, border 0.3s, color 0.3s';
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