import diff_match_patch from 'diff-match-patch';
import { StoreApi } from 'zustand';
import { TextEditorState } from '../types/textEditor';

export const createTextEditorUtils = (
  get: StoreApi<TextEditorState>['getState'],
  set: StoreApi<TextEditorState>['setState']
) => ({
  // 清理段落文本，去除多余的换行符
  cleanParagraph: (paragraph: string): string => {
    if (!paragraph) return '';
    if (paragraph.startsWith('\n') && paragraph.endsWith('\n')) {
      return paragraph.slice(1, -1);
    }
    if (paragraph.startsWith('\n')) {
      return paragraph.slice(1);
    }
    if (paragraph.endsWith('\n')) {
      return paragraph.slice(0, -1);
    }
    return paragraph;
  },

  // 处理单个段落的润色结果
  handlePolishedSegment: (
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
  },

  // 更新润色状态
  updatePolishState: (
    originalContent: string,
    newPolishedContent: string
  ): void => {
    const { updatedText, newDiffs } = createTextEditorUtils(
      get,
      set
    ).handlePolishedSegment(
      newPolishedContent,
      originalContent,
      get().polishedText
    );

    // 更新差异
    const currentDiffs = get().diffs || [];
    set({ diffs: [...currentDiffs, ...newDiffs] });

    // 更新润色后的文本
    set({ polishedText: updatedText });
  },

  // 更新进度
  updateProgress: (current: number, total: number): void => {
    set({
      progress: {
        total,
        current,
        percentage: Math.round((current / total) * 100),
      },
    });
  },
});
