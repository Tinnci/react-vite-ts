import { fullPythonCode } from '../constants/pythonCode';
import { HighlightMap } from '../types';

export const createHighlightMap = (code: string): HighlightMap => {
  const highlightMap: HighlightMap = new Map();
  const lines = code.split('\n');
  
  // 使用非贪婪匹配来修复正则表达式
  const tagRegex = /# scene-id: (.+?)_start/g;
  let match;

  while ((match = tagRegex.exec(code)) !== null) {
    const tag = match[1];
    const startLineNumber = code.substring(0, match.index).split('\n').length;

    const endRegex = new RegExp(`# scene-id: ${tag}_end`);
    const endMatch = endRegex.exec(code);

    if (endMatch) {
      const endLineNumber = code.substring(0, endMatch.index).split('\n').length;
      highlightMap.set(tag, { from: startLineNumber, to: endLineNumber });
    }
  }

  return highlightMap;
}; 