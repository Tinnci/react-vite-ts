import React, { useMemo } from 'react';
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
  const varLocs = locations.get(hoveredVar);
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

interface CodePanelProps {
  code: string;
  highlightedLines: number[];
}

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines }) => {
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

  return (
    <div className="bg-panel-bg text-foreground min-h-[200px] md:min-h-[400px] font-mono text-sm overflow-x-auto rounded">
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
  );
};

export default CodePanel; 