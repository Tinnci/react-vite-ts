import React, { useMemo, useRef, useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css'; // 你可以自定义样式覆盖
import { useHoverStore } from '@/lib/hoverStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import type { VariableLocations } from '@/lib/pyodideService';
import { Panel } from './ui/Panel';

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
  explanations?: ExplanationItem[];
}

const HOVER_DELAY = 180; // ms
const LEAVE_DELAY = 120; // ms

const CodePanel: React.FC<CodePanelProps> = ({ code, highlightedLines, explanations = [] }) => {
  const hoveredLine = useHoverStore((state) => state.hoveredLine);
  const setHoveredLine = useHoverStore((state) => state.setHoveredLine);
  const hoveredVar = useHoverStore((state) => state.hoveredVar);
  const setHoveredVar = useHoverStore((state) => state.setHoveredVar);
  const locations = useCodeAnalysisStore((state) => state.locations);

  // 按行分割代码
  const lines = useMemo(() => code.trim().split('\n'), [code]);
  const tokenizedLines = useMemo(
    () => lines.map((line) => Prism.tokenize(line, Prism.languages.python)),
    [lines]
  );

  // 记录每行的ref
  const lineRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [lineTops, setLineTops] = useState<{ [line: number]: number }>({});

  // hover延迟定时器
  const hoverTimeout = useRef<number | null>(null);
  const leaveTimeout = useRef<number | null>(null);

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
    <Panel className="relative w-full font-mono text-sm" style={{ minHeight: 200 }}>
      <table style={{ width: '100%' }}>
        <tbody>
          {tokenizedLines.map((tokens, idx) => {
            const lineNumber = idx + 1;
            const isSceneHighlight = highlightedLines.includes(lineNumber);
            const isExplanationHighlight = hoveredLine === lineNumber;
            const highlight = isSceneHighlight || isExplanationHighlight;
            const explanation = explanationMap.get(lineNumber);
            // hover事件处理
            const handleEnter = () => {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
              hoverTimeout.current = setTimeout(() => {
                setHoveredLine(lineNumber);
              }, HOVER_DELAY);
            };
            const handleLeave = () => {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              leaveTimeout.current = setTimeout(() => {
                setHoveredLine(null);
              }, LEAVE_DELAY);
            };
            // 浮层也要保持hover
            const handlePopoverEnter = () => {
              if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
            };
            const handlePopoverLeave = () => {
              leaveTimeout.current = setTimeout(() => {
                setHoveredLine(null);
              }, LEAVE_DELAY);
            };
            return (
              <tr
                key={lineNumber}
                ref={el => (lineRefs.current[idx] = el)}
                className={`code-line ${highlight ? 'interactive-highlight' : ''}`}
                style={{ position: 'relative', transition: 'background 0.2s, color 0.2s' }}
                onMouseEnter={explanation ? handleEnter : undefined}
                onMouseLeave={explanation ? handleLeave : undefined}
              >
                <td style={{ userSelect: 'none', textAlign: 'right', paddingRight: 8, color: '#aaa', width: 1 }}>
                  {lineNumber}
                </td>
                <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: '1rem', position: 'relative' }}>
                  {renderToken(tokens, lineNumber, 0, locations, setHoveredVar, hoveredVar)}
                  {/* 解释浮层，绝对定位在右侧 */}
                  {explanation && hoveredLine === lineNumber && (
                    <div
                      className="explanation-popover visible bg-panel-bg text-foreground shadow-lg rounded p-3 ml-4"
                      style={{
                        position: 'absolute',
                        left: '100%',
                        top: 0,
                        minWidth: 240,
                        maxWidth: 340,
                        zIndex: 10,
                        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                      }}
                      onMouseEnter={handlePopoverEnter}
                      onMouseLeave={handlePopoverLeave}
                    >
                      {explanation}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
};

export default CodePanel; 