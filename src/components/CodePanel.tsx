import React, { useMemo, useRef, useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css'; // 你可以自定义样式覆盖
import { useHoverStore } from '@/lib/hoverStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import type { VariableLocations } from '@/lib/pyodideService';

// Prism Token 类型声明
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PrismToken {
  type: string;
  content: string | PrismToken | Array<string | PrismToken>;
}

// 工具函数：判断某 token 是否为变量名，并返回其所在行号
function isVarToken(
  lineNumber: number,
  colStart: number,
  locations: VariableLocations,
  hoveredVar: string | null
): boolean {
  if (!hoveredVar) return false;
  const varLocs = locations[hoveredVar];
  if (!varLocs) return false;
  // 检查当前 token 是否落在变量的某个位置
  return varLocs.some((loc: any) => {
    return (
      loc.lineno === lineNumber &&
      colStart >= loc.col_offset &&
      colStart < loc.end_col_offset
    );
  });
}

// 递归渲染 Prism token，始终返回 ReactNode
function renderToken(
  token: string | PrismToken | Array<string | PrismToken>,
  lineNumber: number,
  colStart: number,
  locations: VariableLocations,
  setHoveredVar: (varName: string | null) => void,
  hoveredVar: string | null
): React.ReactNode {
  if (typeof token === 'string') {
    return token;
  }
  if (Array.isArray(token)) {
    let col = colStart;
    return token.map(t => {
      const rendered = renderToken(t, lineNumber, col, locations, setHoveredVar, hoveredVar);
      const len = typeof t === 'string' ? t.length : (typeof t.content === 'string' ? t.content.length : 0);
      col += len;
      return rendered;
    });
  }
  // 递归渲染 PrismToken 的 content
  if (typeof token.content !== 'string') {
    return (
      <span className={`token ${token.type}`}>
        {renderToken(token.content, lineNumber, colStart, locations, setHoveredVar, hoveredVar)}
      </span>
    );
  }
  // 变量名高亮
  if (
    token.type === 'variable' ||
    token.type === 'function' ||
    token.type === 'class-name' ||
    token.type === 'builtin'
  ) {
    return (
      <span
        className={
          isVarToken(
            lineNumber,
            colStart,
            locations,
            hoveredVar
          )
            ? 'var-highlight'
            : ''
        }
        onMouseEnter={() => {
          if (typeof token.content === 'string') setHoveredVar(token.content);
        }}
        onMouseLeave={() => setHoveredVar(null)}
        style={{ cursor: 'pointer' }}
      >
        {token.content}
      </span>
    );
  }
  // 其他 token（content 为 string）
  return <span className={`token ${token.type}`}>{token.content}</span>;
}

// 新增：解释类型
interface ExplanationItem {
  line: number;
  text: string;
}

interface CodePanelProps {
  code: string;
  highlightedLines: number[];
  explanations?: ExplanationItem[]; // 新增
}

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines, explanations = [] }) => {
  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const hoveredVar = useHoverStore((state) => state.hoveredVar);
  const setHoveredVar = useHoverStore((state) => state.setHoveredVar);
  const locations = useCodeAnalysisStore((state) => state.locations);

  // 按行分割代码
  const lines = useMemo(() => code.trim().split('\n'), [code]);

  // 预处理每行的 token
  const tokenizedLines = useMemo(
    () => lines.map((line) => Prism.tokenize(line, Prism.languages.python)),
    [lines]
  );

  // 记录每行的ref
  const lineRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [lineTops, setLineTops] = useState<{ [line: number]: number }>({});

  // 计算每行的offsetTop
  useEffect(() => {
    const tops: { [line: number]: number } = {};
    lineRefs.current.forEach((tr, idx) => {
      if (tr) tops[idx + 1] = tr.offsetTop;
    });
    setLineTops(tops);
  }, [code, tokenizedLines.length]);

  // 自动滚动高亮行到可视区域
  useEffect(() => {
    // 优先解释高亮，其次场景高亮
    let targetLine: number | null = hoveredLine;
    if (!targetLine && highlightedLines.length > 0) {
      targetLine = highlightedLines[0];
    }
    if (targetLine && lineRefs.current[targetLine - 1]) {
      lineRefs.current[targetLine - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [hoveredLine, highlightedLines]);

  // 解释Map，便于查找
  const explanationMap = useMemo(() => {
    const map = new Map<number, string>();
    explanations.forEach(e => map.set(e.line, e.text));
    return map;
  }, [explanations]);

  return (
    <div
      className="relative w-full font-mono text-sm"
      style={{ minHeight: 200, background: '#f5f5f5' }}
    >
      {/* Grid布局：左代码，右解释 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '1.5rem',
          position: 'relative',
        }}
      >
        {/* 左列：代码 */}
        <div className="code-column" style={{ position: 'relative' }}>
          <table style={{ width: '100%' }}>
            <tbody>
              {tokenizedLines.map((tokens, idx) => {
                const lineNumber = idx + 1;
                const isSceneHighlight = highlightedLines.includes(lineNumber);
                const isExplanationHighlight = hoveredLine === lineNumber;
                const highlight = isSceneHighlight || isExplanationHighlight;
                return (
                  <tr
                    key={lineNumber}
                    ref={el => (lineRefs.current[idx] = el)}
                    style={{
                      background: highlight
                        ? isExplanationHighlight
                          ? 'rgb(var(--highlight-bg))'
                          : 'rgba(var(--highlight-bg), 0.5)'
                        : 'transparent',
                      borderLeft: highlight ? '4px solid rgb(var(--highlight-border))' : undefined,
                      color: highlight ? 'rgb(var(--highlight-fg))' : undefined,
                      transition: 'background 0.3s, border 0.3s, color 0.3s',
                    }}
                  >
                    <td style={{ userSelect: 'none', textAlign: 'right', paddingRight: 8, color: '#aaa', width: 1 }}>
                      {lineNumber}
                    </td>
                    <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: '1rem' }}>
                      {renderToken(tokens, lineNumber, 0, locations, setHoveredVar, hoveredVar)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* 右列：解释浮层 */}
        <div className="explanation-column" style={{ position: 'relative', minHeight: 200 }}>
          {/* 绝对定位的解释 */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
            {explanations.map(({ line, text }) =>
              lineTops[line] !== undefined ? (
                <div
                  key={line}
                  className="p-2 mb-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 rounded shadow explanation-float"
                  style={{
                    position: 'absolute',
                    top: lineTops[line],
                    left: 0,
                    width: '100%',
                    transition: 'top 0.3s, opacity 0.3s',
                    opacity: 1,
                    zIndex: 2,
                  }}
                >
                  {text}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePanel; 