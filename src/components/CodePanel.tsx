import React from 'react';

// Import SyntaxHighlighter and a style
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // 支持亮/暗主题
import { useHoverStore } from '@/lib/hoverStore';
import { useThemeStore } from '@/lib/themeStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';

SyntaxHighlighter.registerLanguage('python', python);

interface CodePanelProps {
  code: string;
  highlightedLines: number[];
}

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines }) => {
  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const hoveredVar = useHoverStore((state) => state.hoveredVar);
  const theme = useThemeStore((state) => state.theme);
  const locations = useCodeAnalysisStore((state) => state.locations);

  // 获取当前 hover 变量的所有出现行号
  const linesToHighlightForVar = hoveredVar ? locations.get(hoveredVar)?.map(loc => loc.lineno) || [] : [];

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
          const isSceneHighlight = highlightedLines.includes(lineNumber);
          const isVarHighlight = linesToHighlightForVar.includes(lineNumber);
          const isExplanationHighlight = hoveredLine === lineNumber;
          const highlight = isSceneHighlight || isVarHighlight || isExplanationHighlight;
          if (highlight) {
            style.background = isExplanationHighlight
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