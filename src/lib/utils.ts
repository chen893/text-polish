import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 根据分割点将长文本分段
 * @param text 完整的文本内容
 * @param splitPoints 分割点数组，每个分割点都是文本中实际存在的句子结尾
 * @returns 分段后的文本数组
 */
export function splitTextByPoints(
  text: string,
  splitPoints: string[]
): string[] {
  // 如果文本为空或分割点为空，直接返回包含原文的数组
  if (!text || !splitPoints.length) {
    return [text];
  }

  const segments: string[] = [];
  let currentPosition = 0;

  // 按顺序处理每个分割点
  for (const point of splitPoints) {
    // 查找分割点在文本中的位置
    const pointIndex = text.indexOf(point, currentPosition);

    // 如果找不到分割点，跳过这个分割点
    if (pointIndex === -1) {
      continue;
    }

    // 提取从当前位置到分割点结束的文本段
    const segment = text.substring(currentPosition, pointIndex + point.length);

    // 只有当段落内容不为空时才添加到结果中
    if (segment.trim()) {
      segments.push(segment);
    }

    // 更新当前位置到分割点之后
    currentPosition = pointIndex + point.length;
  }

  // 处理最后一段文本
  const lastSegment = text.substring(currentPosition);
  if (lastSegment.trim()) {
    segments.push(lastSegment);
  }

  return segments;
}
