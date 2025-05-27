import React, { useMemo, useRef, useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css'; // 你可以自定义样式覆盖
import { useHoverStore } from '@/lib/hoverStore';
import { useCodeAnalysisStore } from '@/lib/codeAnalysisStore';
import type { VariableLocations } from '@/lib/pyodideService';
import { Panel } from './ui/Panel';
import { cn } from '@/lib/utils';

// Prism Token 类型声明
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PrismToken {
  type: string;
  content: string | PrismToken | Array<string | PrismToken>;
}

// 工具函数：判断某 token 是否与当前悬停元素匹配
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isHoveredElement(lineNumber: number, colStart: number, colEnd: number, locations: VariableLocations, hoveredElement: any): boolean {
  if (!hoveredElement) return false;
  const { type, name } = hoveredElement;

  const elementLocations = locations[name];
  if (!elementLocations) return false;

  return elementLocations.some((loc: any) => {
    // 检查类型是否匹配，如果 hoveredElement 类型是 'function' 或 'class'，
    // 需要同时检查 loc.type 是否为 'function_def', 'class_def', 'call', 'instance'
    let typeMatch = false;
    if (type === 'variable' && loc.type === 'variable') typeMatch = true;
    if (type === 'function' && (loc.type === 'function_def' || loc.type === 'call')) typeMatch = true;
    if (type === 'class' && (loc.type === 'class_def' || loc.type === 'instance')) typeMatch = true;

    if (!typeMatch) return false;

    // 检查位置是否重叠
    return (
      loc.lineno === lineNumber &&
      ((colStart >= loc.col_offset && colStart < loc.end_col_offset) || (colEnd > loc.col_offset && colEnd <= loc.end_col_offset))
    );
  });
}

// 递归渲染 Prism token，始终返回 ReactNode
function renderToken(
  token: string | PrismToken | Array<string | PrismToken>,
  lineNumber: number,
  colStart: number,
  locations: VariableLocations,
  setHoveredElement: (element: any) => void,
  hoveredElement: any
): React.ReactNode {
  if (typeof token === 'string') {
    // 对于字符串类型的token，如果它是变量、函数或类名，也需要处理悬停
    // 这部分逻辑比较复杂，可能需要更高级的文本分析或依赖Pyodide的更详细输出
    // 暂时跳过对纯字符串token的悬停处理
    // 优化：回退检查，如果纯字符串token的内容在 locations 中存在，尝试匹配
    const tokenText = token;
    let colEnd = colStart + tokenText.length;
    
    // 检查是否与当前悬停元素匹配（回退检查）
    const isHighlighted = isHoveredElement(lineNumber, colStart, colEnd, locations, hoveredElement);

    // TODO: 更精确地处理纯字符串token的类型判断和位置匹配
    // 目前的 isHoveredElement 依赖于 token 的类型，对于纯字符串 token 需要额外的判断逻辑
    // 暂时只根据 locations 中是否存在该名称进行简单的悬停处理
    const elementLocations = locations[tokenText];
    const isPossibleElement = elementLocations && elementLocations.some(loc => loc.lineno === lineNumber && loc.col_offset >= colStart && loc.end_col_offset <= colEnd);

    if (isPossibleElement) {
        return (
            <span
                className={isHighlighted ? 'var-highlight' : ''}
                onMouseEnter={() => {
                     // 尝试从 locations 中找到更具体的类型信息
                    const loc = elementLocations.find(loc => loc.lineno === lineNumber && loc.col_offset >= colStart && loc.end_col_offset <= colEnd);
                    let type: 'variable' | 'function' | 'class' | undefined;
                    if (loc) {
                        if (loc.type === 'variable') type = 'variable';
                        else if (loc.type === 'function_def' || loc.type === 'call') type = 'function';
                        else if (loc.type === 'class_def' || loc.type === 'instance') type = 'class';
                    }

                    if (type) {
                        setHoveredElement({ type, name: tokenText });
                    } else {
                         // 如果找不到具体类型，或者类型不支持，则不设置悬停元素
                         setHoveredElement(null);
                    }
                }}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
            >
                {tokenText}
            </span>
        );
    }

    return token;
  }
  if (Array.isArray(token)) {
    let col = colStart;
    return token.map(t => {
      const rendered = renderToken(t, lineNumber, col, locations, setHoveredElement, hoveredElement);
      const len = typeof t === 'string' ? t.length : (typeof t.content === 'string' ? t.content.length : 0);
      col += len;
      return rendered;
    });
  }
  // 递归渲染 PrismToken 的 content
  if (typeof token.content !== 'string') {
    return (
      <span className={`token ${token.type}`}>
        {renderToken(token.content, lineNumber, colStart, locations, setHoveredElement, hoveredElement)}
      </span>
    );
  }
  // 变量名、函数名、类名等高亮和事件处理
  if (
    token.type === 'variable' ||
    token.type === 'function' || // Prismjs function token may include builtin
    token.type === 'class-name' ||
    token.type === 'builtin'
  ) {
    const tokenText = token.content;
    const colEnd = colStart + tokenText.length;
    const isHighlighted = isHoveredElement(lineNumber, colStart, colEnd, locations, hoveredElement);

    return (
      <span
        className={isHighlighted ? 'var-highlight' : ''}
        onMouseEnter={() => {
          let type: 'variable' | 'function' | 'class' | undefined;
          // 更精确地根据 Prism token type 映射到我们的类型
          if (token.type === 'variable') type = 'variable';
          // Prism function token can be both function def and call, 
          // but here it's likely def or call, we can rely on locations for precision if needed later.
          // For now, map both 'function' and 'builtin' to 'function'
          else if (token.type === 'function' || token.type === 'builtin') type = 'function';
          else if (token.type === 'class-name') type = 'class';

          if (type) {
             setHoveredElement({ type, name: tokenText });
          } else {
             setHoveredElement(null);
          }
        }}
        onMouseLeave={() => setHoveredElement(null)}
        style={{ cursor: 'pointer' }}
      >
        {tokenText}
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
  const hoveredElement = useHoverStore((state) => state.hoveredElement);
  const setHoveredElement = useHoverStore((state) => state.setHoveredElement);
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
                className={cn(
                  'code-line',
                  highlight ? 'is-highlighted' : '',
                )}
                style={{ position: 'relative', transition: 'background 0.2s, color 0.2s' }}
                onMouseEnter={explanation ? handleEnter : undefined}
                onMouseLeave={explanation ? handleLeave : undefined}
              >
                <td style={{ userSelect: 'none', textAlign: 'right', paddingRight: 8, color: '#aaa', width: 1 }}>
                  <div className={cn(
                    'flex relative',
                    { 'is-highlighted': lineNumber === hoveredLine }
                  )}>
                    <span className="w-10 text-right pr-4 text-gray-400 select-none shrink-0">
                      {lineNumber}
                    </span>
                  </div>
                </td>
                <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: '1rem', position: 'relative' }}>
                  {renderToken(tokens, lineNumber, 0, locations, setHoveredElement, hoveredElement)}
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