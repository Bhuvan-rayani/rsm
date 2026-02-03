
import React, { useState } from 'react';
import { Task, TaskCategory, TaskDifficulty, EmbedLink } from '../types';

interface TaskFormProps {
  onAdd: (task: Task) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.GENERAL);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(TaskDifficulty.BEGINNER);
  const [deadline, setDeadline] = useState('');
  const [seniorName, setSeniorName] = useState('');
  const [links, setLinks] = useState<EmbedLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');

  const handleAddLink = () => {
    if (newLinkUrl && newLinkTitle) {
      setLinks([...links, { id: Date.now().toString(), url: newLinkUrl, title: newLinkTitle }]);
      setNewLinkUrl('');
      setNewLinkTitle('');
    }
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      category,
      difficulty,
      deadline,
      links,
      postedBy: seniorName,
      createdAt: Date.now(),
    };
    onAdd(newTask);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upload New Task</h2>
            <p className="text-sm text-slate-500">Add research goals for juniors</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Task Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Implementation of ResNet-50"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Senior Name</label>
              <input 
                required
                type="text" 
                value={seniorName}
                onChange={(e) => setSeniorName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Detailed Description</label>
            <textarea 
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear roadmap and requirements..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {Object.values(TaskCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {Object.values(TaskDifficulty).map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
              <input 
                required
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase">Resources & Embeds</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Resource Title (e.g., Paper PDF)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="flex-[2] px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
              />
              <input 
                type="url" 
                placeholder="URL (YouTube, Drive, etc.)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-[3] px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
              />
              <button 
                type="button"
                onClick={handleAddLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {links.map(link => (
                <div key={link.id} className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="truncate max-w-[150px]">{link.title}</span>
                  <button type="button" onClick={() => handleRemoveLink(link.id)} className="hover:text-red-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
            >
              Post Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
