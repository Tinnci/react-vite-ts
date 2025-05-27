export function createHighlightMap(code: string): Map<string, { from: number; to: number }> {
  const highlightMap = new Map<string, { from: number; to: number }>();
  const lines = code.split('\n');
  const tagPositions: Map<string, number> = new Map();
  const tagLineLengths: Map<string, number> = new Map(); // 新增：存储标记行的长度

  let charOffset = 0;
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# scene-id:')) {
      const tag = trimmedLine.replace('# scene-id:', '').trim();
      tagPositions.set(tag, charOffset);
      tagLineLengths.set(tag, line.length); // 存储行长度
    }
    charOffset += line.length + 1; // +1 for the newline character
  }

  // 从 tagPositions 生成范围
  for (const [tag, position] of tagPositions.entries()) {
    if (tag.endsWith('_start')) {
      const baseTag = tag.replace('_start', '');
      const startTag = tag; // 完整的起始标记名称
      const endTag = `${baseTag}_end`;
      if (tagPositions.has(endTag)) {
        const startPos = tagPositions.get(startTag)!;
        const startLineLength = tagLineLengths.get(startTag)!; // 获取起始标记行长度
        const endPos = tagPositions.get(endTag)!;

        // 范围应该从起始标记行之后开始 (包括换行符)
        const rangeFrom = startPos + startLineLength + 1;
        // 范围应该在结束标记行之前结束
        const rangeTo = endPos;

        // 确保范围有效
        if (rangeTo >= rangeFrom) {
             highlightMap.set(baseTag, { from: rangeFrom, to: rangeTo });
        }
      }
    }
  }

  return highlightMap;
} 