import React from 'react';
import { useHoverStore } from '@/lib/hoverStore';
import type { ExplanationPart } from '@/constants/scenes';

interface ExplanationOutputProps {
  explanation: string | ExplanationPart[];
  output: string;
}

// 渲染结构化 explanation
function renderExplanation(
  explanation: ExplanationPart[],
  handleLineEnter: (line: number) => void,
  handleLineLeave: () => void,
  handleVarEnter: (varName: string) => void,
  handleVarLeave: () => void
) {
  return explanation.map((part, idx) => {
    if (part.type === 'text') {
      return <span key={idx} dangerouslySetInnerHTML={{ __html: part.content }} />;
    }
    if (part.type === 'hover') {
      // 支持 line 或 var
      if (part.line) {
        return (
          <span
            key={idx}
            onMouseEnter={() => handleLineEnter(part.line!)}
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
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      } else if (part.var) {
        return (
          <span
            key={idx}
            onMouseEnter={() => handleVarEnter(part.var!)}
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
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      } else {
        // 仅内容高亮
        return (
          <span
            key={idx}
            className="underline decoration-dotted"
            style={{
              background: 'rgb(var(--highlight-bg))',
              color: 'rgb(var(--highlight-fg))',
              borderRadius: 2,
              borderLeft: '4px solid rgb(var(--highlight-border))',
              padding: '0 2px',
              transition: 'background 0.3s, border 0.3s, color 0.3s',
            }}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      }
    }
    return null;
  });
}

const ExplanationOutput: React.FC<ExplanationOutputProps> = ({ explanation, output }) => {
  const setHoveredLine = useHoverStore((state) => state.setHoveredLine);
  const setHoveredVar = useHoverStore((state) => state.setHoveredVar);
  return (
    <div className="output-panel panel-card mt-4 p-4 min-h-[100px]">
      <h2 className="panel-title">解释 / 输出</h2>
      <div id="explanationArea" className="comment mt-2 p-2 bg-white border-l-4 border-yellow-400 text-yellow-700 rounded text-sm">
        {Array.isArray(explanation)
          ? renderExplanation(
              explanation,
              (line) => setHoveredLine(line),
              () => setHoveredLine(null),
              (varName) => setHoveredVar(varName),
              () => setHoveredVar(null)
            )
          : <span dangerouslySetInnerHTML={{ __html: explanation }} />}
      </div>
      <pre id="outputArea" className="mt-2 p-2 bg-white text-gray-900 rounded text-sm whitespace-pre-wrap break-words">{output}</pre>
    </div>
  );
};

export default ExplanationOutput; 