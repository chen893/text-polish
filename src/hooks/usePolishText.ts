'use client';
import { useState, useMemo, useCallback } from 'react';
import diff_match_patch from 'diff-match-patch';
import {
  purePolishText,
  longTextPolish,
  getDiffOperations,
} from '@/lib/openai';
import {
  DiffOperation,
  PolishOptions,
  PolishStyle,
  PolishTone,
} from '@/types/text';
import { splitTextByPoints } from '@/lib/utils';

export function usePolishText() {
  // 到达长度要求的最大值
  const MAX_LENGTH = 600;

  const [text, setText] = useState('');
  // 分段后的文本
  const [, setSegments] = useState<string[]>([]);
  // 新增进度相关状态
  const [progress, setProgress] = useState({
    total: 0, // 总段落数
    current: 0, // 当前处理的段落数
    percentage: 0, // 处理进度百分比
  });

  const [isPolishing, setIsPolishing] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [diffs, setDiffs] = useState<diff_match_patch.Diff[]>();
  const [diffOperations, setDiffOperations] = useState<DiffOperation[]>([]);
  const [polishedText, setPolishedText] = useState<string>('');

  const [acceptedOperations, setAcceptedOperations] = useState<Set<number>>(
    new Set()
  );

  const [rejectedOperations, setRejectedOperations] = useState<Set<number>>(
    new Set()
  );
  const [isPolishMode, setIsPolishMode] = useState(false);
  const [polishStyle, setPolishStyle] = useState<PolishStyle>();
  const [polishTone, setPolishTone] = useState<PolishTone>();
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(
    null
  );

  // 重置所有状态
  const resetState = useCallback(() => {
    setDiffs(undefined);
    setDiffOperations([]);
    setPolishedText('');
    setAcceptedOperations(new Set());
    setRejectedOperations(new Set());
    setIsCustomizing(false);
    // 重置进度
    setProgress({
      total: 0,
      current: 0,
      percentage: 0,
    });
  }, []);

  // 按replaceId分组的操作
  const groupedOperations: DiffOperation[][] = useMemo(() => {
    const groups = new Map<number | string, DiffOperation[]>();

    diffOperations.forEach((op) => {
      if (op.type === 0) return; // 跳过无变化的操作
      const newReplaceId = 'r-' + op.replaceId;
      if (op.replaceId !== undefined) {
        if (!groups.has(newReplaceId)) {
          groups.set(newReplaceId, []);
        }
        groups.get(newReplaceId)?.push(op);
      } else {
        groups.set(op.id, [op]);
      }
    });

    // console.log('groupedOperations', groups.values());
    return Array.from(groups.values());
  }, [diffOperations]);

  // 清理段落文本，去除多余的换行符
  const cleanParagraph = (paragraph: string): string => {
    if (paragraph.startsWith('\n') && paragraph.endsWith('\n')) {
      return paragraph.slice(1, -1);
    } else if (paragraph.startsWith('\n')) {
      return paragraph.slice(1);
    } else if (paragraph.endsWith('\n')) {
      return paragraph.slice(0, -1);
    }
    return paragraph;
  };

  // 处理单个段落的润色结果
  const handlePolishedSegment = (
    polishedSegment: string,
    originalSegment: string,
    previousText: string
  ): {
    updatedText: string;
    newDiffs: diff_match_patch.Diff[];
  } => {
    const diffTool = new diff_match_patch();
    const textDifferences = diffTool.diff_main(
      originalSegment,
      polishedSegment
    );
    diffTool.diff_cleanupSemantic(textDifferences);

    return {
      updatedText: previousText + polishedSegment,
      newDiffs: textDifferences,
    };
  };

  // 更新润色状态
  const updatePolishState = (
    originalContent: string,
    newPolishedContent: string
  ) => {
    setPolishedText((previousText) => {
      const { updatedText, newDiffs } = handlePolishedSegment(
        newPolishedContent,
        originalContent,
        previousText
      );

      // 更新差异
      setDiffs((prev) => {
        return [...(prev || []), ...newDiffs];
      });

      return updatedText;
    });
  };

  // 处理段落润色任务
  const processPolishTask = async (
    paragraph: string,
    segmentIndex: number,
    paragraphSegments: string[],
    polishedSegments: string[],
    lastProcessedIndex: { value: number },
    polishOptions: PolishOptions
  ): Promise<string> => {
    const polishedParagraph = await purePolishText(paragraph, polishOptions);
    polishedSegments[segmentIndex] = polishedParagraph;

    // 更新进度
    setProgress((prev) => {
      const current = prev.current + 1;
      return {
        ...prev,
        current,
        percentage: Math.round((current / prev.total) * 100),
      };
    });

    // 找到最后一个已润色文本的索引
    const lastCompletedIndex = polishedSegments.findLastIndex(
      (segment) => segment !== undefined
    );

    if (lastProcessedIndex.value === segmentIndex - 1) {
      let newPolishedContent = '';
      let originalContent = '';
      let currentProcessingIndex = lastProcessedIndex.value;

      for (let i = lastProcessedIndex.value + 1; i <= lastCompletedIndex; i++) {
        if (polishedSegments[i] !== undefined) {
          newPolishedContent += polishedSegments[i];
          originalContent += paragraphSegments[i];
          currentProcessingIndex = i;
        } else break;
      }

      lastProcessedIndex.value = currentProcessingIndex;
      updatePolishState(originalContent, newPolishedContent);
    }

    return polishedParagraph;
  };

  const handleShortText = async (
    inputText: string,
    polishOptions: PolishOptions
  ) => {
    const polishedText = cleanParagraph(
      await purePolishText(inputText, polishOptions)
    );

    console.log('inputText', inputText);
    console.log('polishedText', polishedText);
    setPolishedText(polishedText);

    const dmp = new diff_match_patch();
    const computedDiffs = dmp.diff_main(inputText, polishedText);
    dmp.diff_cleanupSemantic(computedDiffs);
    setDiffs(computedDiffs);
    return polishedText;
  };

  const handleLongText = async (
    inputText: string,
    polishOptions: PolishOptions
  ) => {
    // 1. 获取段落分割点
    const paragraphBreakPoints = await longTextPolish(inputText);

    if (paragraphBreakPoints.length === 0) {
      return await handleShortText(inputText, polishOptions);
    }

    // 2. 分割并清理段落
    const paragraphSegments =
      splitTextByPoints(inputText, paragraphBreakPoints as string[])?.map(
        cleanParagraph
      ) || [];
    setSegments(paragraphSegments);

    // 初始化进度
    setProgress({
      total: paragraphSegments.length,
      current: 0,
      percentage: 0,
    });

    // 3. 初始化状态
    const lastProcessedIndex = { value: -1 };
    const polishTasks: Promise<string>[] = new Array(paragraphSegments.length);
    const polishedSegments: string[] = new Array(paragraphSegments.length);

    // 4. 处理每个段落
    paragraphSegments.forEach((paragraph, segmentIndex) => {
      polishTasks.push(
        processPolishTask(
          paragraph,
          segmentIndex,
          paragraphSegments,
          polishedSegments,
          lastProcessedIndex,
          polishOptions
        )
      );
    });

    // 5. 等待所有任务完成
    await Promise.all(polishTasks);
    setIsPolishing(false);

    return polishedText;
  };

  const polish = async (inputText: string) => {
    try {
      // 重置状态
      resetState();
      setIsPolishing(true);
      setText(inputText);

      const options: PolishOptions = {
        isPolishMode,
        style: polishStyle,
        tone: polishTone,
      };

      // 获取润色后的文本
      if (inputText.length >= MAX_LENGTH) {
        await handleLongText(inputText, options);
      } else {
        await handleShortText(inputText, options);
      }

      return;
    } catch (error) {
      console.error('Error polishing text:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const getOperations = async (sourceText: string, targetText: string) => {
    try {
      const diffsOperations = await getDiffOperations(sourceText, targetText);
      setDiffOperations(diffsOperations);
    } catch (error) {
      console.error('Error getting operations:', error);
    }
  };

  const handleCustomize = async () => {
    try {
      setIsCustomizing(true);
      await getOperations(text, polishedText);
    } catch (error) {
      console.error('Error customizing:', error);
      throw error;
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleAccept = (index: number) => {
    const operation = groupedOperations[index][0];
    const idsToAccept = new Set<number>();

    if (operation.replaceId !== undefined) {
      // 如果是替换操作组，接受所有相关操作
      diffOperations.forEach((op) => {
        if (op.replaceId === operation.replaceId) {
          idsToAccept.add(op.id);
        }
      });
    } else {
      idsToAccept.add(operation.id);
    }

    setAcceptedOperations((prev) => {
      const next = new Set(prev);
      idsToAccept.forEach((id) => next.add(id));
      return next;
    });

    setRejectedOperations((prev) => {
      const next = new Set(prev);
      idsToAccept.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleReject = (index: number) => {
    const operation = groupedOperations[index][0];
    const idsToReject = new Set<number>();

    if (operation.replaceId !== undefined) {
      // 如果是替换操作组，拒绝所有相关操作
      diffOperations.forEach((op) => {
        if (op.replaceId === operation.replaceId) {
          idsToReject.add(op.id);
        }
      });
    } else {
      idsToReject.add(operation.id);
    }

    setRejectedOperations((prev) => {
      const next = new Set(prev);
      idsToReject.forEach((id) => next.add(id));
      return next;
    });

    setAcceptedOperations((prev) => {
      const next = new Set(prev);
      idsToReject.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleAcceptAll = () => {
    const newAccepted = new Set(
      diffOperations.filter((op) => op.type !== 0).map((op) => op.id)
    );
    setAcceptedOperations(newAccepted);
    setRejectedOperations(new Set());
  };

  const handleRejectAll = () => {
    const newRejected = new Set(
      diffOperations.filter((op) => op.type !== 0).map((op) => op.id)
    );
    setRejectedOperations(newRejected);
    setAcceptedOperations(new Set());
  };

  const getFinalText = useCallback(() => {
    if (
      !diffOperations.length ||
      (!acceptedOperations.size && !rejectedOperations.size)
    )
      return polishedText;

    let result = '';

    diffOperations.forEach((operation) => {
      if (operation.type === 0) {
        result += operation.text;
      } else {
        if (rejectedOperations.has(operation.id)) {
          if (operation.type === -1) {
            // 删除
            result += operation.text;
          }
        } else {
          if (operation.type === 1) {
            // 插入
            result += operation.text;
          }
        }
      }
    });

    return result;
  }, [diffOperations, acceptedOperations, rejectedOperations, polishedText]);

  const handleHighlight = (index: number) => {
    const operation = groupedOperations[index][0];
    const groupId = operation.replaceId
      ? 'r-' + operation.replaceId
      : operation.id.toString();
    setHighlightedGroupId(groupId);
  };

  return {
    text,
    setText,
    polish,
    isPolishing,
    isCustomizing,
    diffs,
    diffOperations,
    polishedText,
    groupedOperations,
    acceptedOperations,
    rejectedOperations,
    handleAccept,
    handleReject,
    handleAcceptAll,
    handleRejectAll,
    handleCustomize,
    getFinalText,
    isPolishMode,
    setIsPolishMode,
    polishStyle,
    setPolishStyle,
    polishTone,
    setPolishTone,
    resetState,
    highlightedGroupId,
    handleHighlight,
    MAX_LENGTH,
    progress, // 导出进度状态
  };
}
