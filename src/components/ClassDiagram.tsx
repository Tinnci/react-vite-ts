import React from 'react';
import Diagram from './Diagram';

interface ClassDiagramProps {
  className: string;
  vars: { [key: string]: any };
  inheritsFrom?: string;
  highlightedVars?: string[];
}

const ClassDiagram: React.FC<ClassDiagramProps> = ({ className, vars, inheritsFrom, highlightedVars = [] }) => {
  return (
    <Diagram
      title={`类: ${className}`}
      varTypeLabel="(类变量)"
      vars={vars}
      highlightedVars={highlightedVars}
      className=""
      layoutIdPrefix={`var-${className}-`}
      inheritsFrom={inheritsFrom}
    />
  );
};

export default ClassDiagram; 