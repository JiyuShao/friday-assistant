import qrTerminal from 'qrcode-terminal';
import { ScanStatus, WechatyBuilder } from 'wechaty';

import { getConfig } from '../../utils/config';
import { handleMessage } from './message';

export function start() {
  // 创建微信机器人
  const bot = WechatyBuilder.build({
    name: 'wechaty-bot',
    puppet: 'wechaty-puppet-wechat',
    puppetOptions: {
      uos: true,
    },
  });
  // 扫码
  bot.on('scan', (qrcode: string, status: ScanStatus) => {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      // 在控制台显示二维码
      qrTerminal.generate(qrcode, { small: true });
      const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
      ].join('');
      console.log(`onScan: ${qrcodeImageUrl} ${ScanStatus[status]}(${status})`);
    } else {
      console.log(`onScan: ${ScanStatus[status]}(${status})`);
    }
  });
  // 登录
  bot.on('login', user => {
    console.log(`${user} has logged in`);
    const date = new Date();
    console.log(`Current time:${date}`);
    console.log(`Automatic robot chat mode has been activated`);
  });
  // 登出
  bot.on('logout', user => {
    console.log(`${user} has logged out`);
  });
  // 收到消息
  bot.on('message', async (msg: any) => {
    console.log('🌸🌸🌸 / msg: ', msg);
    // 默认消息回复
    await handleMessage(msg, bot);
  });
  // 错误
  bot.on('error', (e: Error) => {
    console.error('❌ Wechaty error handle: ', e);
    // console.log('❌ 程序退出,请重新运行程序')
    // bot.stop()

    // // 如果 WechatEveryDay.memory-card.json 文件存在，删除
    // if (fs.existsSync('WechatEveryDay.memory-card.json')) {
    //   fs.unlinkSync('WechatEveryDay.memory-card.json')
    // }
    // process.exit()
  });

  // 启动微信机器人
  const { BOT_NAME, LLM_TYPE } = getConfig();
  bot
    .start()
    .then(() => {
      console.log(`${BOT_NAME} Start to log in wechat...`);
      console.log('🌸🌸🌸 / LLM_TYPE: ', LLM_TYPE);
    })
    .catch((e: Error) => console.error('❌ botStart error: ', e));
}
