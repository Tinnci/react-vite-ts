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
      return structuredClone(initialVizState);
    case 'GOTO_SCENE': {
      let newState: VizState = structuredClone(initialVizState);
      for (let i = 0; i <= action.sceneIndex; i++) {
        newState = scenes[i].reducer(newState);
      }
      newState.currentSceneIndex = action.sceneIndex;
      return newState;
    }
    default:
      return state;
  }
}
