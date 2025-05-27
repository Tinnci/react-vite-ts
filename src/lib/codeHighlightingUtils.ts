export function createHighlightMap(code: string): Map<string, { from: number; to: number }> {
  const highlightMap = new Map<string, { from: number; to: number }>();
  const lines = code.split('\n');
  const tagPositions: Map<string, number> = new Map();

  let charOffset = 0;
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# scene-id:')) {
      const tag = trimmedLine.replace('# scene-id:', '').trim();
      tagPositions.set(tag, charOffset);
    }
    charOffset += line.length + 1; // +1 for the newline character
  }

  // 从 tagPositions 生成范围
  for (const [tag, position] of tagPositions.entries()) {
    if (tag.endsWith('_start')) {
      const baseTag = tag.replace('_start', '');
      const endTag = `${baseTag}_end`;
      if (tagPositions.has(endTag)) {
        highlightMap.set(baseTag, { from: position, to: tagPositions.get(endTag)! });
      }
    }
  }

  return highlightMap;
} 