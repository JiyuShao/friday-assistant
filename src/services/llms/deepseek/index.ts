import fetch from 'node-fetch';

import { getConfig } from '../../../utils/config';

interface DeepSeekChatCompletion {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function getDeepSeekFreeReply(prompt: string) {
  const {
    DEEPSEEK_BASE_URL,
    DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL,
    DEEPSEEK_SYSTEM_MESSAGE,
  } = getConfig();
  try {
    const response = await fetch(DEEPSEEK_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: DEEPSEEK_SYSTEM_MESSAGE,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      }),
    });
    const data = (await response.json()) as DeepSeekChatCompletion;
    const { choices } = data;
    return choices[0].message.content;
  } catch (error) {
    console.error('getDeepSeekFreeReply failed:', error);
    throw error;
  }
}

export enum LLMType {
  DeepSeek = 'DeepSeek',
}

/**
 * 获取ai服务
 * @param llmType 服务类型 'DeepSeek'
 * @returns
 */
export function getLLM(llmType: LLMType): (prompt: string) => Promise<string> {
  switch (llmType) {
    case LLMType.DeepSeek:
      return getDeepSeekFreeReply;
    default:
      throw new Error(`不支持的 llm 服务: ${llmType}`);
  }
}
