import { create } from 'zustand';
import { scenes } from '@/constants/scenes';

export interface VizState {
  currentSceneIndex: number;
  Device: { status: string; device_count: number; shared_log: string[] };
  SmartDevice: { software_version: string; status?: string };
  d1: { device_id: string; location: string; status?: string } | null;
  d2: { device_id: string; location: string; status?: string } | null;
  sd1: { device_id: string; location: string; ip_address: string; status?: string } | null;
}

export interface VizStore extends VizState {
  gotoScene: (sceneIndex: number) => void;
  reset: () => void;
}

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

function getSceneState(target: number): VizState {
  if (sceneStateCache.has(target)) {
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
  for (let i = nearest + 1; i <= target; i++) {
    newState = scenes[i].transformState(newState);
    sceneStateCache.set(i, structuredClone(newState));
  }
  newState.currentSceneIndex = target;
  return newState;
}

export const useVizStore = create<VizStore>((set) => ({
  ...initialVizState,
  gotoScene: (sceneIndex: number) => {
    set(getSceneState(sceneIndex));
  },
  reset: () => {
    sceneStateCache.clear();
    sceneStateCache.set(0, structuredClone(initialVizState));
    set(structuredClone(initialVizState));
  },
})); 