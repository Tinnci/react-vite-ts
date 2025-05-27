import React from 'react';
import { useHoverStore } from '@/lib/hoverStore';

interface ExplanationOutputProps {
  explanation: string;
  output: string;
}

// 解析 <hover-target line={x}> 或 <hover-target var="xxx">内容</hover-target> 并动态渲染
function parseExplanation(
  explanation: string,
  handleLineEnter: (line: number) => void,
  handleLineLeave: () => void,
  handleVarEnter: (varName: string) => void,
  handleVarLeave: () => void
) {
  const regex = /<hover-target(?: line={(\d+)})?(?: var=\"([^"]+)\")?>([\s\S]*?)<\/hover-target>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(explanation)) !== null) {
    const [full, lineStr, varName, content] = match;
    // 添加前面的普通文本
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} dangerouslySetInnerHTML={{ __html: explanation.slice(lastIndex, match.index) }} />
      );
    }
    // 添加高亮交互部分
    if (lineStr) {
      const line = parseInt(lineStr, 10);
      parts.push(
        <span
          key={key++}
          onMouseEnter={() => handleLineEnter(line)}
          onMouseLeave={handleLineLeave}
          className="cursor-pointer underline decoration-dotted"
          style={{
            background: 'rgb(var(--highlight-bg))',
            color: 'rgb(var(--highlight-fg))',
            borderRadius: 2,
            borderLeft: '4px solid rgb(var(--highlight-border))',
            padding: '0 2px',
            transition: 'background 0.3s, border 0.3s, color 0.3s',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    } else if (varName) {
      parts.push(
        <span
          key={key++}
          onMouseEnter={() => handleVarEnter(varName)}
          onMouseLeave={handleVarLeave}
          className="cursor-pointer underline decoration-dotted"
          style={{
            background: 'rgb(var(--highlight-bg))',
            color: 'rgb(var(--highlight-fg))',
            borderRadius: 2,
            borderLeft: '4px solid rgb(var(--highlight-border))',
            padding: '0 2px',
            transition: 'background 0.3s, border 0.3s, color 0.3s',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    lastIndex = match.index + full.length;
  }
  // 添加剩余文本
  if (lastIndex < explanation.length) {
    parts.push(
      <span key={key++} dangerouslySetInnerHTML={{ __html: explanation.slice(lastIndex) }} />
    );
  }
  return parts;
}

const ExplanationOutput: React.FC<ExplanationOutputProps> = ({ explanation, output }) => {
  const setHoveredLine = useHoverStore((state) => state.setHoveredLine);
  const setHoveredVar = useHoverStore((state) => state.setHoveredVar);
  return (
    <div className="output-panel panel-card mt-4 p-4 min-h-[100px]">
      <h2 className="panel-title">解释 / 输出</h2>
      <div id="explanationArea" className="comment mt-2 p-2 bg-white border-l-4 border-yellow-400 text-yellow-700 rounded text-sm">
        {parseExplanation(
          explanation,
          (line) => setHoveredLine(line),
          () => setHoveredLine(null),
          (varName) => setHoveredVar(varName),
          () => setHoveredVar(null)
        )}
      </div>
      <pre id="outputArea" className="mt-2 p-2 bg-white text-gray-900 rounded text-sm whitespace-pre-wrap break-words">{output}</pre>
    </div>
  );
};

export default ExplanationOutput; 