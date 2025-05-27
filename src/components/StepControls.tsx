import React from 'react';
import { Button } from './ui/Button';

interface StepControlsProps {
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentSceneIndex: number;
  totalScenes: number;
}

const StepControls: React.FC<StepControlsProps> = ({ onReset, onPrev, onNext, currentSceneIndex, totalScenes }) => {
  return (
    <div className="controls text-center mb-6">
      <Button onClick={onReset} className="mr-2" variant="outline">重置</Button>
      <Button onClick={onPrev} className="mr-2" disabled={currentSceneIndex === 0}>上一步</Button>
      <Button onClick={onNext} disabled={currentSceneIndex === totalScenes - 1}>下一步</Button>
    </div>
  );
};

export default StepControls; 