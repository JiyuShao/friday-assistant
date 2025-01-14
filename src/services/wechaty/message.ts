import { WechatyInterface } from 'wechaty/dist/esm/src/wechaty/wechaty-impl';

import { getConfig } from '../../utils/config';
import { getLLM } from '../llms/deepseek';

/**
 * 处理消息
 * @param msg
 * @param bot
 * @param ServiceType 服务类型 'GPT' | 'Kimi'
 * @returns {Promise<void>}
 */
export async function handleMessage(
  msg: any,
  bot: WechatyInterface
): Promise<void> {
  const {
    BOT_NAME,
    BOT_AUTO_REPLY_PREFIX,
    BOT_ALIAS_WHITELIST,
    BOT_ROOM_WHITELIST,
    LLM_TYPE,
  } = getConfig();
  const getReply = getLLM(LLM_TYPE);
  const talker = msg.talker(); // 发消息人
  // const receiver = msg.to(); // 消息接收人
  const content: string = msg.text(); // 消息内容
  const room = msg.room(); // 是否是群消息
  const roomName: string = (await room?.topic()) || ''; // 群名称
  // const alias = (await talker.alias()) || (await talker.name()); // 发消息人昵称
  const aliasName: string = await talker.alias(); // 备注名称
  const name: string = await talker.name(); // 微信名称
  const isText: boolean = msg.type() === bot.Message.Type.Text; // 消息类型是否为文本
  const isRoom: boolean =
    BOT_ROOM_WHITELIST.includes(roomName) && content.includes(`${BOT_NAME}`); // 是否在群聊白名单内并且艾特了机器人
  const isAlias: boolean =
    BOT_ALIAS_WHITELIST.includes(aliasName) ||
    BOT_ALIAS_WHITELIST.includes(name); // 发消息的人是否在联系人白名单内
  const isBotSelf: boolean =
    BOT_NAME === `@${aliasName}` || BOT_NAME === `@${name}`; // 是否是机器人自己
  if (isBotSelf || !isText) return; // 如果是机器人自己发送的消息或者消息类型不是文本则不处理
  try {
    // 区分群聊和私聊
    // 群聊消息去掉艾特主体后，匹配自动回复前缀
    if (
      isRoom &&
      room &&
      content
        .replace(`${BOT_NAME}`, '')
        .trimStart()
        .startsWith(`${BOT_AUTO_REPLY_PREFIX}`)
    ) {
      const question: string =
        (await msg.mentionText()) ||
        content
          .replace(`${BOT_NAME}`, '')
          .replace(`${BOT_AUTO_REPLY_PREFIX}`, ''); // 去掉艾特的消息主体
      console.log('🌸🌸🌸 / question: ', question);
      const response: string = await getReply(question);
      await room.say(response);
    }
    // 私人聊天，白名单内的直接发送
    // 私人聊天直接匹配自动回复前缀
    if (
      isAlias &&
      !room &&
      content.trimStart().startsWith(`${BOT_AUTO_REPLY_PREFIX}`)
    ) {
      const question: string = content.replace(`${BOT_AUTO_REPLY_PREFIX}`, '');
      console.log('🌸🌸🌸 / content: ', question);
      const response: string = await getReply(question);
      await talker.say(response);
    }
  } catch (e) {
    console.error(e);
  }
}
