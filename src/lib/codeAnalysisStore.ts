import { create } from 'zustand';
import type { VariableLocations } from './pyodideService';

interface CodeAnalysisState {
  locations: VariableLocations;
  isLoading: boolean;
  error: string | null;
  analyzeCode: (code: string) => Promise<void>;
}

export const useCodeAnalysisStore = create<CodeAnalysisState>((set) => ({
  locations: new Map(),
  isLoading: true,
  error: null,
  analyzeCode: async (code: string) => {
    console.log('[codeAnalysisStore] analyzeCode start');
    set({ isLoading: true, error: null });
    console.log('[codeAnalysisStore] isLoading set to true');
    try {
      const { pyodideService } = await import('./pyodideService');
      const locations = await pyodideService.analyzeCode(code);
      set({ locations, isLoading: false });
      console.log('[codeAnalysisStore] analyzeCode end, isLoading set to false');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      console.log('[codeAnalysisStore] analyzeCode error, isLoading set to false');
    }
  },
})); 