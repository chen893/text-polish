import { StoreApi } from 'zustand';
import { TextEditorState } from '../types/textEditor';

export const createOperationsService = (
  get: StoreApi<TextEditorState>['getState'],
  set: StoreApi<TextEditorState>['setState']
) => ({
  // 处理接受操作
  handleAccept: (index: number): void => {
    const {
      diffOperations,
      groupedOperations,
      acceptedOperations,
      rejectedOperations,
    } = get();
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
    set({ acceptedOperations: newAccepted });

    // 更新拒绝的操作
    const newRejected = new Set(rejectedOperations);
    idsToAccept.forEach((id) => newRejected.delete(id));
    set({ rejectedOperations: newRejected });
  },

  // 处理拒绝操作
  handleReject: (index: number): void => {
    const {
      diffOperations,
      groupedOperations,
      acceptedOperations,
      rejectedOperations,
    } = get();
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
    set({ rejectedOperations: newRejected });

    // 更新接受的操作
    const newAccepted = new Set(acceptedOperations);
    idsToReject.forEach((id) => newAccepted.delete(id));
    set({ acceptedOperations: newAccepted });
  },

  // 处理全部接受
  handleAcceptAll: (): void => {
    const newAccepted = new Set(
      get()
        .diffOperations.filter((op) => op.type !== 0)
        .map((op) => op.id)
    );
    set({
      acceptedOperations: newAccepted,
      rejectedOperations: new Set(),
    });
  },

  // 处理全部拒绝
  handleRejectAll: (): void => {
    const newRejected = new Set(
      get()
        .diffOperations.filter((op) => op.type !== 0)
        .map((op) => op.id)
    );
    set({
      rejectedOperations: newRejected,
      acceptedOperations: new Set(),
    });
  },

  // 获取最终文本
  getFinalText: (): string => {
    const {
      diffOperations,
      acceptedOperations,
      rejectedOperations,
      polishedText,
    } = get();
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
  },

  // 处理高亮
  handleHighlight: (index: number): void => {
    const { groupedOperations } = get();
    const operation = groupedOperations[index][0];
    const groupId = operation.replaceId
      ? 'r-' + operation.replaceId
      : operation.id.toString();
    set({ highlightedGroupId: groupId });
  },
});
