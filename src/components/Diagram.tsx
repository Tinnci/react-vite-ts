import React from 'react';
import { motion } from 'framer-motion';
import { useHoverStore } from '@/lib/hoverStore';

interface DiagramProps {
  title: string;
  varTypeLabel: string;
  vars: { [key: string]: any };
  highlightedVars?: string[];
  className?: string;
  layoutIdPrefix?: string;
  inheritsFrom?: string;
}

const Diagram: React.FC<DiagramProps> = ({ title, varTypeLabel, vars, highlightedVars = [], className = '', layoutIdPrefix = '', inheritsFrom }) => {
  const hoveredVar = useHoverStore((state) => state.hoveredVar);
  const setHoveredVar = useHoverStore((state) => state.setHoveredVar);
  return (
    <div className={`namespace-box bg-panel-bg text-foreground border border-panel-border rounded-lg mb-4 min-w-0 ${className}`}>
      <h3 className="panel-subtitle">
        {title} {inheritsFrom && `(继承自 ${inheritsFrom})`}
      </h3>
      {Object.entries(vars).map(([name, value]) => (
        <motion.div
          key={name}
          layoutId={`${layoutIdPrefix}${name}`}
          className={`var mb-1 font-mono text-sm ${(highlightedVars.includes(name) || hoveredVar === name) ? 'var-highlight' : ''}`}
          onMouseEnter={() => setHoveredVar(name)}
          onMouseLeave={() => setHoveredVar(null)}
        >
          <span className="var-blue">{name}:</span>{' '}
          <span className="var-red">{JSON.stringify(value)}</span>{' '}
          <span className="var-gray">{varTypeLabel}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default Diagram; 