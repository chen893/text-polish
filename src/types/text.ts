export type OperationType = -1 | 0 | 1;

export interface DiffOperation {
  id: number;
  type: number;
  text: string;
  reason: string;
  replaceId?: number;
}

// 文本风格枚举
export enum PolishStyle {
  Simple = '简单',
  Business = '商业',
  Academic = '学术',
  Informal = '非正式',
}

// 语气枚举
export enum PolishTone {
  Enthusiastic = '热情',
  Friendly = '亲切',
  Confident = '自信',
  Diplomatic = '外交',
}

export interface PolishOptions {
  isPolishMode: boolean;
  style?: PolishStyle;
  tone?: PolishTone;
}
