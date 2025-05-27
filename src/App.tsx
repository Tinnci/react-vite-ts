import React, { useState } from 'react';
import { fullPythonCode } from '@/constants/pythonCode';
import CodePanel from '@/components/CodePanel';
import ClassDiagram from '@/components/ClassDiagram';
import InstanceDiagram from '@/components/InstanceDiagram';
import ExplanationOutput from '@/components/ExplanationOutput';

// Define the structure of the visualization state
interface VizState {
  Device: { status: string; device_count: number; shared_log: string[] };
  SmartDevice: { software_version: string; status?: string }; // status is optional
  d1: { device_id: string; location: string; status?: string } | null;
  d2: { device_id: string; location: string; status?: string } | null;
  sd1: { device_id: string; location: string; ip_address: string; status?: string } | null;
}

function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [vizState, setVizState] = useState<VizState>(() => ({
    Device: { status: '"Offline"', device_count: 0, shared_log: [] },
    SmartDevice: { software_version: '"1.0"' },
    d1: null,
    d2: null,
    sd1: null,
  }));

  // Migrate the scenes data structure. Actions need to be refactored
  // to update React state instead of directly manipulating the DOM.
  const scenes = [
    { // Scene 0: Initial state - Class Definition
        highlightLines: [1, 2, 3, 4, 5, 6],
        highlightedVars: ["status", "device_count", "shared_log"],
        explanation: "定义 <code>Device</code> 类及其类变量：<code>status</code>, <code>device_count</code>, <code>shared_log</code>。这些变量属于类本身。",
        output: "",
        action: (prevState: VizState) => {
            // TODO: Refactor this action to update vizState using setVizState
            console.log('Executing Scene 0 action', prevState);
             const newState = deepClone(prevState);
             newState.Device = { status: '"Offline"', device_count: 0, shared_log: [] };
             return newState;
        }
    },
    { // Scene 1: __init__ definition
        highlightLines: [7, 8, 9, 10, 11, 12, 13],
        explanation: "定义 <code>Device</code> 类的构造方法 <code>__init__</code>。当创建实例时，此方法会被调用。<code>self</code> 是对新创建实例的引用。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 1 action', prevState);
            return prevState;
        }
    },
    { // Scene 2: @classmethod definitions
        highlightLines: [15, 16, 17, 18, 19, 20, 21],
         explanation: "定义类方法 <code>get_device_count</code> 和 <code>change_global_status</code>。<code>@classmethod</code> 装饰器使其第一个参数 <code>cls</code> 引用类本身。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 2 action', prevState);
            return prevState;
        }
    },
    { // Scene 3: Instance method definitions
        highlightLines: [22, 23, 24, 25, 26, 27, 28, 29, 30],
        explanation: "定义实例方法 <code>get_info</code> 和 <code>log_activity</code>。这些方法通过 <code>self</code> 操作实例数据或类数据。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 3 action', prevState);
            return prevState;
        }
    },
    { // Scene 4: SmartDevice Class Definition (Inheritance)
        highlightLines: [32, 33, 34],
        explanation: "定义 <code>SmartDevice</code> 类，它继承自 <code>Device</code> 类。<code>SmartDevice</code> 拥有自己的类变量 <code>software_version</code>，并继承 <code>Device</code> 的所有属性和方法。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 4 action', prevState);
             const newState = deepClone(prevState);
             newState.SmartDevice = { software_version: '"1.0"' };
             return newState;
        }
    },
    { // Scene 5: SmartDevice __init__ and methods
        highlightLines: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        explanation: "定义 <code>SmartDevice</code> 的 <code>__init__</code>, <code>get_info</code> (覆盖父类方法), 和类方法 <code>upgrade_software_all_smart_devices</code>。<code>super()</code> 用于调用父类的方法。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 5 action', prevState);
            return prevState;
        }
    },
    { // Scene 6: Create d1 = Device("Sensor01", "Lab A")
        highlightLines: [50, 51],
        explanation: "创建 <code>Device</code> 类的第一个实例 <code>d1</code>。<br>1. 调用 <code>Device.__init__(d1, \"Sensor01\", \"Lab A\")</code>。<br>2. <code>self</code> 在 <code>__init__</code> 中指向 <code>d1</code>。<br>3. 实例变量 <code>d1.device_id</code> 和 <code>d1.location</code> 被设置。<br>4. 类变量 <code>Device.device_count</code> 增加到 1。<br>5. 活动被记录到共享日志 <code>Device.shared_log</code>。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 6 action', prevState);
            const newState = deepClone(prevState);
            // Update class variables
            newState.Device.device_count = (newState.Device.device_count || 0) + 1;
            if (Array.isArray(newState.Device.shared_log)) {
                newState.Device.shared_log.push('"Sensor01: Initialized"');
            } else {
                newState.Device.shared_log = ['"Sensor01: Initialized"'];
            }
            // Create the instance d1
            newState.d1 = {
                device_id: '"Sensor01"',
                location: '"Lab A"',
                // status is inherited from Device.status initially
                status: newState.Device.status // Explicitly set instance status to reflect initial inherited value
            };
            return newState;
        }
    },
    { // Scene 7: Create d2 = Device("Actuator02", "Lab B")
        highlightLines: [53, 54],
        explanation: "创建 <code>Device</code> 类的第二个实例 <code>d2</code>。<br>1. 调用 <code>Device.__init__(d2, \"Actuator02\", \"Lab B\")</code>。<br>2. 实例变量 <code>d2.device_id</code> 和 <code>d2.location</code> 被设置。<br>3. 类变量 <code>Device.device_count</code> 增加到 2。<br>4. 活动被记录到共享日志。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 7 action', prevState);
            const newState = deepClone(prevState);
            // Update class variables
            newState.Device.device_count = (newState.Device.device_count || 0) + 1;
            if (Array.isArray(newState.Device.shared_log)) {
                newState.Device.shared_log.push('"Actuator02: Initialized"');
            } else {
                newState.Device.shared_log = ['"Actuator02: Initialized"'];
            }
            // Create the instance d2
            newState.d2 = {
                device_id: '"Actuator02"',
                location: '"Lab B"',
                // status is inherited from Device.status initially
                status: newState.Device.status // Explicitly set instance status to reflect initial inherited value
            };
            return newState;
        }
    },
    { // Scene 8: d1.location = "Rooftop" (Instance Variable Independence)
        highlightLines: [56, 57],
        explanation: "修改实例 <code>d1</code> 的实例变量 <code>location</code>。<br>这只影响 <code>d1</code>，不影响 <code>d2</code> 的 <code>location</code>，体现了实例变量的独立性。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 8 action', prevState);
            const newState = deepClone(prevState);
            // Modify instance variable of d1
            if (newState.d1) {
                newState.d1.location = '"Rooftop"';
            }
            return newState;
        }
    },
    { // Scene 9: d1.status = "Online" (Instance "Overriding" Class Variable)
        highlightLines: [59, 60],
        explanation: "给实例 <code>d1</code> 的属性 <code>status</code> 赋值为 \"Online\"。<br>由于 <code>d1</code> 原本没有名为 <code>status</code> 的实例变量，Python 会为 <code>d1</code> 创建一个新的实例变量 <code>status</code>。<br>这个实例变量'遮蔽'了类变量 <code>Device.status</code>。<br><code>Device.status</code> (类变量) 和 <code>d2.status</code> (通过类访问) 保持不变。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 9 action', prevState);
            const newState = deepClone(prevState);
            // Add instance variable status to d1
            if (newState.d1) {
                newState.d1.status = '"Online"';
            }
            return newState;
        }
    },
    { // Scene 10: Device.change_global_status("Maintenance")
        highlightLines: [62, 63],
        explanation: "通过类方法 <code>Device.change_global_status(\"Maintenance\")</code> 修改类变量 <code>Device.status</code>。<br>所有未'覆盖'此变量的实例 (如 <code>d2</code>) 在访问 <code>status</code> 时都会看到新值。<br><code>d1</code> 因为有自己的实例变量 <code>status</code>，所以不受影响。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 10 action', prevState);
            const newState = deepClone(prevState);
            // Modify class variable Device.status
            newState.Device.status = '"Maintenance"';
            return newState;
        }
    },
    { // Scene 11: Modifying mutable class variable shared_log
        highlightLines: [65, 66, 67],
        explanation: "实例 <code>d1</code> 和 <code>d2</code> 调用 <code>log_activity</code> 方法。<br>此方法通过 <code>self.__class__.shared_log.append(...)</code> 修改了可变的类变量 <code>Device.shared_log</code>。<br>由于 <code>shared_log</code> 是一个列表（可变类型），所有实例共享对这同一个列表对象的引用。因此，一个实例的修改对所有其他实例可见（当它们访问这个类变量时）。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 11 action', prevState);
            const newState = deepClone(prevState);
            // Append to the mutable class variable shared_log
            if (Array.isArray(newState.Device.shared_log)) {
                newState.Device.shared_log.push('"Sensor01: System Boot"');
                newState.Device.shared_log.push('"Actuator02: Valve Open"');
            } else {
                 newState.Device.shared_log = ['"Sensor01: System Boot"' , '"Actuator02: Valve Open"' ];
            }
            return newState;
        }
    },
    { // Scene 12: Create sd1 = SmartDevice(...)
        highlightLines: [69, 70],
        explanation: "创建 <code>SmartDevice</code> 的实例 <code>sd1</code>。<br>1. 调用 <code>SmartDevice.__init__</code>，它内部调用 <code>super().__init__</code> (即 <code>Device.__init__</code>)。<br>2. <code>sd1</code> 获得实例变量 <code>device_id</code>, <code>location</code> (来自父类初始化) 和 <code>ip_address</code> (来自子类初始化)。<br>3. <code>Device.device_count</code> 增加到 3。<br>4. 活动记录到 <code>Device.shared_log</code>。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 12 action', prevState);
            const newState = deepClone(prevState);
            // Update class variable device_count (from parent init)
            newState.Device.device_count = (newState.Device.device_count || 0) + 1;
            // Append to the mutable class variable shared_log (from parent init)
            if (Array.isArray(newState.Device.shared_log)) {
                newState.Device.shared_log.push('"Cam03: Initialized"');
            } else {
                newState.Device.shared_log = ['"Cam03: Initialized"'];
            }
            // Create the instance sd1 with its instance variables
            newState.sd1 = {
                device_id: '"Cam03"',
                location: '"Entrance"',
                ip_address: '"192.168.1.100"',
                // status is inherited from SmartDevice.status (which might shadow Device.status)
                // We will explicitly set this based on the SmartDevice status at this point
                status: newState.SmartDevice?.status || newState.Device.status
            };
            return newState;
        }
    },
    { // Scene 13: SmartDevice.software_version = "1.1"
        highlightLines: [72, 73],
        explanation: "修改子类 <code>SmartDevice</code> 的类变量 <code>software_version</code>。<br>这只影响 <code>SmartDevice</code> 类及其未来的实例（或现有未覆盖此变量的实例）。不影响父类 <code>Device</code>。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 13 action', prevState);
            const newState = deepClone(prevState);
            // Modify SmartDevice class variable software_version
            if (!newState.SmartDevice) {
                newState.SmartDevice = { software_version: '"1.0"' }; // Initialize if somehow missing
            }
            newState.SmartDevice.software_version = '"1.1"';
            return newState;
        }
    },
    { // Scene 14: SmartDevice.status = "Active" (Subclass shadowing inherited class variable)
        highlightLines: [75, 76, 77],
        explanation: "修改 <code>SmartDevice.status</code> 为 \"Active\"。<br>由于 <code>SmartDevice</code> 本身没有 <code>status</code> 类变量，这会在 <code>SmartDevice</code> 类上创建一个新的类变量 <code>status</code>。<br>它遮蔽了从 <code>Device</code> 继承的 <code>status</code>。<br><code>Device.status</code> 保持不变。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 14 action', prevState);
            const newState = deepClone(prevState);
            // Modify SmartDevice class variable status
            if (!newState.SmartDevice) {
                 // This case should ideally not happen if scene 4 is executed, but as a safeguard:
                 newState.SmartDevice = { software_version: prevState.SmartDevice?.software_version };
            }
            newState.SmartDevice.status = '"Active"';
            return newState;
        }
    },
    { // Scene 15: Print final information
        highlightLines: [80, 81, 82, 83, 84, 85, 86, 87],
        explanation: "最后，我们打印所有对象的信息来回顾它们当前的状态。",
        output: "",
        action: (prevState: VizState) => {
            console.log('Executing Scene 15 action', prevState);
            return prevState;
        }
    }
];

  // Helper function for deep cloning (can be moved to utils)
   function deepClone<T>(obj: T): T {
       if (obj === null || typeof obj !== 'object') {
           return obj;
       }
       if (Array.isArray(obj)) {
           // Explicitly cast the result of map to T or a compatible type
           return obj.map(deepClone) as T; // Add type assertion here
       }
       const cloned: any = {};
       for (const key in obj) {
           if (Object.prototype.hasOwnProperty.call(obj, key)) {
               cloned[key] = deepClone(obj[key]);
           }
       }
       return cloned as T;
   }

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

   const handleNext = () => {
       if (currentSceneIndex < scenes.length - 1) {
           const nextIndex = currentSceneIndex + 1;
           const nextVizState = scenes[nextIndex].action(deepClone(vizState));
           setVizState(nextVizState);
           setCurrentSceneIndex(nextIndex);
       }
   };

    const handlePrev = () => {
        if (currentSceneIndex > 0) {
            const prevIndex = currentSceneIndex - 1;
            let newVizState: VizState = { // Re-initialize the base state for previous steps calculation
                 Device: { status: '"Offline"', device_count: 0, shared_log: [] },
                 SmartDevice: { software_version: '"1.0"' },
                 d1: null,
                 d2: null,
                 sd1: null,
             };

            for (let i = 0; i <= prevIndex; i++) {
                newVizState = scenes[i].action(deepClone(newVizState));
            }
            setVizState(newVizState);
            setCurrentSceneIndex(prevIndex);
        }
    };

    const handleReset = () => {
         setVizState({
             Device: { status: '"Offline"', device_count: 0, shared_log: [] },
             SmartDevice: { software_version: '"1.0"' },
             d1: null,
             d2: null,
             sd1: null,
         });
        setCurrentSceneIndex(0);
    };

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
