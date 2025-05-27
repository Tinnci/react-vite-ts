import { create } from 'zustand';

// 定义不同类型的可悬停元素
interface HoveredVariable {
  type: 'variable';
  name: string;
}

interface HoveredClass {
  type: 'class';
  name: string;
}

interface HoveredFunction {
  type: 'function';
  name: string;
}

// 可以根据需要添加更多类型，例如方法、属性等
export type HoveredElement = HoveredVariable | HoveredClass | HoveredFunction | null;

interface HoverState {
  hoveredElement: HoveredElement;
  setHoveredElement: (element: HoveredElement) => void;
  // 仍然保留 hoveredLine，用于代码行的解释高亮
  hoveredLine: number | null;
  setHoveredLine: (line: number | null) => void;
}

export const useHoverStore = create<HoverState>((set) => ({
  hoveredElement: null,
  setHoveredElement: (element) => set({ hoveredElement: element }),
  hoveredLine: null,
  setHoveredLine: (line) => set({ hoveredLine: line }),
}));
