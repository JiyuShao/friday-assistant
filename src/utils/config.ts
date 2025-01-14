import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { LLMType } from '../services/llms/deepseek';
import { mergeCloneDeep } from './merge';

export interface Config {
  // 机器人配置
  BOT_NAME: string;
  BOT_AUTO_REPLY_PREFIX: string;
  BOT_ALIAS_WHITELIST: string;
  BOT_ROOM_WHITELIST: string;
  BOT_SINGLE_MESSAGE_MAX_SIZE: number;

  // 大模型配置
  LLM_TYPE: LLMType;
  // DeepSeek llm 配置
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL: string;
  DEEPSEEK_BASE_URL: string;
  DEEPSEEK_SYSTEM_MESSAGE: string;
}

let envConfig: Config | undefined = undefined;

export const getConfig = (): Config => {
  if (typeof envConfig === 'undefined') {
    const parsedConfig: Config = mergeCloneDeep(dotenv.config().parsed, {
      BOT_NAME: 'F.R.I.D.A.Y.',
      BOT_AUTO_REPLY_PREFIX: '',
      BOT_ALIAS_WHITELIST: '',
      BOT_ROOM_WHITELIST: '',
      BOT_SINGLE_MESSAGE_MAX_SIZE: 500,
      LLM_TYPE: LLMType.DeepSeek,
      DEEPSEEK_MODEL: 'deepseek-chat',
      DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
      DEEPSEEK_SYSTEM_MESSAGE: 'You are a helpful assistant.',
    });
    envConfig = parsedConfig;
  }
  validateConfig(envConfig);
  return envConfig;
};

export const setConfig = (newConfig: Partial<Config>) => {
  envConfig = mergeCloneDeep(getConfig(), newConfig);
  validateConfig(envConfig);
};

const validateConfig = (envConfig: Config | undefined) => {
  if (!envConfig) {
    throw new Error('envConfig 未初始化');
  }
  // 检查大模型配置
  if (
    !envConfig.LLM_TYPE ||
    !Object.values(LLMType).includes(envConfig.LLM_TYPE)
  ) {
    throw new Error(
      `LLM_TYPE 环境变量必须是: ${Object.values(LLMType).join(', ')}`
    );
  }
  if (envConfig.LLM_TYPE === LLMType.DeepSeek) {
    const missingVars: string[] = [];
    if (!envConfig.DEEPSEEK_API_KEY) missingVars.push('DEEPSEEK_API_KEY');
    if (!envConfig.DEEPSEEK_MODEL) missingVars.push('DEEPSEEK_MODEL');
    if (!envConfig.DEEPSEEK_BASE_URL) missingVars.push('DEEPSEEK_BASE_URL');
    if (!envConfig.DEEPSEEK_SYSTEM_MESSAGE)
      missingVars.push('DEEPSEEK_SYSTEM_MESSAGE');

    if (missingVars.length > 0) {
      throw new Error(`缺少以下必需的环境变量: ${missingVars.join(', ')}`);
    }
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ProjectConfig {
  version: string;
  name: string;
}

export const getProjectConfig = (): ProjectConfig => {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
  );
};
