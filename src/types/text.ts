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

export const diff = {
  newDiffs: [
    {
      id: 0,
      type: 0,
      text: '一战前的欧洲人就是如此。普通人',
      reason: '保持不变',
    },
    {
      id: 1,
      type: -1,
      text: '是那是真的喜欢',
      replaceId: 1,
      reason: '改善表达方式，用更正式的措辞替换口语化表达',
    },
    {
      id: 2,
      type: 1,
      text: '确实热衷于',
      replaceId: 1,
      reason: '改善表达方式，用更正式的措辞替换口语化表达',
    },
    { id: 3, type: 0, text: '鼓吹战争和民族主义。', reason: '保持不变' },
    { id: 4, type: -1, text: ' ', reason: '删除多余空格' },
    { id: 5, type: 0, text: '后来一战爆发，这些', reason: '保持不变' },
    {
      id: 6,
      type: -1,
      text: '耗材们被抓',
      replaceId: 2,
      reason: '改善用词，避免贬义词，使用更中性的表达',
    },
    {
      id: 7,
      type: 1,
      text: '人被征召',
      replaceId: 2,
      reason: '改善用词，避免贬义词，使用更中性的表达',
    },
    { id: 8, type: 0, text: '去填战壕，被督战队', reason: '保持不变' },
    {
      id: 9,
      type: -1,
      text: '的',
      replaceId: 3,
      reason: '优化语言结构，使表达更流畅',
    },
    {
      id: 10,
      type: 1,
      text: '用',
      replaceId: 3,
      reason: '优化语言结构，使表达更流畅',
    },
    { id: 11, type: 0, text: '枪指着脑袋冲锋，', reason: '保持不变' },
    {
      id: 12,
      type: -1,
      text: '然后',
      replaceId: 4,
      reason: '改善表达方式，强调最终结果',
    },
    {
      id: 13,
      type: 1,
      text: '最终',
      replaceId: 4,
      reason: '改善表达方式，强调最终结果',
    },
    { id: 14, type: 0, text: '被碉堡', reason: '保持不变' },
    { id: 15, type: 1, text: '、', reason: '添加标点符号，使列举更规范' },
    { id: 16, type: 0, text: '铁丝网', reason: '保持不变' },
    { id: 17, type: 1, text: '和', reason: '添加连接词，使句子更流畅' },
    { id: 18, type: 0, text: '重机枪', reason: '保持不变' },
    { id: 19, type: 1, text: '"', reason: '添加引号，规范拟声词的使用' },
    { id: 20, type: 0, text: '哗啦啦', reason: '保持不变' },
    {
      id: 21,
      type: 1,
      text: '"地',
      replaceId: 5,
      reason: '规范引号使用并添加助词，使语言更规范',
    },
    { id: 22, type: 0, text: '收割。', reason: '保持不变' },
    {
      id: 23,
      type: -1,
      text: ' 千万别以为这些耗材是纯底层，拿',
      replaceId: 6,
      reason: '改善表达方式，使用更正式和客观的措辞',
    },
    {
      id: 24,
      type: 1,
      text: '这些牺牲者并非都是底层民众，以',
      replaceId: 6,
      reason: '改善表达方式，使用更正式和客观的措辞',
    },
    { id: 25, type: 0, text: '一战时期', reason: '保持不变' },
    { id: 26, type: 1, text: '的', reason: '添加助词，使语言更流畅' },
    { id: 27, type: 0, text: '法国', reason: '保持不变' },
    {
      id: 28,
      type: -1,
      text: '来说，因为压榨过度，',
      replaceId: 7,
      reason: '改善表达方式，使用更客观的描述',
    },
    {
      id: 29,
      type: 1,
      text: '为例，由于过度征兵导致',
      replaceId: 7,
      reason: '改善表达方式，使用更客观的描述',
    },
    { id: 30, type: 0, text: '出生率', reason: '保持不变' },
    {
      id: 31,
      type: -1,
      text: '崩盘',
      replaceId: 8,
      reason: '改用更正式的词语',
    },
    { id: 32, type: 1, text: '骤降', replaceId: 8, reason: '改用更正式的词语' },
    { id: 33, type: 0, text: '，兵', reason: '保持不变' },
    {
      id: 34,
      type: -1,
      text: '员',
      replaceId: 9,
      reason: '用字改进，使用更准确的词语',
    },
    {
      id: 35,
      type: 1,
      text: '源',
      replaceId: 9,
      reason: '用字改进，使用更准确的词语',
    },
    { id: 36, type: 0, text: '不足，', reason: '保持不变' },
    {
      id: 37,
      type: -1,
      text: '不得不把',
      replaceId: 10,
      reason: '改善句式，使表达更简洁',
    },
    {
      id: 38,
      type: 1,
      text: '连',
      replaceId: 10,
      reason: '改善句式，使表达更简洁',
    },
    { id: 39, type: 0, text: '巴黎高师和巴黎综合理工', reason: '保持不变' },
    {
      id: 40,
      type: -1,
      text: '毕业的年轻数学家都当耗材用，比如最早搞期权定价公式的巴舍里耶就真去当过耗材。 打完两次世界大战后，欧洲人总算是开化了，普通人不会随意鼓吹战争了。 至于现在，可能是底层人因为见识问题，接收的都是错误信息，以为战争很容易吧？在大部分',
      replaceId: 11,
      reason: '重写段落，使表达更专业、客观',
    },
    {
      id: 41,
      type: 1,
      text: '的优秀毕业生也被征召入伍，其中就包括最早研究期权定价公式的巴舍里耶。经历两次世界大战后，欧洲人终于认识到战争的残酷，普通民众不再轻易鼓吹战争。而今天，可能是一些人见识有限，接受了错误信息，才会认为战争是件容易的事。在',
      replaceId: 11,
      reason: '重写段落，使表达更专业、客观',
    },
    { id: 42, type: 0, text: '80', reason: '保持不变' },
    { id: 43, type: 1, text: '、', reason: '添加标点符号，使表达更规范' },
    { id: 44, type: 0, text: '90', reason: '保持不变' },
    {
      id: 45,
      type: -1,
      text: '都是',
      replaceId: 12,
      reason: '改善表达方式，使语言更准确',
    },
    {
      id: 46,
      type: 1,
      text: '后多为',
      replaceId: 12,
      reason: '改善表达方式，使语言更准确',
    },
    { id: 47, type: 0, text: '独生子女', reason: '保持不变' },
    {
      id: 48,
      type: -1,
      text: '年的代，真来一次大规模战争，怕是得有几千万家庭断子绝孙，到时候可能就会觉得疼了',
      replaceId: 13,
      reason: '改善结尾表达，使用更正式和深刻的描述',
    },
    {
      id: 49,
      type: 1,
      text: '的年代，一旦爆发大规模战争，将会导致数以千万计的家庭失去唯一的孩子，那时才会真正体会到战争的痛苦',
      replaceId: 13,
      reason: '改善结尾表达，使用更正式和深刻的描述',
    },
    { id: 50, type: 0, text: '。', reason: '保持不变' },
  ],
};
