'use client';

import { useState } from 'react';
import TrainingModal from '../components/TrainingModal';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  intent?: string;
  score?: number;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // 添加用户消息到历史记录
    setChatHistory(prev => [...prev, { type: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      // 添加机器人回复到历史记录，包含意图和置信度
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        content: data.answer,
        intent: data.intent,
        score: data.score
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <div className="w-full max-w-3xl relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">NLP智能客服系统</h1>
            <p className="mt-1 text-sm text-slate-500">基于自然语言处理的智能问答系统</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#d04a02]
              text-white font-medium text-sm
              hover:bg-[#d04a02]/90
              focus:ring-2 focus:ring-[#d04a02]/20
              transition-colors duration-200"
          >
            添加训练数据
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 min-h-[500px] max-h-[600px] overflow-y-auto
          shadow-sm border border-slate-200">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`mb-4 ${
                chat.type === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] ${
                  chat.type === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-800'
                } rounded-2xl px-4 py-3`}
              >
                <div className="text-sm">{chat.content}</div>
                {chat.type === 'bot' && chat.intent && (
                  <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>意图: {chat.intent}</span>
                      <span>•</span>
                      <span>置信度: {(chat.score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="inline-block px-4 py-3 rounded-2xl bg-slate-100">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-4 rounded-xl bg-white
              shadow-sm border border-slate-200
              focus:border-[#d04a02]
              focus:ring-1 focus:ring-[#d04a02]
              transition-all duration-200
              outline-none text-slate-800
              placeholder:text-slate-400"
            placeholder="请输入您的问题..."
          />
          <button
            type="submit"
            className="px-6 py-4 rounded-xl bg-[#d04a02]
              text-white font-medium
              hover:bg-[#d04a02]/90
              focus:ring-2 focus:ring-[#d04a02]/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
            disabled={loading}
          >
            发送
          </button>
        </form>
      </div>

      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
} 