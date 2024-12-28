import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { getDiffOperations } from '@/lib/openai';
import { TextEditorState } from './types/textEditor';
import { CONFIG } from './constants/textEditor';
import { createTextProcessingService } from './services/textProcessing';
import { createOperationsService } from './services/operations';
import { DiffOperation } from '@/types/text';

// 创建 store
export const useTextEditorStore = create<TextEditorState>()(
  subscribeWithSelector(
    persist(
      (set, get) => {
        const textProcessing = createTextProcessingService(get, set);
        const operations = createOperationsService(get, set);

        return {
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
          groupedOperations: [],
          polishedText: '',
          acceptedOperations: new Set(),
          rejectedOperations: new Set(),
          isPolishMode: false,
          polishStyle: undefined,
          polishTone: undefined,
          highlightedGroupId: null,

          // 获取分组后的操作
          getGroupedOperations: () => {
            return get().groupedOperations;
          },

          // 更新分组操作的方法
          updateGroupedOperations: () => {
            const { diffOperations } = get();
            const newGroupedOperations = diffOperations.reduce((groups, op) => {
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
            }, [] as DiffOperation[][]);
            set({ groupedOperations: newGroupedOperations });
          },

          // 状态更新方法
          setText: (text: string) => set({ text }),
          setSegments: (segments: string[]) => set({ segments }),
          setProgress: (progress) => set({ progress }),
          setIsPolishing: (isPolishing: boolean) => set({ isPolishing }),
          setIsCustomizing: (isCustomizing: boolean) => set({ isCustomizing }),
          setDiffs: (diffs) => set({ diffs }),
          setDiffOperations: (diffOperations) => {
            set({ diffOperations });
            console.log('setDiff');
            get().updateGroupedOperations(); // 更新分组操作
          },
          setPolishedText: (polishedText: string) => set({ polishedText }),
          setAcceptedOperations: (acceptedOperations) =>
            set({ acceptedOperations }),
          setRejectedOperations: (rejectedOperations) =>
            set({ rejectedOperations }),
          setIsPolishMode: (isPolishMode: boolean) => set({ isPolishMode }),
          setPolishStyle: (polishStyle) => set({ polishStyle }),
          setPolishTone: (polishTone) => set({ polishTone }),
          setHighlightedGroupId: (highlightedGroupId) =>
            set({ highlightedGroupId }),

          // 重置状态
          resetState: () =>
            set({
              diffs: undefined,
              diffOperations: [],
              groupedOperations: [],
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

          // 业务方法
          polish: async (inputText: string) => {
            try {
              // 重置状态
              get().resetState();
              set({ isPolishing: true, text: inputText });

              const options = {
                isPolishMode: get().isPolishMode,
                style: get().polishStyle,
                tone: get().polishTone,
              };

              // 获取润色后的文本
              if (inputText.length >= CONFIG.MAX_LENGTH) {
                await textProcessing.handleLongText(inputText, options);
              } else {
                await textProcessing.handleShortText(inputText, options);
              }
            } catch (error) {
              console.error('Error polishing text:', error);
            } finally {
              set({ isPolishing: false });
            }
          },

          handleCustomize: async () => {
            try {
              set({ isCustomizing: true });
              const operations = await getDiffOperations(
                get().text,
                get().polishedText
              );
              set({ diffOperations: operations });
            } catch (error) {
              console.error('Error customizing:', error);
              throw error;
            } finally {
              set({ isCustomizing: false });
            }
          },

          // 复用操作集合中的方法
          handleAccept: operations.handleAccept,
          handleReject: operations.handleReject,
          handleAcceptAll: operations.handleAcceptAll,
          handleRejectAll: operations.handleRejectAll,
          getFinalText: operations.getFinalText,
          handleHighlight: operations.handleHighlight,
        };
      },
      {
        name: CONFIG.STORAGE_KEY,
        partialize: (state: TextEditorState) => ({
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
  )
);

// 添加监听器，当 diffOperations 变化时自动更新 groupedOperations
useTextEditorStore.subscribe(
  (state) => state.diffOperations,
  (diffOperations) => {
    if (diffOperations.length > 0) {
      useTextEditorStore.getState().updateGroupedOperations();
    }
  }
);

// 初始化时检查并更新 groupedOperations
const initialState = useTextEditorStore.getState();
if (initialState.diffOperations.length > 0) {
  initialState.updateGroupedOperations();
}
