'use client';

import { useState } from 'react';

interface TrainingData {
  id: string;
  intent: string;
  questions: string[];
  answer: string;
}

interface TrainingDataTableProps {
  data: TrainingData[];
  onUpdate: () => void;
}

export default function TrainingDataTable({ data, onUpdate }: TrainingDataTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<TrainingData | null>(null);

  const generateIntent = (question: string) => {
    const cleanQuestion = question.replace(/[^\w\s\u4e00-\u9fa5]/g, '');
    const keywords = cleanQuestion.split(/\s+/).filter(word => word.length > 0);
    const mainKeywords = keywords.slice(0, 2).join('_');
    const timestamp = Date.now().toString().slice(-4);
    return `intent_${mainKeywords}_${timestamp}`;
  };

  const handleQuestionEdit = (question: string) => {
    if (!editData) return;
    const newIntent = generateIntent(question);
    setEditData({
      ...editData,
      question,
      intent: newIntent
    });
  };

  const handleEdit = (item: TrainingData) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`/api/training-data/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setEditingId(null);
        setEditData(null);
        onUpdate();
      } else {
        alert('更新失败，请重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('系统错误，请稍后重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条数据吗？')) return;

    try {
      const response = await fetch(`/api/training-data/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('系统错误，请稍后重试');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left text-xs font-semibold text-slate-600 border-b border-slate-200 w-[20%]">意图标识</th>
            <th className="p-3 text-left text-xs font-semibold text-slate-600 border-b border-slate-200 w-[35%]">示例问题</th>
            <th className="p-3 text-left text-xs font-semibold text-slate-600 border-b border-slate-200 w-[35%]">回答内容</th>
            <th className="p-3 text-left text-xs font-semibold text-slate-600 border-b border-slate-200 w-[10%]">操作</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data?.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
              <td className="p-3 text-slate-900">{item.intent}</td>
              <td className="p-3">
                <ul className="list-disc list-inside space-y-1">
                  {Array.isArray(item.questions) && item.questions.map((question: string, index: number) => (
                    <li key={index} className="text-slate-700 text-xs">{question}</li>
                  ))}
                </ul>
              </td>
              <td className="p-3 text-slate-700 text-xs">{item.answer}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-slate-500 text-xs">
                暂无训练数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 