import React from 'react';
import { motion } from 'framer-motion';
import { useHoverStore } from '@/lib/hoverStore';
import type { HoveredElement } from '@/lib/hoverStore';

interface DiagramProps {
  title: string;
  varTypeLabel: string;
  vars: { [key: string]: any };
  highlightedVars?: string[];
  className?: string;
  layoutIdPrefix?: string;
  inheritsFrom?: string;
}

function isPinned(element: HoveredElement, pinnedElements: HoveredElement[]): boolean {
  if (!element) return false;
  return pinnedElements.some(pinned => 
    pinned.type === 'variable' && pinned.name === element.name
  );
}

const Diagram: React.FC<DiagramProps> = ({ title, varTypeLabel, vars, highlightedVars = [], className = '', layoutIdPrefix = '', inheritsFrom }) => {
  const hoveredElement = useHoverStore((state) => state.hoveredElement);
  const setHoveredElement = useHoverStore((state) => state.setHoveredElement);
  const pinnedElements = useHoverStore((state) => state.pinnedElements);
  const togglePinElement = useHoverStore((state) => state.togglePinElement);

  return (
    <div className={`namespace-box bg-panel-bg text-foreground border border-panel-border rounded-lg mb-4 min-w-0 ${className}`}>
      <h3 className="panel-subtitle">
        {title} {inheritsFrom && `(继承自 ${inheritsFrom})`}
      </h3>
      {Object.entries(vars).map(([name, value]) => {
        const element: HoveredElement = { type: 'variable', name: name };
        const isCurrentlyPinned = isPinned(element, pinnedElements);

        return (
          <motion.div
            key={name}
            layoutId={`${layoutIdPrefix}${name}`}
            className={
              `var mb-1 font-mono text-sm ` +
              `${(
                highlightedVars.includes(name) ||
                (hoveredElement && hoveredElement.type === 'variable' && hoveredElement.name === name)
              ) ? 'var-highlight' : ''} ` +
              `${isCurrentlyPinned ? 'var-pinned-highlight' : ''}`
            }
            onMouseEnter={() => setHoveredElement(element)}
            onMouseLeave={() => setHoveredElement(null)}
            onClick={() => togglePinElement(element)}
          >
            <span className="var-blue">{name}:</span>{' '}
            <span className="var-red">{JSON.stringify(value)}</span>{' '}
            <span className="var-gray">{varTypeLabel}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Diagram; 