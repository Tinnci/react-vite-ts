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

// 新增工具函数：检查元素是否被钉住
function isPinned(element: HoveredElement, pinnedElements: HoveredElement[]): boolean {
  if (!element) return false; // Should not happen with current type usage, but good practice
  return pinnedElements.some(pinned => pinned.type === element.type && pinned.name === element.name);
}

// 渲染结构化 explanation
function renderExplanationPart(
  part: ExplanationPart,
  handleLineEnter: (line: number) => void,
  handleLineLeave: () => void,
  handleElementEnter: (element: HoveredElement) => void,
  handleElementLeave: () => void,
  togglePinElement: (element: HoveredElement) => void,
  hoveredElement: HoveredElement | null,
  pinnedElements: HoveredElement[],
  hoveredLine: number | null,
  idx: number
) {
  if (part.type === 'text') {
    const segments = part.content.split(/(<code>.*?<\/code>)/g);
    return segments.map((seg, i) => {
      if (seg.startsWith('<code>') && seg.endsWith('</code>')) {
        const codeText = seg.slice(6, -7);
        return <code key={i} className="px-1 rounded bg-panel-bg text-panel-var-blue font-mono text-sm">{codeText}</code>;
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: seg }} />;
    });
  }
  if (part.type === 'hover') {
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

    // 构建 HoveredElement 对象，需要根据 part 提供的信息判断类型
    let element: HoveredElement | null = null;
    if (part.var) {
       // For now, assuming 'var' means variable, function, or class based on context/name if needed
       // For simplicity, let's map var to variable type for now, refine later if needed.
       // The actual type might need to come from analysis data, which we don't have here.
       // For now, let's assume a simple mapping or add type info to ExplanationPart if possible.
       // Based on scenes.ts, `var` seems to cover variable, function, class.
       // Let's assume we can derive the type from the name or add it to ExplanationPart.
       // For now, using 'variable' as a placeholder type.
       // TODO: Refine element type derivation based on part content/name or add type to ExplanationPart
       // Check if the name in part.var matches a known pattern for function/class names if necessary.
       // Alternatively, update ExplanationPart interface to include type.
       // For now, let's simplify and pass element object to isPinned/handleElementEnter
       // based on the type derived from context in the calling component (ExplanationOutput).
       // However, renderExplanationPart is where the DOM elements are created, so it's better to handle type here if possible.
       // Let's update ExplanationPart interface to include 'elementType'.
       // For now, proceeding with a simplified approach assuming basic types can be inferred or defaulting to 'variable'.
       // *** Reverting to the simpler assumption for now: element object is constructed in ExplanationOutput and passed down ***
       // Wait, the element object *is* constructed in handleElementEnter. We need to do it here to check pinned state.

       // Let's try to infer type or default
       let elementType: HoveredElement['type'] = 'variable'; // Default
       const lowerName = part.var.toLowerCase();
       if (lowerName.includes('class')) elementType = 'class';
       else if (lowerName.includes('def') || lowerName.includes('()')) elementType = 'function';
       // Add more rules if needed

       element = { type: elementType, name: part.var };

    }
    // TODO: Handle other element types like classes or functions if they are explicitly defined in ExplanationPart

    const isCurrentHovered = hoveredElement && element && hoveredElement.type === element.type && hoveredElement.name === element.name;
    const isCurrentlyPinned = element && isPinned(element, pinnedElements);

    if (part.line) {
      // Line hover logic
      const isLineHovered = hoveredLine === part.line;
      return (
        <span
          key={idx}
          onMouseEnter={() => handleLineEnter(part.line!)}
          onMouseLeave={handleLineLeave}
          onClick={() => { /* TODO: Add click logic for jumping to line if needed */ }}
          className={`explanation-hover explanation-line-hover ${isLineHovered ? 'interactive-highlight' : ''}`}
        >
          {children}
        </span>
      );
    } else if (element) { // Handle variable/function/class hover from 'var' part
      return (
        <span
          key={idx}
          onMouseEnter={() => handleElementEnter(element)}
          onMouseLeave={handleElementLeave}
          onClick={() => togglePinElement(element)}
          className={
            `explanation-hover explanation-var-hover ` +
            `${isCurrentHovered ? 'interactive-highlight' : ''} ` +
            `${isCurrentlyPinned ? 'explanation-pinned-highlight' : ''}`
          }
        >
          {children}
        </span>
      );
    } else {
      // Only content highlight (no specific element/line)
      return (
        <span key={idx} className="explanation-hover">
          {children}
        </span>
      );
    }
  }
  return null;
}

const ExplanationOutput: React.FC<ExplanationOutputProps> = ({ explanation, output }) => {
  const setHoveredLine = useHoverStore((state) => state.setHoveredLine);
  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const setHoveredElement = useHoverStore((state) => state.setHoveredElement);
  const hoveredElement = useHoverStore((state) => state.hoveredElement);
  const pinnedElements = useHoverStore((state) => state.pinnedElements);
  const togglePinElement = useHoverStore((state) => state.togglePinElement);

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
                (element) => togglePinElement(element),
                hoveredElement,
                pinnedElements,
                hoveredLine,
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