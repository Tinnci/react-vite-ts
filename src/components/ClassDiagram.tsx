import React from 'react';
import { motion } from 'framer-motion';
import { useHoverStore } from '@/lib/hoverStore';

interface ClassDiagramProps {
  className: string;
  vars: { [key: string]: any };
  inheritsFrom?: string;
  highlightedVars?: string[];
}

const ClassDiagram: React.FC<ClassDiagramProps> = ({ className, vars, inheritsFrom, highlightedVars = [] }) => {
  const hoveredVar = useHoverStore((state) => state.hoveredVar);
  const setHoveredVar = useHoverStore((state) => state.setHoveredVar);

  return (
    <div className="namespace-box panel-card mb-4 min-w-0">
      <h3 className="panel-subtitle">
        类: {className} {inheritsFrom && `(继承自 ${inheritsFrom})`}
      </h3>
      {
        Object.entries(vars).map(([name, value]) => (
          <motion.div
            key={name}
            layoutId={`var-${className}-${name}`}
            className={`var mb-1 font-mono text-sm ${(highlightedVars.includes(name) || hoveredVar === name) ? 'var-highlight' : ''}`}
            onMouseEnter={() => setHoveredVar(name)}
            onMouseLeave={() => setHoveredVar(null)}
          >
            <span className="var-blue">{name}:</span>{' '}
            <span className="var-red">{JSON.stringify(value)}</span>{' '}
            <span className="var-gray">(类变量)</span>
          </motion.div>
        ))
      }
    </div>
  );
};

export default ClassDiagram; 