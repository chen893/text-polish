'use client';
import { useState, useMemo, useCallback } from 'react';
import diff_match_patch from 'diff-match-patch';
import { purePolishText, getDiffOperations } from '@/lib/openai';
import {
  DiffOperation,
  PolishOptions,
  PolishStyle,
  PolishTone,
} from '@/types/text';

export function usePolishText() {
  const [text, setText] = useState('');
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
      const polishedText = await purePolishText(inputText, options);
      setPolishedText(polishedText);

      const dmp = new diff_match_patch();
      const computedDiffs = dmp.diff_main(inputText, polishedText);
      dmp.diff_cleanupSemantic(computedDiffs);
      setDiffs(computedDiffs);
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
  };
}
