import { ViewPlugin, Decoration, ViewUpdate } from '@codemirror/view';
import type { RangeSet } from '@codemirror/state';

// 标记的正则表达式
const TAG_REGEX = /^\s*# scene-id: (\w+)_(start|end)\s*$/;

// 定义高亮和隐藏的装饰器
const highlightDecoration = Decoration.line({ attributes: { class: 'cm-highlighted-line' } });
const hideDecoration = Decoration.replace({});

/**
 * 一个集成了隐藏标记和代码高亮功能的 CodeMirror 扩展。
 * @param activeTag 当前需要高亮的场景标签 (e.g., 'create_d1').
 */
export const customHighlightExtension = (activeTag: string) => {
  return ViewPlugin.fromClass(
    class {
      decorations: RangeSet<Decoration>;

      constructor() {
        // 初始化时创建一个空的装饰集
        this.decorations = Decoration.none;
      }

      update(update: ViewUpdate) {
        // 仅当文档或视口变化时才重新计算
        if (!update.docChanged && !update.viewportChanged) {
          return;
        }

        const builder: any[] = [];
        const doc = update.state.doc;
        let highlightStartLine = -1;

        for (let i = 1; i <= doc.lines; i++) {
          const line = doc.line(i);
          const match = line.text.match(TAG_REGEX);

          if (match) {
            const [, tagName, type] = match;

            // 1. 隐藏所有标记行
            builder.push(hideDecoration.range(line.from, line.to));

            // 2. 查找当前激活场景的起始标记
            if (tagName === activeTag && type === 'start') {
              highlightStartLine = i + 1; // 高亮从标记的下一行开始
            }
            
            // 3. 查找到结束标记时，应用高亮
            if (tagName === activeTag && type === 'end' && highlightStartLine !== -1) {
              for (let j = highlightStartLine; j < i; j++) {
                const lineToHighlight = doc.line(j);
                builder.push(highlightDecoration.range(lineToHighlight.from));
              }
              highlightStartLine = -1; // 重置
            }
          }
        }
        
        this.decorations = Decoration.set(builder.sort((a, b) => a.from - b.from));
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}; 