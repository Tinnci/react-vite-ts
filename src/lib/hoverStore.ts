import { create } from 'zustand';

interface HoverState {
  hoveredLine: number | null;
  setHoveredLine: (line: number | null) => void;
}

export const useHoverStore = create<HoverState>((set) => ({
  hoveredLine: null,
  setHoveredLine: (line) => set({ hoveredLine: line }),
}));
