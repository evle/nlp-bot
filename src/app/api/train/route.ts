import { NextResponse } from 'next/server';
import { NlpManager } from 'node-nlp';
import path from 'path';
import fs from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'data', 'training-data.json');

export async function POST() {
  try {
    // 读取训练数据
    const rawData = await fs.readFile(dataFilePath, 'utf-8');
    const { data } = JSON.parse(rawData);

    const manager = new NlpManager({ languages: ['zh'] });
    
    // 添加训练数据
    data.forEach((item: any) => {
      // 为每个问题添加文档
      item.questions.forEach((question: string) => {
        manager.addDocument('zh', question, item.intent);
      });
      // 添加单个答案
      manager.addAnswer('zh', item.intent, item.answer);
    });

    // 训练模型
    await manager.train();

    // 保存模型
    await manager.save(path.join(process.cwd(), 'model.nlp'));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { error: 'Failed to train model' },
      { status: 500 }
    );
  }
} 