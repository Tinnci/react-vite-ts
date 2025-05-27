import { create } from 'zustand';
import type { VariableLocations, AnalysisResult } from './pyodideService';

interface CodeAnalysisState {
  locations: VariableLocations;
  isLoading: boolean;
  error: string | null;
  statusMessage: string;
  analyzeCode: (code: string) => Promise<void>;
}

export const useCodeAnalysisStore = create<CodeAnalysisState>((set) => ({
  locations: {},
  isLoading: false,
  error: null,
  statusMessage: '',
  analyzeCode: async (code: string) => {
    set({ isLoading: true, error: null, statusMessage: '正在初始化 Pyodide...' });
    try {
      const { pyodideService } = await import('./pyodideService');
      const result: AnalysisResult = await pyodideService.analyzeCode(code, (msg) => set({ statusMessage: msg }));
      if (result.error || result.runtime_error) {
        set({
          error: result.error || result.runtime_error || '未知错误',
          isLoading: false,
          statusMessage: '分析出错',
          locations: result.locations || {},
        });
      } else {
        set({
          locations: result.locations,
          isLoading: false,
          error: null,
          statusMessage: '分析完成',
        });
      }
    } catch (e: any) {
      set({ error: e.message, isLoading: false, statusMessage: '分析出错' });
    }
  },
})); 