'use client';
import { useCallback } from 'react';
import diff_match_patch from 'diff-match-patch';
import {
  purePolishText,
  longTextPolish,
  getDiffOperations,
} from '@/lib/openai';
import { DiffOperation, PolishOptions } from '@/types/text';
import { splitTextByPoints } from '@/lib/utils';
import { useTextEditorStore } from '@/store/useTextEditorStore';

export function usePolishText() {
  // 到达长度要求的最大值
  const MAX_LENGTH = 600;

  // 从 store 中获取状态和方法
  const {
    text,
    setText,
    setSegments,
    progress,
    setProgress,
    isPolishing,
    setIsPolishing,
    isCustomizing,
    setIsCustomizing,
    diffs,
    setDiffs,
    diffOperations,
    setDiffOperations,
    polishedText,
    setPolishedText,
    acceptedOperations,
    setAcceptedOperations,
    rejectedOperations,
    setRejectedOperations,
    isPolishMode,
    polishStyle,
    polishTone,
    setHighlightedGroupId,
    resetState,
  } = useTextEditorStore();

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
    const { updatedText, newDiffs } = handlePolishedSegment(
      newPolishedContent,
      originalContent,
      polishedText
    );

    // 更新差异
    const currentDiffs = diffs || [];
    setDiffs([...currentDiffs, ...newDiffs]);

    // 更新润色后的文本
    setPolishedText(updatedText);
  };

  // 更新进度
  const updateProgress = (current: number, total: number) => {
    setProgress({
      total,
      current,
      percentage: Math.round((current / total) * 100),
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
    const current = progress.current + 1;
    updateProgress(current, progress.total);

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

    // 2. 分割清理段落
    const paragraphSegments =
      splitTextByPoints(inputText, paragraphBreakPoints as string[]) || [];
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

    // 更新接受的操作
    const newAccepted = new Set(acceptedOperations);
    idsToAccept.forEach((id) => newAccepted.add(id));
    setAcceptedOperations(newAccepted);

    // 更新拒绝的操作
    const newRejected = new Set(rejectedOperations);
    idsToAccept.forEach((id) => newRejected.delete(id));
    setRejectedOperations(newRejected);
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

    // 更新拒绝的操作
    const newRejected = new Set(rejectedOperations);
    idsToReject.forEach((id) => newRejected.add(id));
    setRejectedOperations(newRejected);

    // 更新接受的操作
    const newAccepted = new Set(acceptedOperations);
    idsToReject.forEach((id) => newAccepted.delete(id));
    setAcceptedOperations(newAccepted);
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

  // 按replaceId分组的操作
  const groupedOperations: DiffOperation[][] = diffOperations.reduce(
    (groups, op) => {
      if (op.type === 0) return groups;
      const newReplaceId = 'r-' + op.replaceId;
      if (op.replaceId !== undefined) {
        const existingGroup = groups.find(
          (group) =>
            group[0].replaceId !== undefined &&
            'r-' + group[0].replaceId === newReplaceId
        );
        if (existingGroup) {
          existingGroup.push(op);
        } else {
          groups.push([op]);
        }
      } else {
        groups.push([op]);
      }
      return groups;
    },
    [] as DiffOperation[][]
  );

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
    polishStyle,
    polishTone,
    resetState,
    handleHighlight,
    MAX_LENGTH,
    progress,
  };
}
