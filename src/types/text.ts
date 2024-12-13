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
