import { fullPythonCode } from '../constants/pythonCode';
import { HighlightMap } from '../types';
import { Text, Line } from '@codemirror/state';

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

// 允许 doc 参数是 string 或 Text 类型
export function findHighlightRangeByTag(tag: string | undefined, doc: Text | string): { from: number; to: number } | null {
    if (!tag) {
        return null;
    }

    const startTag = `# scene-id: ${tag}_start`;
    const endTag = `# scene-id: ${tag}_end`;

    let from = -1;
    let to = -1;
    let currentPos = 0;

    // 'lines' 可以是字符串数组，也可以是 Line 对象的迭代器
    const lines = typeof doc === 'string' ? doc.split('\n') : doc.iterLines();

    for (const line of lines) {
        // A. 处理从 'string.split()' 来的普通字符串
        if (typeof line === 'string') {
            if (line.includes(startTag)) {
                // 范围从当前行的下一行开始
                from = currentPos + line.length + 1;
            } else if (line.includes(endTag)) {
                // 范围在当前行的上一行结束
                to = currentPos - 1;
                break;
            }
            // 更新位置，+1 是为了处理换行符
            currentPos += line.length + 1;
        } 
        // B. 处理从 'doc.iterLines()' 来的 CodeMirror Line 对象
        else {
            const lineObject = line as Line;
            if (lineObject.text.includes(startTag)) {
                // 范围从当前行的下一行开始
                from = lineObject.to + 1;
            } else if (lineObject.text.includes(endTag)) {
                // 范围在当前行的上一行结束
                to = lineObject.from - 1;
                break;
            }
        }
    }

    if (from !== -1 && to !== -1 && from <= to) {
        return { from, to };
    }

    return null;
} 