import { useEffect, useState } from 'react';
import CodePanel from '@/components/CodePanel';
import ClassDiagram from '@/components/ClassDiagram';
import InstanceDiagram from '@/components/InstanceDiagram';
import ExplanationOutput from '@/components/ExplanationOutput';
import { scenes } from '@/constants/scenes';
import { useVizStore } from '@/state/vizStore';
import { Button } from '@/components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from '@/lib/themeStore';
import ProgressBar from '@/components/ProgressBar';
import SceneOutline from '@/components/SceneOutline';
import StepControls from '@/components/StepControls';
import ResponsiveTabs from '@/components/ResponsiveTabs';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import { fullPythonCode } from './constants/pythonCode';

function App() {
  // 替换 useReducer
  const {
    currentSceneIndex,
    Device,
    SmartDevice,
    d1,
    d2,
    sd1,
    gotoScene,
    reset,
  } = useVizStore();
  const [tab, setTab] = useState<'visual' | 'explanation'>('visual');
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const analyzeCode = useCodeAnalysisStore((state) => state.analyzeCode);
  const isAnalyzing = useCodeAnalysisStore((state) => state.isLoading);
  const statusMessage = useCodeAnalysisStore((state) => state.statusMessage);
  const error = useCodeAnalysisStore((state) => state.error);

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
          gotoScene(currentSceneIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentSceneIndex > 0) {
          gotoScene(currentSceneIndex - 1);
        }
      }
      // 移除对 Tab 键的特殊处理，交给 CodeMirror
      // else if (window.innerWidth < 768 && (e.key === 'Tab')) {
      //   e.preventDefault();
      //   setTab(tab === 'visual' ? 'explanation' : 'visual');
      // }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIndex, tab, gotoScene]);

  // 处理场景切换
  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      gotoScene(currentSceneIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      gotoScene(currentSceneIndex - 1);
    }
  };

  const handleReset = () => {
    reset();
  };

  // Generate output based on the current vizState
  const vizState = { currentSceneIndex, Device, SmartDevice, d1, d2, sd1 };
  const currentOutput = scenes[currentSceneIndex].getOutput(vizState);
  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    // 移除这里的 analyzeCode 调用，analyzeCode 应该在 vizStore 的 transformState 中根据需要触发
    // 或者有一个专门的 effect 来监听代码变化并触发分析
    analyzeCode(fullPythonCode);
  }, [analyzeCode]);

  useEffect(() => {
    console.log('[App] isAnalyzing', isAnalyzing);
  }, [isAnalyzing]);

  return (
    <div className="container mx-auto p-8 bg-background text-foreground rounded-lg shadow-lg">
      {/* 状态与错误提示 */}
      {statusMessage && (
        <div className="mb-4 text-center text-sm text-blue-600 dark:text-blue-300">{statusMessage}</div>
      )}
      {error && (
        <div className="mb-4 text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 rounded p-2 border border-red-200 dark:border-red-700">
          <strong>分析出错：</strong> {error}
        </div>
      )}
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
        onSelectScene={(idx) => gotoScene(idx)}
      />

      <div className="content-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="code-panel panel-card p-6">
          <h2 className="panel-title">Python 代码 {isAnalyzing && '(分析中...)'}</h2>
          <CodePanel pythonCode={fullPythonCode} />
        </div>
        <motion.div layout transition={{ duration: 0.5, type: 'spring' }} className="right-panel flex flex-col gap-6">
          <ResponsiveTabs tab={tab} setTab={setTab} />
          {/* 可视化区域：移动端下 tab 控制显示，PC 端始终显示 */}
          <div className={`visualization-panel panel-card p-6 ${tab !== 'visual' ? 'hidden' : ''} md:block`}>
            <h2 className="panel-title">可视化区域</h2>
            <div id="classDiagrams">
              <AnimatePresence>
                {Device && (
                  <motion.div
                    key="Device"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 这里的 highlightedVars 也需要调整，但 ClassDiagram 组件可能仍需要它来高亮类或变量 */}
                    <ClassDiagram className="Device" vars={Device} highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
                {SmartDevice && (
                  <motion.div
                    key="SmartDevice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClassDiagram className="SmartDevice" vars={SmartDevice} inheritsFrom="Device" highlightedVars={currentScene.highlightedVars || []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div id="instanceDiagrams">
              <AnimatePresence>
                {[d1, d2, sd1].map((value, idx) => {
                  if (value && typeof value === 'object' && 'device_id' in value) {
                    let className = 'Device';
                    if ('ip_address' in value) className = 'SmartDevice';
                    const key = ['d1', 'd2', 'sd1'][idx];
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <InstanceDiagram
                          instanceName={key}
                          className={className}
                          vars={value}
                          highlightedVars={currentScene.highlightedVars || []}
                        />
                      </motion.div>
                    );
                  }
                  return null;
                })}
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
