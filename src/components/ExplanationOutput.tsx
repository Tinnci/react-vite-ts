import React from 'react';
import { useHoverStore } from '@/lib/hoverStore';

interface ExplanationOutputProps {
  explanation: string;
  output: string;
}

const ExplanationOutput: React.FC<ExplanationOutputProps> = ({ explanation, output }) => {
  const handleMouseEnter = (line: number) => useHoverStore.getState().setHoveredLine(line);
  const handleMouseLeave = () => useHoverStore.getState().setHoveredLine(null);

  return (
    <div className="output-panel panel-card mt-4 p-4 min-h-[100px]">
      <h2 className="panel-title">解释 / 输出</h2>
      <div id="explanationArea" className="comment mt-2 p-2 bg-white border-l-4 border-yellow-400 text-yellow-700 rounded text-sm" dangerouslySetInnerHTML={{ __html: explanation }}>
        <span
          onMouseEnter={() => handleMouseEnter(12)}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer underline decoration-dotted"
        >
          变量名
        </span>
      </div>
      <pre id="outputArea" className="mt-2 p-2 bg-white text-gray-900 rounded text-sm whitespace-pre-wrap break-words">{output}</pre>
    </div>
  );
};

export default ExplanationOutput; 