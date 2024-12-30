'use client';

import { useState, useEffect } from 'react';
import TrainingDataTable from './TrainingDataTable';

interface TrainingData {
  id: string;
  intent: string;
  questions: string[];
  answer: string;
}

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrainingModal({ isOpen, onClose }: TrainingModalProps) {
  const [intent, setIntent] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [answer, setAnswer] = useState('');
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      const response = await fetch('/api/training-data');
      const data = await response.json();
      setTrainingData(data);
    } catch (error) {
      console.error('Error fetching training data:', error);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newData = {
        id: Date.now().toString(),
        intent,
        questions: questions.filter(q => q.trim() !== ''),
        answer
      };

      const response = await fetch('/api/training-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });

      if (response.ok) {
        setIntent('');
        setQuestions(['']);
        setAnswer('');
        fetchTrainingData();
      } else {
        alert('添加失败，请重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('系统错误，请稍后重试');
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      const trainResponse = await fetch('/api/train', {
        method: 'POST',
      });

      if (!trainResponse.ok) {
        throw new Error('Training failed');
      }

      const reloadResponse = await fetch('/api/chat', {
        method: 'PUT',
      });

      if (!reloadResponse.ok) {
        throw new Error('Model reload failed');
      }

      alert('训练完成！');
    } catch (error) {
      console.error('Error:', error);
      alert('训练过程出错，请重试');
    } finally {
      setIsTraining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[80vh] overflow-hidden flex
        shadow-lg border border-slate-200">
        <div className="w-[400px] p-6 border-r border-slate-200 flex flex-col bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 mb-4">添加训练数据</h2>
          
          <form onSubmit={handleSubmit} className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                意图标识
              </label>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="w-full p-2 rounded-lg bg-white text-sm
                  border border-slate-300
                  focus:border-[#d04a02]
                  focus:ring-1 focus:ring-[#d04a02]
                  focus:outline-none text-slate-900
                  placeholder:text-slate-400"
                placeholder="business.hours"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-700">示例问题</label>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="text-xs text-[#d04a02] hover:text-[#d04a02]/80 font-medium"
                >
                  + 添加问题
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-white text-sm
                        border border-slate-300
                        focus:border-[#d04a02]
                        focus:ring-1 focus:ring-[#d04a02]
                        focus:outline-none text-slate-900
                        placeholder:text-slate-400"
                      placeholder={`示例问题 ${index + 1}`}
                      required
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                回答内容
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-2 rounded-lg bg-white h-32 text-sm
                  border border-slate-300
                  focus:border-[#d04a02]
                  focus:ring-1 focus:ring-[#d04a02]
                  focus:outline-none text-slate-900
                  placeholder:text-slate-400 resize-none"
                placeholder="请输入回答内容..."
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full p-2 rounded-lg bg-[#d04a02] text-sm
                  text-white font-medium
                  hover:bg-[#d04a02]/90
                  focus:ring-2 focus:ring-[#d04a02]/20
                  transition-colors duration-200"
              >
                添加数据
              </button>
            </div>
          </form>

          <button
            onClick={onClose}
            className="mt-4 w-full p-2 rounded-lg text-sm
              bg-white text-slate-700 font-medium
              border border-slate-300
              hover:bg-slate-50
              transition-colors duration-200"
          >
            关闭
          </button>
        </div>

        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">训练数据管理</h2>
              <p className="mt-1 text-sm text-slate-500">管理和训练智能问答系统的数据</p>
            </div>
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="px-4 py-2 rounded-lg bg-slate-800
                text-white font-medium text-sm
                hover:bg-slate-700
                focus:ring-2 focus:ring-slate-800/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              {isTraining ? '训练中...' : '开始训练'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200">
            <TrainingDataTable 
              data={trainingData}
              onUpdate={fetchTrainingData}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 