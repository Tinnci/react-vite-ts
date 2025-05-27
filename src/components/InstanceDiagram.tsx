import React from 'react';
import { motion } from 'framer-motion';

interface InstanceDiagramProps {
  instanceName: string;
  className: string;
  vars: { [key: string]: any };
  highlightedVars?: string[];
}

const InstanceDiagram: React.FC<InstanceDiagramProps> = ({ instanceName, className, vars, highlightedVars = [] }) => {
  return (
    <div className="namespace-box panel-card mb-4 min-w-0">
      <h3 className="panel-subtitle">
        实例: {instanceName} (类型: {className})
      </h3>
      {
        Object.entries(vars).map(([name, value]) => (
          <motion.div
            key={name}
            layoutId={`var-${className}-${name}`}
            className={`var mb-1 font-mono text-sm ${highlightedVars.includes(name) ? 'var-highlight' : ''}`}
          >
            <span className="var-blue">{name}:</span>{' '}
            <span className="var-red">{JSON.stringify(value)}</span>{' '}
            <span className="var-gray">(实例变量)</span>
          </motion.div>
        ))
      }
    </div>
  );
};

export default InstanceDiagram; 