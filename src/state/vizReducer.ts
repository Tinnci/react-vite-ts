import { Scene } from '@/constants/scenes';

export interface VizState {
  Device: { status: string; device_count: number; shared_log: string[] };
  SmartDevice: { software_version: string; status?: string };
  d1: { device_id: string; location: string; status?: string } | null;
  d2: { device_id: string; location: string; status?: string } | null;
  sd1: { device_id: string; location: string; ip_address: string; status?: string } | null;
}

export type VizAction =
  | { type: 'GOTO_SCENE'; sceneIndex: number }
  | { type: 'RESET' };

export const initialVizState: VizState = {
  Device: { status: '"Offline"', device_count: 0, shared_log: [] },
  SmartDevice: { software_version: '"1.0"' },
  d1: null,
  d2: null,
  sd1: null,
};

// 深拷贝工具
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as T;
  }
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key]);
    }
  }
  return cloned as T;
}

// 这里实现所有场景的状态变更逻辑
export function vizReducer(state: VizState, action: VizAction): VizState {
  switch (action.type) {
    case 'RESET':
      return deepClone(initialVizState);
    case 'GOTO_SCENE': {
      let newState: VizState = deepClone(initialVizState);
      for (let i = 0; i <= action.sceneIndex; i++) {
        newState = sceneAction(i, newState);
      }
      return newState;
    }
    default:
      return state;
  }
}

// 单独实现每个场景的状态变更逻辑（原 action 逻辑）
function sceneAction(index: number, prevState: VizState): VizState {
  const newState = deepClone(prevState);
  switch (index) {
    case 0:
      newState.Device = { status: '"Offline"', device_count: 0, shared_log: [] };
      break;
    case 4:
      newState.SmartDevice = { software_version: '"1.0"' };
      break;
    case 6:
      newState.Device.device_count = (newState.Device.device_count || 0) + 1;
      if (Array.isArray(newState.Device.shared_log)) {
        newState.Device.shared_log.push('"Sensor01: Initialized"');
      } else {
        newState.Device.shared_log = ['"Sensor01: Initialized"'];
      }
      newState.d1 = {
        device_id: '"Sensor01"',
        location: '"Lab A"',
        status: newState.Device.status,
      };
      break;
    case 7:
      newState.Device.device_count = (newState.Device.device_count || 0) + 1;
      if (Array.isArray(newState.Device.shared_log)) {
        newState.Device.shared_log.push('"Actuator02: Initialized"');
      } else {
        newState.Device.shared_log = ['"Actuator02: Initialized"'];
      }
      newState.d2 = {
        device_id: '"Actuator02"',
        location: '"Lab B"',
        status: newState.Device.status,
      };
      break;
    case 8:
      if (newState.d1) {
        newState.d1.location = '"Rooftop"';
      }
      break;
    case 9:
      if (newState.d1) {
        newState.d1.status = '"Online"';
      }
      break;
    case 10:
      newState.Device.status = '"Maintenance"';
      break;
    case 11:
      if (Array.isArray(newState.Device.shared_log)) {
        newState.Device.shared_log.push('"Sensor01: System Boot"');
        newState.Device.shared_log.push('"Actuator02: Valve Open"');
      } else {
        newState.Device.shared_log = ['"Sensor01: System Boot"', '"Actuator02: Valve Open"'];
      }
      break;
    case 12:
      newState.Device.device_count = (newState.Device.device_count || 0) + 1;
      if (Array.isArray(newState.Device.shared_log)) {
        newState.Device.shared_log.push('"Cam03: Initialized"');
      } else {
        newState.Device.shared_log = ['"Cam03: Initialized"'];
      }
      newState.sd1 = {
        device_id: '"Cam03"',
        location: '"Entrance"',
        ip_address: '"192.168.1.100"',
        status: newState.SmartDevice?.status || newState.Device.status,
      };
      break;
    case 13:
      if (!newState.SmartDevice) {
        newState.SmartDevice = { software_version: '"1.0"' };
      }
      newState.SmartDevice.software_version = '"1.1"';
      break;
    case 14:
      if (!newState.SmartDevice) {
        newState.SmartDevice = { software_version: '"1.0"' };
      }
      newState.SmartDevice.status = '"Active"';
      break;
    default:
      break;
  }
  // 保证 SmartDevice.software_version 始终为 string
  if (!newState.SmartDevice?.software_version) {
    newState.SmartDevice = { ...newState.SmartDevice, software_version: '"1.0"' };
  }
  return newState;
} 