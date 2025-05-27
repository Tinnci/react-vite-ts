import React from 'react';

interface ProgressBarProps {
  currentSceneIndex: number;
  totalScenes: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentSceneIndex, totalScenes }) => {
  return (
    <div className="w-full bg-panel-border rounded-full h-2.5 mb-4">
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${((currentSceneIndex + 1) / totalScenes) * 100}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar; 