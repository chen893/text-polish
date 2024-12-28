import { StoreApi } from 'zustand';
import diff_match_patch from 'diff-match-patch';
import { TextEditorState, PolishOptions } from '../types/textEditor';
import { purePolishText, longTextPolish } from '@/lib/openai';
import { splitTextByPoints } from '@/lib/utils';
import { createTextEditorUtils } from '../utils/textEditor';

export const createTextProcessingService = (
  get: StoreApi<TextEditorState>['getState'],
  set: StoreApi<TextEditorState>['setState']
) => {
  const utils = createTextEditorUtils(get, set);

  return {
    // 处理段落润色任务
    processPolishTask: async (
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
      const current = get().progress.current + 1;
      utils.updateProgress(current, get().progress.total);

      // 找到最后一个已润色文本的索���
      const lastCompletedIndex = polishedSegments.findLastIndex(
        (segment) => segment !== undefined
      );

      if (lastProcessedIndex.value === segmentIndex - 1) {
        let newPolishedContent = '';
        let originalContent = '';
        let currentProcessingIndex = lastProcessedIndex.value;

        for (
          let i = lastProcessedIndex.value + 1;
          i <= lastCompletedIndex;
          i++
        ) {
          if (polishedSegments[i] !== undefined) {
            newPolishedContent += polishedSegments[i];
            originalContent += paragraphSegments[i];
            currentProcessingIndex = i;
          } else break;
        }

        lastProcessedIndex.value = currentProcessingIndex;
        utils.updatePolishState(originalContent, newPolishedContent);
      }

      return polishedParagraph;
    },

    // 处理短文本
    handleShortText: async (
      inputText: string,
      polishOptions: PolishOptions
    ): Promise<string> => {
      const polishedText = utils.cleanParagraph(
        await purePolishText(inputText, polishOptions)
      );

      set({ polishedText });

      const dmp = new diff_match_patch();
      const computedDiffs = dmp.diff_main(inputText, polishedText);
      dmp.diff_cleanupSemantic(computedDiffs);
      set({ diffs: computedDiffs });
      return polishedText;
    },

    // 处理长文本
    handleLongText: async (
      inputText: string,
      polishOptions: PolishOptions
    ): Promise<string> => {
      // 1. 获取段落分割点
      const paragraphBreakPoints = await longTextPolish(inputText);

      if (!paragraphBreakPoints.length) {
        return await createTextProcessingService(get, set).handleShortText(
          inputText,
          polishOptions
        );
      }

      // 2. 分割清理段落
      const paragraphSegments =
        splitTextByPoints(inputText, paragraphBreakPoints as string[]) || [];
      set({ segments: paragraphSegments });

      // 初始化进度
      utils.updateProgress(0, paragraphSegments.length);

      // 3. 初始化状态
      const lastProcessedIndex = { value: -1 };
      const polishTasks: Promise<string>[] = new Array(
        paragraphSegments.length
      );
      const polishedSegments: string[] = new Array(paragraphSegments.length);

      // 4. 处理每个段落
      paragraphSegments.forEach((paragraph, segmentIndex) => {
        polishTasks.push(
          createTextProcessingService(get, set).processPolishTask(
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
      set({ isPolishing: false });

      return get().polishedText;
    },
  };
};
