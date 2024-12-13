import OpenAI from 'openai';
import { promptText } from './prompt';
import { Operation } from '@/types/text';

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

  return extractedTexts;
}

const openai = new OpenAI({
  baseURL:
    process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

// console.log(textCorrectionPrompt);

export async function polishText(text: string): Promise<Operation[] | []> {
  const response = await openai.chat.completions.create({
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: promptText,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  console.log(response.choices[0]?.message?.content);
  const json = extractTextFromTag(
    response.choices[0]?.message?.content || '',
    'json'
  )[0];
  try {
    const data: Operation[] = JSON.parse(json);
    const newText = data.reduce(
      (accumulator: string, currentValue: { text: string }) => {
        return accumulator + currentValue.text;
      },
      ''
    );
    console.log('newText', newText);

    return data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
  // console.log(json);
  //   return (
  //     extractTextFromTag(
  //       response.choices[0]?.message?.content || '',
  //       'result'
  //     )[0] || text
  //   );
}
