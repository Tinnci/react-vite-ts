// scenes.ts
// 只保留静态描述，不包含 action 逻辑

import type { VizState } from '@/state/vizReducer';

export interface Scene {
  title: string;
  highlightLines: number[];
  highlightedVars?: string[];
  explanation: string;
  getOutput: (state: VizState) => string;
  reducer: (prevState: VizState) => VizState;
}

export const scenes: Scene[] = [
  {
    title: '定义 Device 类及类变量',
    highlightLines: [1, 2, 3, 4, 5, 6],
    highlightedVars: ['status', 'device_count', 'shared_log'],
    explanation: '定义 <code>Device</code> 类及其类变量：<code>status</code>, <code>device_count</code>, <code>shared_log</code>。这些变量属于类本身。',
    getOutput: () => '',
    reducer: (prev) => {
      const next = structuredClone(prev);
      next.Device = { status: 'Offline', device_count: 0, shared_log: [] };
      return next;
    },
  },
  {
    title: '定义 Device 构造方法',
    highlightLines: [7, 8, 9, 10, 11, 12, 13],
    explanation: '定义 <code>Device</code> 类的构造方法 <code>__init__</code>。当创建实例时，此方法会被调用。<hover-target line={12}><code>self</code></hover-target> 是对新创建实例的引用。',
    getOutput: () => '',
    reducer: (prev) => prev,
  },
  {
    title: '定义类方法',
    highlightLines: [15, 16, 17, 18, 19, 20, 21],
    explanation: '定义类方法 <code>get_device_count</code> 和 <code>change_global_status</code>。<code>@classmethod</code> 装饰器使其第一个参数 <code>cls</code> 引用类本身。',
    getOutput: () => '',
    reducer: (prev) => prev,
  },
  {
    title: '定义实例方法',
    highlightLines: [22, 23, 24, 25, 26, 27, 28, 29, 30],
    explanation: '定义实例方法 <code>get_info</code> 和 <code>log_activity</code>。这些方法通过 <code>self</code> 操作实例数据或类数据。',
    getOutput: () => '',
    reducer: (prev) => prev,
  },
  {
    title: '定义 SmartDevice 子类',
    highlightLines: [32, 33, 34],
    explanation: '定义 <code>SmartDevice</code> 类，它继承自 <code>Device</code> 类。<code>SmartDevice</code> 拥有自己的类变量 <code>software_version</code>，并继承 <code>Device</code> 的所有属性和方法。',
    getOutput: () => '',
    reducer: (prev) => prev,
  },
  {
    title: '定义 SmartDevice 的方法',
    highlightLines: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    explanation: '定义 <code>SmartDevice</code> 的 <code>__init__</code>, <code>get_info</code> (覆盖父类方法), 和类方法 <code>upgrade_software_all_smart_devices</code>。<code>super()</code> 用于调用父类的方法。',
    getOutput: () => '',
    reducer: (prev) => prev,
  },
  {
    title: '创建 Device 实例 d1',
    highlightLines: [50, 51],
    explanation: '创建 <code>Device</code> 类的第一个实例 <code>d1</code>。<br>1. 调用 <code>Device.__init__(d1, "Sensor01", "Lab A")</code>。<br>2. <code>self</code> 在 <code>__init__</code> 中指向 <code>d1</code>。<br>3. 实例变量 <code>d1.device_id</code> 和 <code>d1.location</code> 被设置。<br>4. 类变量 <code>Device.device_count</code> 增加到 1。<br>5. 活动被记录到共享日志 <code>Device.shared_log</code>。',
    getOutput: () => '',
    reducer: (prev) => {
      const next = structuredClone(prev);
      next.Device.device_count += 1;
      next.Device.shared_log.push('Sensor01: Initialized');
      next.d1 = { device_id: 'Sensor01', location: 'Lab A', status: next.Device.status };
      return next;
    },
  },
  {
    title: '创建 Device 实例 d2',
    highlightLines: [53, 54],
    explanation: '创建 <code>Device</code> 类的第二个实例 <code>d2</code>。<br>1. 调用 <code>Device.__init__(d2, "Actuator02", "Lab B")</code>。<br>2. 实例变量 <code>d2.device_id</code> 和 <code>d2.location</code> 被设置。<br>3. 类变量 <code>Device.device_count</code> 增加到 2。<br>4. 活动被记录到共享日志。',
    getOutput: () => '',
    reducer: (prev) => {
      const next = structuredClone(prev);
      next.Device.device_count += 1;
      next.Device.shared_log.push('Actuator02: Initialized');
      next.d2 = { device_id: 'Actuator02', location: 'Lab B', status: next.Device.status };
      return next;
    },
  },
  {
    title: '实例变量的独立性',
    highlightLines: [56, 57],
    explanation: '修改实例 <code>d1</code> 的实例变量 <code>location</code>。<br>这只影响 <code>d1</code>，不影响 <code>d2</code> 的 <code>location</code>，体现了实例变量的独立性。',
    getOutput: (state) => `d1.location 现在是 ${state.d1?.location ?? 'N/A'}\nd2.location 仍然是 ${state.d2?.location ?? 'N/A'}`,
    reducer: (prev) => {
      const next = structuredClone(prev);
      if (next.d1) next.d1.location = 'Rooftop';
      return next;
    },
  },
  {
    title: '实例变量遮蔽类变量',
    highlightLines: [59, 60],
    explanation: '给实例 <code>d1</code> 的属性 <code>status</code> 赋值为 "Online"。<br>由于 <code>d1</code> 原本没有名为 <code>status</code> 的实例变量，Python 会为 <code>d1</code> 创建一个新的实例变量 <code>status</code>。<br>这个实例变量\'遮蔽\'了类变量 <code>Device.status</code>。<br><code>Device.status</code> (类变量) 和 <code>d2.status</code> (通过类访问) 保持不变。',
    getOutput: (state) => {
      const d1Status = state.d1?.status ?? state.Device?.status ?? 'N/A';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      return `d1.status (实例变量): ${d1Status}\nDevice.status (类变量): ${deviceStatus}\nd2.status (访问类变量): ${d2Status}`;
    },
    reducer: (prev) => {
      const next = structuredClone(prev);
      if (next.d1) next.d1.status = 'Online';
      return next;
    },
  },
  {
    title: '通过类方法修改类变量',
    highlightLines: [62, 63],
    explanation: '通过类方法 <code>Device.change_global_status("Maintenance")</code> 修改类变量 <code>Device.status</code>。<br>所有未\'覆盖\'此变量的实例 (如 <code>d2</code>) 在访问 <code>status</code> 时都会看到新值。<br><code>d1</code> 因为有自己的实例变量 <code>status</code>，所以不受影响。',
    getOutput: (state) => {
      const d1Status = state.d1?.status ?? state.Device?.status ?? 'N/A';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      return `d1.status: ${d1Status}\nd2.status: ${d2Status}\nDevice.status: ${deviceStatus}`;
    },
    reducer: (prev) => {
      const next = structuredClone(prev);
      next.Device.status = 'Maintenance';
      return next;
    },
  },
  {
    title: '可变类变量的共享',
    highlightLines: [65, 66, 67],
    explanation: '实例 <code>d1</code> 和 <code>d2</code> 调用 <code>log_activity</code> 方法。<br>此方法通过 <code>self.__class__.shared_log.append(...)</code> 修改了可变的类变量 <code>Device.shared_log</code>。<br>由于 <code>shared_log</code> 是一个列表（可变类型），所有实例共享对这同一个列表对象的引用。因此，一个实例的修改对所有其他实例可见（当它们访问这个类变量时）。',
    getOutput: (state) => {
      const sharedLog = Array.isArray(state.Device?.shared_log) ? state.Device.shared_log.join(', ') : '';
      return `Device.shared_log: [${sharedLog}]`;
    },
    reducer: (prev) => {
      const next = structuredClone(prev);
      next.Device.shared_log.push('Sensor01: System Boot');
      next.Device.shared_log.push('Actuator02: Valve Open');
      return next;
    },
  },
  {
    title: '创建 SmartDevice 实例 sd1',
    highlightLines: [69, 70],
    explanation: '创建 <code>SmartDevice</code> 的实例 <code>sd1</code>。<br>1. 调用 <code>SmartDevice.__init__</code>，它内部调用 <code>super().__init__</code> (即 <code>Device.__init__</code>)。<br>2. <code>sd1</code> 获得实例变量 <code>device_id</code>, <code>location</code> (来自父类初始化) 和 <code>ip_address</code> (来自子类初始化)。<br>3. <code>Device.device_count</code> 增加到 3。<br>4. 活动记录到 <code>Device.shared_log</code>。',
    getOutput: () => '',
    reducer: (prev) => {
      const next = structuredClone(prev);
      next.Device.device_count += 1;
      next.Device.shared_log.push('Cam03: Initialized');
      next.sd1 = {
        device_id: 'Cam03',
        location: 'Entrance',
        ip_address: '192.168.1.100',
        status: next.SmartDevice?.status || next.Device.status,
      };
      return next;
    },
  },
  {
    title: '子类修改类变量',
    highlightLines: [72, 73],
    explanation: '修改子类 <code>SmartDevice</code> 的类变量 <code>software_version</code>。<br>这只影响 <code>SmartDevice</code> 类及其未来的实例（或现有未覆盖此变量的实例）。不影响父类 <code>Device</code>。',
    getOutput: (state) => {
      const smartDeviceSoftwareVersion = state.SmartDevice?.software_version ?? 'N/A';
      return `SmartDevice.software_version: ${smartDeviceSoftwareVersion}`;
    },
    reducer: (prev) => {
      const next = structuredClone(prev);
      if (!next.SmartDevice) next.SmartDevice = { software_version: '1.0' };
      next.SmartDevice.software_version = '1.1';
      return next;
    },
  },
  {
    title: '子类遮蔽继承类变量',
    highlightLines: [75, 76, 77],
    explanation: '修改 <code>SmartDevice.status</code> 为 "Active"。<br>由于 <code>SmartDevice</code> 本身没有 <code>status</code> 类变量，这会在 <code>SmartDevice</code> 类上创建一个新的类变量 <code>status</code>。<br>它遮蔽了从 <code>Device</code> 继承的 <code>status</code>。<br><code>Device.status</code> 保持不变。',
    getOutput: (state) => {
      const sd1Status = state.sd1?.status ?? state.SmartDevice?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      const smartDeviceStatus = state.SmartDevice?.status ?? 'N/A (继承自 Device)';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      return `sd1.status (访问 SmartDevice.status): ${sd1Status}\nDevice.status: ${deviceStatus}\nSmartDevice.status: ${smartDeviceStatus}\nd2.status (访问 Device.status): ${d2Status}`;
    },
    reducer: (prev) => {
      const next = structuredClone(prev);
      if (!next.SmartDevice) next.SmartDevice = { software_version: '1.0' };
      next.SmartDevice.status = 'Active';
      return next;
    },
  },
  {
    title: '打印所有对象信息',
    highlightLines: [80, 81, 82, 83, 84, 85, 86, 87],
    explanation: '最后，我们打印所有对象的信息来回顾它们当前的状态。',
    getOutput: (state) => {
      const d1Status = state.d1?.status ?? state.Device?.status ?? 'N/A';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      const sd1Status = state.sd1?.status ?? state.SmartDevice?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      const smartDeviceStatus = state.SmartDevice?.status ?? 'N/A (继承自 Device)';
      const sharedLog = Array.isArray(state.Device?.shared_log) ? state.Device.shared_log.join(', ') : '';
      const sd1IpAddress = state.sd1?.ip_address ?? 'N/A';
      const smartDeviceSoftwareVersion = state.SmartDevice?.software_version ?? 'N/A';
      const totalDevices = state.Device?.device_count ?? 0;
      return (
        `d1 info: ID: ${state.d1?.device_id ?? 'N/A'}, Loc: ${state.d1?.location ?? 'N/A'}, Status: ${d1Status}\n` +
        `d2 info: ID: ${state.d2?.device_id ?? 'N/A'}, Loc: ${state.d2?.location ?? 'N/A'}, Status: ${d2Status}\n` +
        `sd1 info: ID: ${state.sd1?.device_id ?? 'N/A'}, Loc: ${state.sd1?.location ?? 'N/A'}, Status: ${sd1Status}, IP: ${sd1IpAddress}, SW: ${smartDeviceSoftwareVersion}\n` +
        `Total devices: ${totalDevices}\n` +
        `Device class status: ${deviceStatus}\n` +
        `SmartDevice class status: ${smartDeviceStatus}\n` +
        `Shared Log: [${sharedLog}]`
      );
    },
    reducer: (prev) => prev,
  },
]; 