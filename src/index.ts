import { Command } from 'commander';
import inquirer, { Answers } from 'inquirer';

import { LLMType } from './services/llms/deepseek';
import { start as wechatyStart } from './services/wechaty';
import { getProjectConfig, setConfig } from './utils/config';

const projectConfig = getProjectConfig();

interface LLMTypeAnswer extends Answers {
  llmType: LLMType;
}

async function start(llm: string) {
  try {
    if (llm) {
      setConfig({ LLM_TYPE: llm as LLMType });
    } else {
      // 如果没有配置 LLM_TYPE 或配置的值无效，则通过交互方式选择
      const { llmType } = await inquirer.prompt<LLMTypeAnswer>([
        {
          type: 'list',
          name: 'llmType', //存储当前问题回答的变量key，
          message: '请先选择服务类型',
          choices: Object.keys(LLMType).map(key => ({
            name: LLMType[key],
            value: LLMType[key],
          })),
        },
      ]);
      setConfig({ LLM_TYPE: llmType as LLMType });
    }

    // 启动 wechaty 服务
    wechatyStart();
  } catch (error) {
    console.log('❌ error:', (error as Error).message);
  }
}

const program = new Command(projectConfig.name);
program
  .alias('friday')
  .helpOption('-h, --help', '显示帮助信息')
  .description(
    'F.R.I.D.A.Y. 是微信中一位专注的个人数字助理，也是值得信赖的伙伴。'
  )
  .version(projectConfig.version, '-v, --version')
  .option('-s, --llm <type>', '跳过交互，直接设置启动的AI服务类型')
  .action(function (this: Command) {
    const { llm } = this.opts();
    start(llm);
  })
  .parse();

process.on('uncaughtException', (err: Error) => {
  console.error('❌ uncaughtException 捕获到未处理的异常: ', err);
});
