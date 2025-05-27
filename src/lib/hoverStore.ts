import { create } from 'zustand';

interface HoverState {
  hoveredLine: number | null;
  setHoveredLine: (line: number | null) => void;
  hoveredVar: string | null;
  setHoveredVar: (varName: string | null) => void;
}

export const useHoverStore = create<HoverState>((set) => ({
  hoveredLine: null,
  setHoveredLine: (line) => set({ hoveredLine: line }),
  hoveredVar: null,
  setHoveredVar: (varName) => set({ hoveredVar: varName }),
}));
