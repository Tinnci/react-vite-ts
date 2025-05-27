import { useReducer, useState, useEffect } from 'react';
import { fullPythonCode } from '@/constants/pythonCode';
import CodePanel from '@/components/CodePanel';
import ClassDiagram from '@/components/ClassDiagram';
import InstanceDiagram from '@/components/InstanceDiagram';
import ExplanationOutput from '@/components/ExplanationOutput';
import { scenes } from '@/constants/scenes';
import { vizReducer, initialVizState } from '@/state/vizReducer';
import { Button } from '@/components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from '@/lib/themeStore';

function App() {
  const [vizState, dispatch] = useReducer(vizReducer, initialVizState);
  const currentSceneIndex = vizState.currentSceneIndex;
  const [tab, setTab] = useState<'visual' | 'explanation'>('visual');
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // 监听 theme，自动为 <body> 添加/移除 dark 类
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }, [theme]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentSceneIndex < scenes.length - 1) {
          dispatch({ type: 'GOTO_SCENE', sceneIndex: currentSceneIndex + 1 });
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentSceneIndex > 0) {
          dispatch({ type: 'GOTO_SCENE', sceneIndex: currentSceneIndex - 1 });
        }
      } else if (window.innerWidth < 768 && (e.key === 'Tab')) {
        e.preventDefault();
        setTab(tab === 'visual' ? 'explanation' : 'visual');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIndex, tab]);

  // 处理场景切换
  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      dispatch({ type: 'GOTO_SCENE', sceneIndex: currentSceneIndex + 1 });
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      dispatch({ type: 'GOTO_SCENE', sceneIndex: currentSceneIndex - 1 });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  // Generate output based on the current vizState
  const currentOutput = scenes[currentSceneIndex].getOutput(vizState);

  const currentScene = scenes[currentSceneIndex];

  return (
    <div className="container mx-auto p-8 bg-white text-gray-900 rounded-lg shadow-lg">
      <div className="header text-center mb-6 flex flex-col items-center gap-2">
        <h1 className="panel-title">Python OOP 动画演示：类的创建与初始化</h1>
        <Button onClick={toggleTheme} variant="outline" size="sm">
          {theme === 'dark' ? '🌙 暗色模式' : '☀️ 亮色模式'}
        </Button>
      </div>

      {/* 进度指示器 */}
      <div className="mb-2 text-center text-sm text-panel-subtitle">
        步骤 {currentSceneIndex + 1} / {scenes.length}
      </div>
      {/* 顶部进度条 */}
      <div className="w-full bg-panel-border rounded-full h-2.5 mb-4">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentSceneIndex + 1) / scenes.length) * 100}%` }}
        ></div>
      </div>

      <div className="controls text-center mb-6">
        <Button onClick={handleReset} className="mr-2">重置</Button>
        <Button onClick={handlePrev} className="mr-2" disabled={currentSceneIndex === 0}>上一步</Button>
        <Button onClick={handleNext} disabled={currentSceneIndex === scenes.length - 1}>下一步</Button>
      </div>

      {/* 场景目录/大纲 */}
      <div className="scene-outline flex flex-wrap justify-center gap-2 mb-6">
        {scenes.map((scene, idx) => (
          <button
            key={scene.title}
            className={`px-3 py-1 rounded text-xs border transition-all duration-200 ${idx === currentSceneIndex ? 'bg-primary text-white border-primary' : 'bg-panel-bg text-panel-subtitle border-panel-border hover:bg-primary/10'}`}
            style={{ fontWeight: idx === currentSceneIndex ? 'bold' : 'normal' }}
            onClick={() => {
              dispatch({ type: 'GOTO_SCENE', sceneIndex: idx });
            }}
          >
            {idx + 1}. {scene.title}
          </button>
        ))}
      </div>

      <div className="content-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="code-panel panel-card p-6 min-h-[400px]">
          <h2 className="panel-title">Python 代码</h2>
          <CodePanel code={fullPythonCode} highlightedLines={currentScene.highlightLines} />
        </div>
        <div className="right-panel flex flex-col gap-6">
          {/* 移动端 Tab 切换器，仅在 md 以下显示 */}
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
          {/* 可视化区域：移动端下 tab 控制显示，PC 端始终显示 */}
          <div className={`visualization-panel panel-card p-6 min-h-[300px] md:min-h-[400px] ${tab !== 'visual' ? 'hidden' : ''} md:block`}>
            <h2 className="panel-title">可视化区域</h2>
            <div id="classDiagrams">
              <AnimatePresence>
                {vizState.Device && (
                  <motion.div
                    key="Device"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClassDiagram className="Device" vars={vizState.Device} highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
                {vizState.SmartDevice && (
                  <motion.div
                    key="SmartDevice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClassDiagram className="SmartDevice" vars={vizState.SmartDevice} inheritsFrom="Device" highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div id="instanceDiagrams">
              <AnimatePresence>
                {vizState.d1 && (
                  <motion.div
                    key="d1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InstanceDiagram instanceName="d1" className="Device" vars={vizState.d1} highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
                {vizState.d2 && (
                  <motion.div
                    key="d2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InstanceDiagram instanceName="d2" className="Device" vars={vizState.d2} highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
                {vizState.sd1 && (
                  <motion.div
                    key="sd1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InstanceDiagram instanceName="sd1" className="SmartDevice" vars={vizState.sd1} highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* 解释/输出区域：移动端下 tab 控制显示，PC 端始终显示 */}
          <div className={`explanation-output-panel panel-card p-6 min-h-[300px] md:min-h-[400px] ${tab !== 'explanation' ? 'hidden' : ''} md:block`}>
            <ExplanationOutput explanation={currentScene.explanation} output={currentOutput || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
