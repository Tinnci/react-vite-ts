import React from 'react';

interface ResponsiveTabsProps {
  tab: 'visual' | 'explanation';
  setTab: (tab: 'visual' | 'explanation') => void;
}

const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({ tab, setTab }) => {
  return (
    <div className="flex mb-2 md:hidden">
      <button
        className={`flex-1 py-2 rounded-t-lg border-b-2 transition-all duration-200 ${tab === 'visual' ? 'border-primary text-primary' : 'border-panel-border text-panel-subtitle'}`}
        onClick={() => setTab('visual')}
      >可视化区域</button>
      <button
        className={`flex-1 py-2 rounded-t-lg border-b-2 transition-all duration-200 ${tab === 'explanation' ? 'border-primary text-primary' : 'border-panel-border text-panel-subtitle'}`}
        onClick={() => setTab('explanation')}
      >解释 / 输出</button>
    </div>
  );
};

export default ResponsiveTabs; 