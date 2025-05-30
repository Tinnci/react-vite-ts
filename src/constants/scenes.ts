// scenes.ts
// 只保留静态描述，不包含 action 逻辑

import type { VizState } from '@/state/vizReducer';

// 新增：结构化解释类型
export type ExplanationPart =
  | { type: 'text'; content: string }
  | { type: 'hover'; content: string; line?: number; var?: string };

export interface Scene {
  title: string;
  highlightTag?: string;
  highlightedVars?: string[];
  explanation: string | ExplanationPart[];
  getOutput: (state: VizState) => string;
  transformState: (prev: VizState) => VizState;
}

export const scenes: Scene[] = [
  {
    title: '定义 Device 类及类变量',
    highlightTag: 'define_device_class',
    highlightedVars: ['status', 'device_count', 'shared_log'],
    explanation: [
      { type: 'text', content: '定义 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 类及其类变量：' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: ', ' },
      { type: 'hover', content: '<code>device_count</code>', var: 'device_count' },
      { type: 'text', content: ', ' },
      { type: 'hover', content: '<code>shared_log</code>', var: 'shared_log' },
      { type: 'text', content: '。这些变量属于类本身。' },
    ],
    getOutput: () => '',
    transformState: (prev) => {
      const next = structuredClone(prev);
      next.Device = { status: 'Offline', device_count: 0, shared_log: [] };
      return next;
    },
  },
  {
    title: '定义 Device 构造方法',
    highlightTag: 'define_device_init',
    explanation: [
      { type: 'text', content: '定义 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 类的构造方法 ' },
      { type: 'hover', content: '<code>__init__</code>' },
      { type: 'text', content: '。当创建实例时，此方法会被调用。' },
      { type: 'hover', content: '<code>self</code>', line: 12 },
      { type: 'text', content: ' 是对新创建实例的引用。' },
    ],
    getOutput: () => '',
    transformState: (prev) => prev,
  },
  {
    title: '定义类方法',
    highlightTag: 'define_device_classmethods',
    explanation: [
      { type: 'text', content: '定义类方法 ' },
      { type: 'hover', content: '<code>get_device_count</code>', var: 'get_device_count' },
      { type: 'text', content: ' 和 ' },
      { type: 'hover', content: '<code>change_global_status</code>', var: 'change_global_status' },
      { type: 'text', content: '。' },
      { type: 'hover', content: '<code>@classmethod</code>' },
      { type: 'text', content: ' 装饰器使其第一个参数 ' },
      { type: 'hover', content: '<code>cls</code>', var: 'cls' },
      { type: 'text', content: ' 引用类本身。' },
    ],
    getOutput: () => '',
    transformState: (prev) => prev,
  },
  {
    title: '定义实例方法',
    highlightTag: 'define_device_instancemethods',
    explanation: [
      { type: 'text', content: '定义实例方法 ' },
      { type: 'hover', content: '<code>get_info</code>', var: 'get_info' },
      { type: 'text', content: ' 和 ' },
      { type: 'hover', content: '<code>log_activity</code>', var: 'log_activity' },
      { type: 'text', content: '。这些方法通过 ' },
      { type: 'hover', content: '<code>self</code>', var: 'self' },
      { type: 'text', content: ' 操作实例数据或类数据。' },
    ],
    getOutput: () => '',
    transformState: (prev) => prev,
  },
  {
    title: '定义 SmartDevice 子类',
    highlightTag: 'define_smartdevice_class',
    explanation: [
      { type: 'text', content: '定义 ' },
      { type: 'hover', content: '<code>SmartDevice</code>' },
      { type: 'text', content: ' 类，它继承自 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 类。' },
      { type: 'hover', content: '<code>SmartDevice</code>' },
      { type: 'text', content: ' 拥有自己的类变量 ' },
      { type: 'hover', content: '<code>software_version</code>', var: 'software_version' },
      { type: 'text', content: '，并继承 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 的所有属性和方法。' },
    ],
    getOutput: () => '',
    transformState: (prev) => prev,
  },
  {
    title: '定义 SmartDevice 的方法',
    highlightTag: 'define_smartdevice_methods',
    explanation: [
      { type: 'text', content: '定义 ' },
      { type: 'hover', content: '<code>SmartDevice</code>' },
      { type: 'text', content: ' 的 ' },
      { type: 'hover', content: '<code>__init__</code>', var: '__init__' },
      { type: 'text', content: ', ' },
      { type: 'hover', content: '<code>get_info</code>', var: 'get_info' },
      { type: 'text', content: ' (覆盖父类方法), 和类方法 ' },
      { type: 'hover', content: '<code>upgrade_software_all_smart_devices</code>', var: 'upgrade_software_all_smart_devices' },
      { type: 'text', content: '。' },
      { type: 'hover', content: '<code>super()</code>' },
      { type: 'text', content: ' 用于调用父类的方法。' },
    ],
    getOutput: () => '',
    transformState: (prev) => prev,
  },
  {
    title: '创建 Device 实例 d1',
    highlightTag: 'create_d1',
    explanation: [
      { type: 'text', content: '创建 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 类的第一个实例 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: '。<br>1. 调用 ' },
      { type: 'hover', content: '<code>Device.__init__(d1, "Sensor01", "Lab A")</code>', line: 12 },
      { type: 'text', content: '。<br>2. ' },
      { type: 'hover', content: '<code>self</code>', var: 'self' },
      { type: 'text', content: ' 在 ' },
      { type: 'hover', content: '<code>__init__</code>', var: '__init__' },
      { type: 'text', content: ' 中指向 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: '。<br>3. 实例变量 ' },
      { type: 'hover', content: '<code>d1.device_id</code>', var: 'device_id' },
      { type: 'text', content: ' 和 ' },
      { type: 'hover', content: '<code>d1.location</code>', var: 'location' },
      { type: 'text', content: ' 被设置。<br>4. 类变量 ' },
      { type: 'hover', content: '<code>Device.device_count</code>', var: 'device_count' },
      { type: 'text', content: ' 增加到 1。<br>5. 活动被记录到共享日志 ' },
      { type: 'hover', content: '<code>Device.shared_log</code>', var: 'shared_log' },
      { type: 'text', content: '。' },
    ],
    getOutput: () => '',
    transformState: (prev) => {
      const next = structuredClone(prev);
      next.d1 = { device_id: 'Sensor01', location: 'Lab A' };
      next.Device = { ...prev.Device, device_count: 1, shared_log: [...prev.Device?.shared_log || []] };
      return next;
    },
  },
  {
    title: '创建 Device 实例 d2',
    highlightTag: 'create_d2',
    explanation: [
      { type: 'text', content: '创建 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 类的第二个实例 ' },
      { type: 'hover', content: '<code>d2</code>', var: 'd2' },
      { type: 'text', content: '。<br>1. 调用 ' },
      { type: 'hover', content: '<code>Device.__init__(d2, "Actuator02", "Lab B")</code>', line: 12 },
      { type: 'text', content: '。<br>2. 实例变量 ' },
      { type: 'hover', content: '<code>d2.device_id</code>', var: 'device_id' },
      { type: 'text', content: ' 和 ' },
      { type: 'hover', content: '<code>d2.location</code>', var: 'location' },
      { type: 'text', content: ' 被设置。<br>3. 类变量 ' },
      { type: 'hover', content: '<code>Device.device_count</code>', var: 'device_count' },
      { type: 'text', content: ' 增加到 2。<br>4. 活动被记录到共享日志。' },
    ],
    getOutput: () => '',
    transformState: (prev) => {
      const next = structuredClone(prev);
      next.d2 = { device_id: 'Actuator02', location: 'Lab B' };
      next.Device = { ...prev.Device, device_count: 2, shared_log: [...prev.Device?.shared_log || []] };
      return next;
    },
  },
  {
    title: '实例变量的独立性',
    highlightTag: 'instance_variable_independence',
    explanation: [
      { type: 'text', content: '修改实例 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: ' 的实例变量 ' },
      { type: 'hover', content: '<code>location</code>', var: 'location' },
      { type: 'text', content: '。<br>这只影响 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: '，不影响 ' },
      { type: 'hover', content: '<code>d2</code>', var: 'd2' },
      { type: 'text', content: ' 的 ' },
      { type: 'hover', content: '<code>location</code>', var: 'location' },
      { type: 'text', content: '，体现了实例变量的独立性。' },
    ],
    getOutput: (state) => `d1.location 现在是 ${state.d1?.location ?? 'N/A'}\nd2.location 仍然是 ${state.d2?.location ?? 'N/A'}`,
    transformState: (prev) => prev,
  },
  {
    title: '实例变量遮蔽类变量',
    highlightTag: 'instance_variable_shadowing',
    explanation: [
      { type: 'text', content: '给实例 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: ' 的属性 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: ' 赋值为 "Online"。<br>由于 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: ' 原本没有名为 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: ' 的实例变量，Python 会为 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: ' 创建一个新的实例变量 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: '。<br>这个实例变量"遮蔽"了类变量 ' },
      { type: 'hover', content: '<code>Device.status</code>', var: 'status' },
      { type: 'text', content: '。<br>' },
      { type: 'hover', content: '<code>Device.status</code>', var: 'status' },
      { type: 'text', content: ' (类变量) 和 ' },
      { type: 'hover', content: '<code>d2.status</code>', var: 'status' },
      { type: 'text', content: ' (通过类访问) 保持不变。' },
    ],
    getOutput: (state) => {
      const d1Status = state.d1?.status ?? state.Device?.status ?? 'N/A';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      return `d1.status (实例变量): ${d1Status}\nDevice.status (类变量): ${deviceStatus}\nd2.status (访问类变量): ${d2Status}`;
    },
    transformState: (prev) => prev,
  },
  {
    title: '通过类方法修改类变量',
    highlightTag: 'change_global_status',
    explanation: [
      { type: 'text', content: '通过类方法 ' },
      { type: 'hover', content: '<code>Device.change_global_status("Maintenance")</code>', line: 19 },
      { type: 'text', content: ' 修改类变量 ' },
      { type: 'hover', content: '<code>Device.status</code>', var: 'status' },
      { type: 'text', content: '。<br>所有未"覆盖"此变量的实例 (如 ' },
      { type: 'hover', content: '<code>d2</code>', var: 'd2' },
      { type: 'text', content: ') 在访问 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: ' 时都会看到新值。<br>' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: ' 因为有自己的实例变量 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: '，所以不受影响。' },
    ],
    getOutput: (state) => {
      const d1Status = state.d1?.status ?? state.Device?.status ?? 'N/A';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      return `d1.status: ${d1Status}\nd2.status: ${d2Status}\nDevice.status: ${deviceStatus}`;
    },
    transformState: (prev) => prev,
  },
  {
    title: '可变类变量的共享',
    highlightTag: 'mutable_class_variable_sharing',
    explanation: [
      { type: 'text', content: '实例 ' },
      { type: 'hover', content: '<code>d1</code>', var: 'd1' },
      { type: 'text', content: ' 和 ' },
      { type: 'hover', content: '<code>d2</code>', var: 'd2' },
      { type: 'text', content: ' 调用 ' },
      { type: 'hover', content: '<code>log_activity</code>', var: 'log_activity' },
      { type: 'text', content: ' 方法。<br>此方法通过 ' },
      { type: 'hover', content: '<code>self.__class__.shared_log.append(...)</code>', var: 'shared_log' },
      { type: 'text', content: ' 修改了可变的类变量 ' },
      { type: 'hover', content: '<code>Device.shared_log</code>', var: 'shared_log' },
      { type: 'text', content: '。<br>由于 ' },
      { type: 'hover', content: '<code>shared_log</code>', var: 'shared_log' },
      { type: 'text', content: ' 是一个列表（可变类型），所有实例共享对这同一个列表对象的引用。因此，一个实例的修改对所有其他实例可见（当它们访问这个类变量时）。' },
    ],
    getOutput: (state) => {
      const sharedLog = Array.isArray(state.Device?.shared_log) ? state.Device.shared_log.join(', ') : '';
      return `Device.shared_log: [${sharedLog}]`;
    },
    transformState: (prev) => prev,
  },
  {
    title: '创建 SmartDevice 实例 sd1',
    highlightTag: 'create_sd1',
    explanation: [
      { type: 'text', content: '创建 ' },
      { type: 'hover', content: '<code>SmartDevice</code>' },
      { type: 'text', content: ' 的实例 ' },
      { type: 'hover', content: '<code>sd1</code>', var: 'sd1' },
      { type: 'text', content: '。<br>1. 调用 ' },
      { type: 'hover', content: '<code>SmartDevice.__init__</code>', var: '__init__' },
      { type: 'text', content: '，它内部调用 ' },
      { type: 'hover', content: '<code>super().__init__</code>', var: 'super' },
      { type: 'text', content: ' (即 ' },
      { type: 'hover', content: '<code>Device.__init__</code>', var: '__init__' },
      { type: 'text', content: ')。<br>2. ' },
      { type: 'hover', content: '<code>sd1</code>', var: 'sd1' },
      { type: 'text', content: ' 获得实例变量 ' },
      { type: 'hover', content: '<code>device_id</code>', var: 'device_id' },
      { type: 'text', content: ', ' },
      { type: 'hover', content: '<code>location</code>', var: 'location' },
      { type: 'text', content: ' (来自父类初始化) 和 ' },
      { type: 'hover', content: '<code>ip_address</code>', var: 'ip_address' },
      { type: 'text', content: ' (来自子类初始化)。<br>3. ' },
      { type: 'hover', content: '<code>Device.device_count</code>', var: 'device_count' },
      { type: 'text', content: ' 增加到 3。<br>4. 活动记录到 ' },
      { type: 'hover', content: '<code>Device.shared_log</code>', var: 'shared_log' },
      { type: 'text', content: '。' },
    ],
    getOutput: () => '',
    transformState: (prev) => {
      const next = structuredClone(prev);
      next.sd1 = { device_id: 'Sensor01', location: 'Lab A', ip_address: '192.168.1.1' };
      next.Device = { ...prev.Device, device_count: 3, shared_log: [...prev.Device?.shared_log || []] };
      return next;
    },
  },
  {
    title: '子类修改继承的类变量',
    highlightTag: 'smartdevice_status_shadowing',
    highlightedVars: ['status'],
    explanation: [
      { type: 'text', content: '修改 ' },
      { type: 'hover', content: '<code>SmartDevice.status</code>', var: 'status' },
      { type: 'text', content: ' 为 "Active"。<br>由于 ' },
      { type: 'hover', content: '<code>SmartDevice</code>' },
      { type: 'text', content: ' 本身没有 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: ' 类变量，这会在 ' },
      { type: 'hover', content: '<code>SmartDevice</code>' },
      { type: 'text', content: ' 类上创建一个新的类变量 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: '。<br>它遮蔽了从 ' },
      { type: 'hover', content: '<code>Device</code>' },
      { type: 'text', content: ' 继承的 ' },
      { type: 'hover', content: '<code>status</code>', var: 'status' },
      { type: 'text', content: '。<br>' },
      { type: 'hover', content: '<code>Device.status</code>', var: 'status' },
      { type: 'text', content: ' 保持不变。' },
    ],
    getOutput: (state) => {
      const sd1Status = state.sd1?.status ?? state.SmartDevice?.status ?? state.Device?.status ?? 'N/A';
      const deviceStatus = state.Device?.status ?? 'N/A';
      const smartDeviceStatus = state.SmartDevice?.status ?? 'N/A (继承自 Device)';
      const d2Status = state.d2?.status ?? state.Device?.status ?? 'N/A';
      return `sd1.status (访问 SmartDevice.status): ${sd1Status}\nDevice.status: ${deviceStatus}\nSmartDevice.status: ${smartDeviceStatus}\nd2.status (访问 Device.status): ${d2Status}`;
    },
    transformState: (prev) => prev,
  },
  {
    title: '打印所有对象信息',
    highlightTag: 'print_info',
    explanation: [
      { type: 'text', content: '最后，我们打印所有对象的信息来回顾它们当前的状态。' },
    ],
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
    transformState: (prev) => prev,
  },
]; 