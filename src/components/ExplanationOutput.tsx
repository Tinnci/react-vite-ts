import React from 'react';
import { useHoverStore } from '@/lib/hoverStore';

interface ExplanationOutputProps {
  explanation: string;
  output: string;
}

// 解析 <hover-target line={x}>内容</hover-target> 并动态渲染
function parseExplanation(explanation: string, handleMouseEnter: (line: number) => void, handleMouseLeave: () => void) {
  const regex = /<hover-target line={(\d+)}>([\s\S]*?)<\/hover-target>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(explanation)) !== null) {
    const [full, lineStr, content] = match;
    const line = parseInt(lineStr, 10);
    // 添加前面的普通文本
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} dangerouslySetInnerHTML={{ __html: explanation.slice(lastIndex, match.index) }} />
      );
    }
    // 添加高亮交互部分
    parts.push(
      <span
        key={key++}
        onMouseEnter={() => handleMouseEnter(line)}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer underline decoration-dotted text-yellow-700"
        style={{ background: '#fffbe6', borderRadius: 2, padding: '0 2px' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
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
  const handleMouseEnter = (line: number) => useHoverStore.getState().setHoveredLine(line);
  const handleMouseLeave = () => useHoverStore.getState().setHoveredLine(null);

  return (
    <div className="output-panel panel-card mt-4 p-4 min-h-[100px]">
      <h2 className="panel-title">解释 / 输出</h2>
      <div id="explanationArea" className="comment mt-2 p-2 bg-white border-l-4 border-yellow-400 text-yellow-700 rounded text-sm">
        {parseExplanation(explanation, handleMouseEnter, handleMouseLeave)}
      </div>
      <pre id="outputArea" className="mt-2 p-2 bg-white text-gray-900 rounded text-sm whitespace-pre-wrap break-words">{output}</pre>
    </div>
  );
};

export default ExplanationOutput; 