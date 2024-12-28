import { PolishStyle, PolishTone, DiffOperation } from '@/types/text';
import diff_match_patch from 'diff-match-patch';

// 定义进度状态接口
export interface ProgressState {
  total: number;
  current: number;
  percentage: number;
}

// 定义润色选项接口
export interface PolishOptions {
  isPolishMode: boolean;
  style?: PolishStyle;
  tone?: PolishTone;
}

// 定义基础状态接口
export interface BaseState {
  text: string;
  segments: string[];
  progress: ProgressState;
  isPolishing: boolean;
  isCustomizing: boolean;
  diffs: diff_match_patch.Diff[] | undefined;
  diffOperations: DiffOperation[];
  groupedOperations: DiffOperation[][];
  polishedText: string;
  acceptedOperations: Set<number>;
  rejectedOperations: Set<number>;
  isPolishMode: boolean;
  polishStyle?: PolishStyle;
  polishTone?: PolishTone;
  highlightedGroupId: string | null;
}

// 定义操作方法接口
export interface Actions {
  // 基础状态更新方法
  setText: (text: string) => void;
  setSegments: (segments: string[]) => void;
  setProgress: (progress: ProgressState) => void;
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

  // 分组操作相关方法
  getGroupedOperations: () => DiffOperation[][];
  updateGroupedOperations: () => void;

  // 业务方法
  resetState: () => void;
  polish: (inputText: string) => Promise<void>;
  handleCustomize: () => Promise<void>;
  handleAccept: (index: number) => void;
  handleReject: (index: number) => void;
  handleAcceptAll: () => void;
  handleRejectAll: () => void;
  getFinalText: () => string;
  handleHighlight: (index: number) => void;
}

// 合并状态和操作方法接口
export type TextEditorState = BaseState & Actions;
