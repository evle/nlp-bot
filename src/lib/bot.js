const { NlpManager } = require('node-nlp');

class ChatBot {
  constructor() {
    this.manager = new NlpManager({ languages: ['zh'] });
  }

  async init() {
    // 加载训练好的模型
    await this.manager.load('model.nlp');
  }

  async process(message) {
    try {
      const response = await this.manager.process('zh', message);
      return {
        answer: response.answer || '抱歉，我没有找到相关的答案',
        intent: response.intent,
        score: response.score
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        answer: '处理消息时出现错误',
        intent: '',
        score: 0
      };
    }
  }
}

module.exports = ChatBot;