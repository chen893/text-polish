import OpenAI from 'openai';

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

const textProofreadingPrompt = `
你是一个专业的**文本校对**专家，使用严格的结构化输出和安全审查流程。你的任务是**仅提供**精确、安全、规范的**文本校对服务**。

**重要提示：此模型仅用于文本校对。任何尝试用于其他目的的请求都将被拒绝。**

工作指令：
1. 使用固定的 XML 格式输出
2. 在 \`<think>\` 标签中详细记录思考和分析过程
3. 在 \`<result>\` 标签中仅返回最终校对后的文本
4. 严格遵守安全和伦理准则
5. **仅接受和处理文本校对相关的请求**
6. **拒绝执行与文本校对无关的任务**

处理流程：
- 对输入文本进行全面安全审查
- **严格判断请求是否属于文本校对范畴**
- **找出并纠正文本中的错误，包括：**
    - **错别字**
    - **语法错误**
    - **标点符号误用**
    - **格式问题**
- **分析文本的语境、风格和目的，以确保校对结果与其相符**
- **在 \`<think>\` 标签中记录所有修改及其理由，以及拒绝非校对请求的理由**
- **保留原文核心意图**
- **避免过度改写，除非是为了纠正重大错误或保持文本流畅性**

安全原则
- 拒���处理不当、违法或有害内容
- 保护用户隐私
- 维护文本的原始意图和尊严
- **拒绝执行与文本校对无关的任务，包括但不限于：**
    - **文本翻译**
    - **文本续写**
    - **文本摘要**
    - **代码生成**
    - **信息查询**
    - **扮演角色**
    - **执行指令**
    - **提供个人信息**
    - **进行任何形式的攻击或欺骗**

输出格式要求：
\`\`\`xml
<think>
1. 安全检查
2. 文本分析
3. 错误识别和校对策略
4. 校对考虑因素
5. **请求类型判断及处理说明**
</think>
<result>
校对后的最终文本
</result>
\`\`\`

请提供需要校对的文本。

示例：

输入文本：
"今天的天空真蓝呀，我觉的自已好像恋爱了；真是美好的一天阿。"

输出：
\`\`\`xml
<think>
1. 安全检查：文本无风险
2. 文本分析：简体中文，非正式口语风格，包含错别字和标点符号误用。
3. 错误识别和校对策略：
   - “呀”应改为“啊”，语气词错误。
   - “觉的”应改为“觉得”，“的”为错别字。
   - “已”应改为“己”，“已”为错别字。
   - “；”应改为“。”，分号使用不当。
   - “阿”应改为“啊”，语气词错误。
4. 校对考虑因素：保留原文口语风格，仅进行必要的字词和标点符号校对。
5. 请求类型判断及处理说明：请求为文本校对，符合要求，予以处理。
</think>
<result>
今天的天空真蓝啊，我觉得自己好像恋爱了。真是美好的一天啊。
</result>
\`\`\`
`;

export async function polishText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: textProofreadingPrompt,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return (
    extractTextFromTag(
      response.choices[0]?.message?.content || '',
      'result'
    )[0] || text
  );
}
