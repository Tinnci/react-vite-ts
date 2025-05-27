import React from 'react';

interface SceneOutlineProps {
  scenes: { title: string }[];
  currentSceneIndex: number;
  onSelectScene: (idx: number) => void;
}

const SceneOutline: React.FC<SceneOutlineProps> = ({ scenes, currentSceneIndex, onSelectScene }) => {
  return (
    <div className="scene-outline flex flex-wrap justify-center gap-2 mb-6">
      {scenes.map((scene, idx) => (
        <button
          key={scene.title}
          className={`px-3 py-1 rounded text-xs border transition-all duration-200 ${idx === currentSceneIndex ? 'bg-primary text-white border-primary' : 'bg-panel-bg text-panel-subtitle border-panel-border hover:bg-primary/10'}`}
          style={{ fontWeight: idx === currentSceneIndex ? 'bold' : 'normal' }}
          onClick={() => onSelectScene(idx)}
        >
          {idx + 1}. {scene.title}
        </button>
      ))}
    </div>
  );
};

export default SceneOutline;
