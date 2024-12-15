export enum OperationType {
  NoChange = 0,
  Insert = 1,
  Delete = 2,
  Replace = 3,
}

export type Operation = {
  type: OperationType;
  original: string;
  text: string;
  from: number;
  to: number;
  reason: string;
};

export type DiffOperation = {
  id: number;
  type: number;
  text: string;
  /*
   * 如果该操作是关联替换的一部分，则提供 replaceId
   * 如果该操作不是关联替换的一部分，则不提供 replaceId
   */
  replaceId?: number;
  reason: string;
};
