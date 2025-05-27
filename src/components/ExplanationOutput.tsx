import React from 'react';
import { useHoverStore } from '@/lib/hoverStore';
import type { ExplanationPart } from '@/constants/scenes';
import { Panel } from './ui/Panel';

// 新增：导入 HoveredElement 类型
import type { HoveredElement } from '@/lib/hoverStore';

interface ExplanationOutputProps {
  explanation: string | ExplanationPart[];
  output: string;
}

// 渲染结构化 explanation
function renderExplanationPart(
  part: ExplanationPart,
  handleLineEnter: (line: number) => void,
  handleLineLeave: () => void,
  // 修改这里：使用新的 handleElementEnter/Leave
  handleElementEnter: (element: HoveredElement) => void,
  handleElementLeave: () => void,
  idx: number
) {
  if (part.type === 'text') {
    // 解析 <code> 标签为 React 组件
    const segments = part.content.split(/(<code>.*?<\/code>)/g);
    return segments.map((seg, i) => {
      if (seg.startsWith('<code>') && seg.endsWith('</code>')) {
        const codeText = seg.slice(6, -7);
        return <code key={i} className="px-1 rounded bg-panel-bg text-panel-var-blue font-mono text-sm">{codeText}</code>;
      }
      // 处理 <br>
      // 直接渲染 HTML，支持 <br>
      return <span key={i} dangerouslySetInnerHTML={{ __html: seg }} />;
    });
  }
  if (part.type === 'hover') {
    // 解析 <code> 标签为 React 组件
    const segments = part.content.split(/(<code>.*?<\/code>)/g);
    const children = segments.map((seg, i) => {
      if (seg.startsWith('<code>') && seg.endsWith('</code>')) {
        const codeText = seg.slice(6, -7);
        // TODO: 为 code 标签内的文本添加悬停事件，联动 hoveredElement
        return <code key={i} className="px-1 rounded bg-panel-bg text-panel-var-blue font-mono text-sm">{codeText}</code>;
      }
      if (seg === '<br>' || seg === '<br/>') return <br key={i} />;
      return <span key={i}>{seg}</span>;
    });
    if (part.line) {
      return (
        <span
          key={idx}
          onMouseEnter={() => handleLineEnter(part.line!)}
          onMouseLeave={handleLineLeave}
          className="explanation-hover explanation-line-hover"
        >
          {children}
        </span>
      );
    } else if (part.var) {
      return (
        <span
          key={idx}
          onMouseEnter={() => handleElementEnter({ type: 'variable', name: part.var! })}
          onMouseLeave={handleElementLeave}
          className="explanation-hover explanation-var-hover"
        >
          {children}
        </span>
      );
    } else {
      // 仅内容高亮
      return (
        <span
          key={idx}
          className="explanation-hover"
        >
          {children}
        </span>
      );
    }
  }
  return null;
}

const ExplanationOutput: React.FC<ExplanationOutputProps> = ({ explanation, output }) => {
  const setHoveredLine = useHoverStore((state) => state.setHoveredLine);
  // const setHoveredVar = useHoverStore((state) => state.setHoveredVar); // 移除旧的 setHoveredVar
  // 新增：获取 setHoveredElement
  const setHoveredElement = useHoverStore((state) => state.setHoveredElement);

  return (
    <Panel className="output-panel mt-4 p-4 min-h-[100px]">
      <h2 className="panel-title">解释 / 输出</h2>
      <div id="explanationArea" className="comment mt-2 p-2 bg-panel-bg text-foreground border-l-4 border-yellow-400 rounded text-sm">
        {Array.isArray(explanation)
          ? explanation.map((part, idx) =>
              renderExplanationPart(
                part,
                (line) => setHoveredLine(line),
                () => setHoveredLine(null),
                (element) => setHoveredElement(element),
                () => setHoveredElement(null),
                idx
              )
            )
          : explanation}
      </div>
      <pre id="outputArea" className="mt-2 p-2 bg-panel-bg text-foreground rounded text-sm whitespace-pre-wrap break-words">{output}</pre>
    </Panel>
  );
};

export default ExplanationOutput; 