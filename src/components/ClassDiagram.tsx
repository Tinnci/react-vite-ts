import React from 'react';

interface ClassDiagramProps {
  className: string;
  vars: { [key: string]: any };
  inheritsFrom?: string;
  highlightedVars?: string[];
}

const ClassDiagram: React.FC<ClassDiagramProps> = ({ className, vars, inheritsFrom, highlightedVars = [] }) => {
  return (
    <div className="namespace-box panel-card mb-4">
      <h3 className="panel-subtitle">
        类: {className} {inheritsFrom && `(继承自 ${inheritsFrom})`}
      </h3>
      {
        Object.entries(vars).map(([name, value]) => (
          <div
            key={name}
            className={`var mb-1 font-mono text-sm ${highlightedVars.includes(name) ? 'var-highlight' : ''}`}
          >
            <span className="var-blue">{name}:</span>{' '}
            <span className="var-red">{JSON.stringify(value)}</span>{' '}
            <span className="var-gray">(类变量)</span>
          </div>
        ))
      }
    </div>
  );
};

export default ClassDiagram; 