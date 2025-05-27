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
import ProgressBar from '@/components/ProgressBar';
import SceneOutline from '@/components/SceneOutline';
import StepControls from '@/components/StepControls';
import ResponsiveTabs from '@/components/ResponsiveTabs';

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
    <div className="container mx-auto p-8 bg-background text-foreground rounded-lg shadow-lg">
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
      <ProgressBar currentSceneIndex={currentSceneIndex} totalScenes={scenes.length} />

      <StepControls
        onReset={handleReset}
        onPrev={handlePrev}
        onNext={handleNext}
        currentSceneIndex={currentSceneIndex}
        totalScenes={scenes.length}
      />

      <SceneOutline
        scenes={scenes}
        currentSceneIndex={currentSceneIndex}
        onSelectScene={(idx) => dispatch({ type: 'GOTO_SCENE', sceneIndex: idx })}
      />

      <div className="content-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="code-panel panel-card p-6">
          <h2 className="panel-title">Python 代码</h2>
          <CodePanel code={fullPythonCode} highlightedLines={currentScene.highlightLines} />
        </div>
        <motion.div layout transition={{ duration: 0.5, type: 'spring' }} className="right-panel flex flex-col gap-6">
          <ResponsiveTabs tab={tab} setTab={setTab} />
          {/* 可视化区域：移动端下 tab 控制显示，PC 端始终显示 */}
          <div className={`visualization-panel panel-card p-6 ${tab !== 'visual' ? 'hidden' : ''} md:block`}>
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
          <div className={`explanation-output-panel panel-card p-6 ${tab !== 'explanation' ? 'hidden' : ''} md:block`}>
            <ExplanationOutput explanation={currentScene.explanation} output={currentOutput || ""} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
