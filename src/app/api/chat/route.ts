import { NextResponse } from 'next/server';
import ChatBot from '../../../lib/bot';

let chatBot: any = null;

// 初始化聊天机器人
async function initChatBot() {
  chatBot = new ChatBot();
  await chatBot.init();
}

// 首次初始化
initChatBot();

export async function POST(req: Request) {
  try {
    if (!chatBot) {
      await initChatBot();
    }

    const { message } = await req.json();
    const response = await chatBot.process(message);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// 添加重新加载模型的端点
export async function PUT() {
  try {
    await initChatBot();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reload error:', error);
    return NextResponse.json(
      { error: 'Failed to reload model' },
      { status: 500 }
    );
  }
} 