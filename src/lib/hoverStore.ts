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
export type HoveredElement = HoveredVariable | HoveredClass | HoveredFunction;
// pinnedElements 应该是一个数组，所以 null 不应该作为其成员类型

interface HoverState {
  hoveredElement: HoveredElement | null; // hoveredElement 可以是 null
  setHoveredElement: (element: HoveredElement | null) => void;
  // 仍然保留 hoveredLine，用于代码行的解释高亮
  hoveredLine: number | null;
  setHoveredLine: (line: number | null) => void;

  // 新增：被"钉住"的元素列表
  pinnedElements: HoveredElement[];
  // 新增：切换"钉住"状态的函数
  togglePinElement: (element: HoveredElement) => void;
}

export const useHoverStore = create<HoverState>((set) => ({
  hoveredElement: null,
  setHoveredElement: (element) => set({ hoveredElement: element }),
  hoveredLine: null,
  setHoveredLine: (line) => set({ hoveredLine: line }),

  // 初始化 pinnedElements 数组
  pinnedElements: [],
  // 实现 togglePinElement 逻辑
  togglePinElement: (element) => {
    set((state) => {
      const index = state.pinnedElements.findIndex(
        (pinned) => pinned.type === element.type && pinned.name === element.name
      );
      if (index === -1) {
        // 如果元素不在列表中，则添加
        return { pinnedElements: [...state.pinnedElements, element] };
      } else {
        // 如果元素已在列表中，则移除
        const newPinnedElements = [...state.pinnedElements];
        newPinnedElements.splice(index, 1);
        return { pinnedElements: newPinnedElements };
      }
    });
  },
}));
