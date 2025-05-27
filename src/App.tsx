import React, { useReducer } from 'react';
import { fullPythonCode } from '@/constants/pythonCode';
import CodePanel from '@/components/CodePanel';
import ClassDiagram from '@/components/ClassDiagram';
import InstanceDiagram from '@/components/InstanceDiagram';
import ExplanationOutput from '@/components/ExplanationOutput';
import { scenes } from '@/constants/scenes';
import { vizReducer, initialVizState, VizState } from '@/state/vizReducer';

function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = React.useState(0);
  const [vizState, dispatch] = useReducer(vizReducer, initialVizState);

  // 处理场景切换
  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      const nextIndex = currentSceneIndex + 1;
      dispatch({ type: 'GOTO_SCENE', sceneIndex: nextIndex });
      setCurrentSceneIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      const prevIndex = currentSceneIndex - 1;
      dispatch({ type: 'GOTO_SCENE', sceneIndex: prevIndex });
      setCurrentSceneIndex(prevIndex);
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setCurrentSceneIndex(0);
  };

  // Generate output based on the current vizState
  const currentOutput = React.useMemo(() => {
    const scene = scenes[currentSceneIndex];
    if (scene.output !== "") {
      return scene.output;
    }

    const d1StatusVal = (vizState.d1 && vizState.d1.status) ? vizState.d1.status : (vizState.Device?.status || 'N/A');
    const d2StatusVal = (vizState.d2 && vizState.d2.status) ? vizState.d2.status : (vizState.Device?.status || 'N/A');
    const sd1StatusVal = (vizState.sd1 && vizState.sd1.status) ? vizState.sd1.status : (vizState.SmartDevice?.status || vizState.Device?.status || 'N/A');
    const deviceStatusVal = vizState.Device?.status || 'N/A';
    const smartDeviceStatusVal = vizState.SmartDevice?.status || 'N/A (继承自 Device)';
    const sharedLog = Array.isArray(vizState.Device?.shared_log) ? vizState.Device.shared_log.join(', ') : '';
    const sd1IpAddress = vizState.sd1?.ip_address || 'N/A';
    const smartDeviceSoftwareVersion = vizState.SmartDevice?.software_version || 'N/A';
    const totalDevices = vizState.Device?.device_count || 0;

    switch (currentSceneIndex) {
      case 8:
        return `d1.location 现在是 ${vizState.d1?.location || 'N/A'}\nd2.location 仍然是 ${vizState.d2?.location || 'N/A'}`;
      case 9:
        return `d1.status (实例变量): ${d1StatusVal}\nDevice.status (类变量): ${deviceStatusVal}\nd2.status (访问类变量): ${d2StatusVal}`;
      case 10:
        return `d1.status: ${d1StatusVal}\nd2.status: ${d2StatusVal}\nDevice.status: ${deviceStatusVal}`;
      case 11:
        return `Device.shared_log: [${sharedLog}]`;
      case 13:
        return `SmartDevice.software_version: ${smartDeviceSoftwareVersion}`;
      case 14:
        return `sd1.status (访问 SmartDevice.status): ${sd1StatusVal}\nDevice.status: ${deviceStatusVal}\nSmartDevice.status: ${smartDeviceStatusVal}\nd2.status (访问 Device.status): ${d2StatusVal}`;
      case 15:
        return (
          `d1 info: ID: ${vizState.d1?.device_id || 'N/A'}, Loc: ${vizState.d1?.location || 'N/A'}, Status: ${d1StatusVal}
d2 info: ID: ${vizState.d2?.device_id || 'N/A'}, Loc: ${vizState.d2?.location || 'N/A'}, Status: ${d2StatusVal}
sd1 info: ID: ${vizState.sd1?.device_id || 'N/A'}, Loc: ${vizState.sd1?.location || 'N/A'}, Status: ${sd1StatusVal}, IP: ${sd1IpAddress}, SW: ${smartDeviceSoftwareVersion}
Total devices: ${totalDevices}
Device class status: ${deviceStatusVal}
SmartDevice class status: ${smartDeviceStatusVal}
Shared Log: [${sharedLog}]`
        );
      default:
        return "";
    }
  }, [currentSceneIndex, scenes, vizState.Device?.device_count, vizState.Device.shared_log, vizState.Device?.status, vizState.SmartDevice?.software_version, vizState.SmartDevice?.status, vizState.d1, vizState.d2, vizState.sd1]);

  const currentScene = scenes[currentSceneIndex];

  return (
    <div className="container mx-auto p-8 bg-white text-gray-900 rounded-lg shadow-lg">
      <div className="header text-center mb-6">
        <h1 className="panel-title">Python OOP 动画演示：类的创建与初始化</h1>
      </div>

      <div className="controls text-center mb-6">
        <button onClick={handleReset} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">重置</button>
        <button onClick={handlePrev} className="bg-blue-500 text-white px-4 py-2 rounded mr-2" disabled={currentSceneIndex === 0}>上一步</button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={currentSceneIndex === scenes.length - 1}>下一步</button>
      </div>

      <div className="content-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="code-panel panel-card p-6 min-h-[400px]">
          <h2 className="panel-title">Python 代码</h2>
          <CodePanel code={fullPythonCode} highlightedLines={currentScene.highlightLines} />
        </div>
        <div className="right-panel flex flex-col gap-6">
          <div className="visualization-panel panel-card p-6 min-h-[400px]">
            <h2 className="panel-title">可视化区域</h2>
            <div id="classDiagrams">
              {vizState.Device && <ClassDiagram className="Device" vars={vizState.Device} highlightedVars={currentScene.highlightedVars || []} />}
              {vizState.SmartDevice && <ClassDiagram className="SmartDevice" vars={vizState.SmartDevice} inheritsFrom="Device" highlightedVars={currentScene.highlightedVars || []} />}
            </div>
            <div id="instanceDiagrams">
              {vizState.d1 && <InstanceDiagram instanceName="d1" className="Device" vars={vizState.d1} highlightedVars={currentScene.highlightedVars || []} />}
              {vizState.d2 && <InstanceDiagram instanceName="d2" className="Device" vars={vizState.d2} highlightedVars={currentScene.highlightedVars || []} />}
              {vizState.sd1 && <InstanceDiagram instanceName="sd1" className="SmartDevice" vars={vizState.sd1} highlightedVars={currentScene.highlightedVars || []} />}
            </div>
          </div>
          <div className="explanation-output-panel panel-card p-6 min-h-[400px]">
            <ExplanationOutput explanation={currentScene.explanation} output={currentOutput} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
