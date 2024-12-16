import OpenAI from 'openai';
import { diffsPrompt } from './prompt';
import { DiffOperation, PolishOptions } from '@/types/text';
import diff_match_patch from 'diff-match-patch';
import { generatePrompt } from './prompt';

const openai = new OpenAI({
  baseURL:
    process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export async function purePolishText(
  text: string,
  options: PolishOptions = { isPolishMode: false }
): Promise<string> {
  const prompt = generatePrompt(options);
  const response = await openai.chat.completions.create({
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: `请帮我${options.isPolishMode ? '润色' : '校对'}以下文本（下方的内容都被视为需要校对或润色的文本内容）：\n\n${text}`,
      },
    ],
    temperature: 1,
    max_tokens: Number(process.env.NEXT_PUBLIC_OPENAI_MAX_TOKENS || 40960),
  });

  try {
    const proofreadingText = extractTextFromTag(
      response.choices[0]?.message?.content || '',
      'TextAfterProofreading'
    ).reduce((max, item) => {
      return max.length > item.length ? max : item;
    }, '');

    const polishingText = extractTextFromTag(
      response.choices[0]?.message?.content || '',
      'TextAfterPolishing'
    ).reduce((max, item) => {
      return max.length > item.length ? max : item;
    }, '');

    // const errorList = extractTextFromTag(
    //   response.choices[0]?.message?.content || '',
    //   'ErrorList'
    // )

    // console.log('errorList', errorList)
    const resultText = options.isPolishMode ? polishingText : proofreadingText;
    return resultText.length > 0
      ? resultText
      : response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error parsing result:', error);
    return '';
  }
}

// 接受新旧文本，返回diff操作数据
export async function getDiffOperations(
  oldText: string,
  newText: string
): Promise<DiffOperation[]> {
  const dmp = new diff_match_patch();
  // const diffs = dmp.diff_main(oldText, newText);
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);
  const newDiffs = diffs.map((diff, index) => {
    return {
      type: diff[0],
      text: diff[1],
      id: index,
    };
  });

  const response = await openai.chat.completions.create({
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: diffsPrompt },
      {
        role: 'user',
        content: `${JSON.stringify(newDiffs)}`,
      },
    ],
    temperature: 1,
    max_tokens: Number(process.env.NEXT_PUBLIC_OPENAI_MAX_TOKENS || 40960),
  });
  let content = response.choices[0]?.message?.content || '';
  try {
    if (content.includes('```json')) {
      content = content.split('```json')[1].split('```')[0];
    }
    const obj = JSON.parse(content);
    return obj.newDiffs as DiffOperation[];
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
}

// 提取指定标签内部文本的函数
function extractTextFromTag(htmlString: string, tagName: string) {
  // 创建一个临时的 DOM 解析器
  const parser = new DOMParser();

  // 将 HTML 字符串解析为 DOM 文档
  const doc = parser.parseFromString(htmlString, 'text/html');

  // 选择所有指定的标签
  const tags = doc.getElementsByTagName(tagName);

  // 存储提取的文本
  const extractedTexts = [];

  // 遍历所有找到的标签
  for (let i = 0; i < tags.length; i++) {
    // 提取标签内部的文本内容
    extractedTexts.push(tags[i]?.textContent?.trim() || '');
  }

  return extractedTexts.filter((item: string) => item.trim() !== '');
}

// 确保 JSON 字符串中的双引号被正确转义
// function ensureJsonSafe(jsonString: string): string {
//   // 使用正则表达式找到 JSON 对象中 text 和 original 字段中未转义的双引号
//   return jsonString.replace(
//     /("text"|"original"):\s*"(.*?)"/g,
//     (match, field, content) => {
//       // 将内容中的未转义双引号转义
//       const escapedContent = content.replace(/(?<!\\)"/g, '\\"');
//       return `${field}:"${escapedContent}"`;
//     }
//   );
// }

// export async function polishText(text: string): Promise<Operation[] | []> {
//   const response = await openai.chat.completions.create({
//     model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
//     messages: [
//       {
//         role: 'system',
//         content: promptText,
//       },
//       {
//         role: 'user',
//         content: text,
//       },
//     ],
//     temperature: 0.7,
//     max_tokens: 2000,
//   });

//   const json = extractTextFromTag(
//     response.choices[0]?.message?.content || '',
//     'json'
//   )[0];

//   try {
//     // 在解析之前确保 JSON 字符串中的双引号被正确转义
//     const safeJson = ensureJsonSafe(json);
//     const data: Operation[] = JSON.parse(safeJson);

//     const newText = data.reduce(
//       (accumulator: string, currentValue: { text: string }) => {
//         return accumulator + currentValue.text;
//       },
//       ''
//     );

//     return data;
//   } catch (error) {
//     console.error('Error parsing JSON:', error);
//     return [];
//   }
// }
