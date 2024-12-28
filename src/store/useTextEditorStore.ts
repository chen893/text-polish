import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PolishStyle, PolishTone, DiffOperation } from '@/types/text';
import diff_match_patch from 'diff-match-patch';

// 定义 store 的状态接口
interface TextEditorState {
  // 基础状态
  text: string;
  segments: string[];
  progress: {
    total: number;
    current: number;
    percentage: number;
  };
  isPolishing: boolean;
  isCustomizing: boolean;
  diffs: diff_match_patch.Diff[] | undefined;
  diffOperations: DiffOperation[];
  polishedText: string;
  acceptedOperations: Set<number>;
  rejectedOperations: Set<number>;
  isPolishMode: boolean;
  polishStyle?: PolishStyle;
  polishTone?: PolishTone;
  highlightedGroupId: string | null;

  // 操作方法
  setText: (text: string) => void;
  setSegments: (segments: string[]) => void;
  setProgress: (progress: {
    total: number;
    current: number;
    percentage: number;
  }) => void;
  setIsPolishing: (isPolishing: boolean) => void;
  setIsCustomizing: (isCustomizing: boolean) => void;
  setDiffs: (diffs: diff_match_patch.Diff[] | undefined) => void;
  setDiffOperations: (diffOperations: DiffOperation[]) => void;
  setPolishedText: (polishedText: string) => void;
  setAcceptedOperations: (acceptedOperations: Set<number>) => void;
  setRejectedOperations: (rejectedOperations: Set<number>) => void;
  setIsPolishMode: (isPolishMode: boolean) => void;
  setPolishStyle: (polishStyle?: PolishStyle) => void;
  setPolishTone: (polishTone?: PolishTone) => void;
  setHighlightedGroupId: (highlightedGroupId: string | null) => void;
  resetState: () => void;
}

// 创建 store
export const useTextEditorStore = create<TextEditorState>()(
  persist(
    (set) => ({
      // 初始状态
      text: '',
      segments: [],
      progress: {
        total: 0,
        current: 0,
        percentage: 0,
      },
      isPolishing: false,
      isCustomizing: false,
      diffs: undefined,
      diffOperations: [],
      polishedText: '',
      acceptedOperations: new Set(),
      rejectedOperations: new Set(),
      isPolishMode: false,
      polishStyle: undefined,
      polishTone: undefined,
      highlightedGroupId: null,

      // 状态更新方法
      setText: (text) => set({ text }),
      setSegments: (segments) => set({ segments }),
      setProgress: (progress) => set({ progress }),
      setIsPolishing: (isPolishing) => set({ isPolishing }),
      setIsCustomizing: (isCustomizing) => set({ isCustomizing }),
      setDiffs: (diffs) => set({ diffs }),
      setDiffOperations: (diffOperations) => set({ diffOperations }),
      setPolishedText: (polishedText) => set({ polishedText }),
      setAcceptedOperations: (acceptedOperations) =>
        set({ acceptedOperations }),
      setRejectedOperations: (rejectedOperations) =>
        set({ rejectedOperations }),
      setIsPolishMode: (isPolishMode) => set({ isPolishMode }),
      setPolishStyle: (polishStyle) => set({ polishStyle }),
      setPolishTone: (polishTone) => set({ polishTone }),
      setHighlightedGroupId: (highlightedGroupId) =>
        set({ highlightedGroupId }),
      resetState: () =>
        set({
          diffs: undefined,
          diffOperations: [],
          polishedText: '',
          acceptedOperations: new Set(),
          rejectedOperations: new Set(),
          isCustomizing: false,
          progress: {
            total: 0,
            current: 0,
            percentage: 0,
          },
        }),
    }),
    {
      name: 'text-editor-storage', // 存储的键名
      partialize: (state) => ({
        // 只持久化这些状态
        text: state.text,
        isPolishMode: state.isPolishMode,
        polishStyle: state.polishStyle,
        polishTone: state.polishTone,
        diffs: state.diffs,
        polishedText: state.polishedText,
        diffOperations: state.diffOperations,
      }),
    }
  )
);
