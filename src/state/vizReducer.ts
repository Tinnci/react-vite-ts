import { scenes } from '@/constants/scenes';

export interface VizState {
  currentSceneIndex: number;
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
  currentSceneIndex: 0,
  Device: { status: 'Offline', device_count: 0, shared_log: [] },
  SmartDevice: { software_version: '1.0' },
  d1: null,
  d2: null,
  sd1: null,
};

// 全局缓存：key 为场景索引，value 为 VizState
const sceneStateCache = new Map<number, VizState>();
sceneStateCache.set(0, structuredClone(initialVizState));

// actionType 到 reducer 的映射
function applyAction(state: VizState, actionType: string): VizState {
  const next = structuredClone(state);
  switch (actionType) {
    case 'INIT_DEVICE_CLASS': {
      next.Device = { status: 'Offline', device_count: 0, shared_log: [] };
      return next;
    }
    case 'CREATE_D1': {
      next.Device.device_count += 1;
      next.Device.shared_log.push('Sensor01: Initialized');
      next.d1 = { device_id: 'Sensor01', location: 'Lab A', status: next.Device.status };
      return next;
    }
    case 'CREATE_D2': {
      next.Device.device_count += 1;
      next.Device.shared_log.push('Actuator02: Initialized');
      next.d2 = { device_id: 'Actuator02', location: 'Lab B', status: next.Device.status };
      return next;
    }
    case 'CREATE_SD1': {
      next.Device.device_count += 1;
      next.Device.shared_log.push('Cam03: Initialized');
      next.sd1 = {
        device_id: 'Cam03',
        location: 'Entrance',
        ip_address: '192.168.1.100',
        status: next.SmartDevice?.status || next.Device.status,
      };
      return next;
    }
    // 其他 actionType 可在此扩展
    case 'NOOP':
    default:
      return next;
  }
}

export function vizReducer(state: VizState, action: VizAction): VizState {
  switch (action.type) {
    case 'RESET': {
      sceneStateCache.clear();
      sceneStateCache.set(0, structuredClone(initialVizState));
      return structuredClone(initialVizState);
    }
    case 'GOTO_SCENE': {
      const target = action.sceneIndex;
      if (sceneStateCache.has(target)) {
        // 命中缓存
        return { ...structuredClone(sceneStateCache.get(target)!), currentSceneIndex: target };
      }
      // 查找最近的缓存点
      let nearest = 0;
      for (let i = target; i >= 0; i--) {
        if (sceneStateCache.has(i)) {
          nearest = i;
          break;
        }
      }
      let newState = structuredClone(sceneStateCache.get(nearest)!);
      // 增量执行 actionType
      for (let i = nearest + 1; i <= target; i++) {
        const actionType = scenes[i].actionType;
        newState = applyAction(newState, actionType);
        sceneStateCache.set(i, structuredClone(newState));
      }
      newState.currentSceneIndex = target;
      return newState;
    }
    default:
      return state;
  }
}
