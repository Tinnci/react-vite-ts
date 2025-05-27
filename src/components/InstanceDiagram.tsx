import React from 'react';
import Diagram from './Diagram';

interface InstanceDiagramProps {
  instanceName: string;
  className: string;
  vars: { [key: string]: any };
  highlightedVars?: string[];
}

const InstanceDiagram: React.FC<InstanceDiagramProps> = ({ instanceName, className, vars, highlightedVars = [] }) => {
  return (
    <Diagram
      title={`实例: ${instanceName} (类型: ${className})`}
      varTypeLabel="(实例变量)"
      vars={vars}
      highlightedVars={highlightedVars}
      className=""
      layoutIdPrefix={`var-${className}-`}
    />
  );
};

export default InstanceDiagram; 