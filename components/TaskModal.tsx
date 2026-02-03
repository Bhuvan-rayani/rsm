
import React, { useState, useEffect } from 'react';
import { Task, AIResearchInsight } from '../types';
import { getResearchInsights } from '../services/geminiService';
import EmbedRenderer from './EmbedRenderer';
import { CATEGORY_COLORS } from '../constants';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const [insight, setInsight] = useState<AIResearchInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getResearchInsights(task.title, task.description);
        setInsight(data);
      } catch (err) {
        setError("Failed to generate AI insights. Check your connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [task]);

  const formatDescription = (description: string) => {
    const sections = description.split('**');
    return sections.map((section, idx) => {
      if (idx % 2 === 1) {
        // Check if this bold section starts with a number
        const numberMatch = section.match(/^(\d+)\.\s*(.+)/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start mt-6 mb-3">
              <span className="text-blue-600 font-bold text-2xl mr-4 mt-0.5 flex-shrink-0">{numberMatch[1]}.</span>
              <strong className="text-slate-900 font-bold text-lg flex-1">{numberMatch[2]}</strong>
            </div>
          );
        }
        return <strong key={idx} className="text-slate-900 font-bold block mt-6 mb-3 text-lg">{section}</strong>;
      }
      return section.split('\n').map((line, lineIdx) => {
        if (!line.trim()) return <br key={`${idx}-${lineIdx}`} />;
        
        // Handle lines starting with dash (like "- Choose any problem...")
        if (line.trim().startsWith('-')) {
          return (
            <div key={`${idx}-${lineIdx}`} className="flex items-start ml-12 mb-2">
              <span className="text-slate-500 mr-3 mt-1">-</span>
              <span className="text-slate-700 leading-relaxed">{line.trim().substring(1).trim()}</span>
            </div>
          );
        }
        
        // Handle bullet points
        if (line.trim().startsWith('•')) {
          return (
            <div key={`${idx}-${lineIdx}`} className="flex items-start ml-16 mb-2">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <span className="text-slate-700 leading-relaxed">{line.trim().substring(1).trim()}</span>
            </div>
          );
        }
        
        return <p key={`${idx}-${lineIdx}`} className="text-slate-700 leading-relaxed mb-2">{line}</p>;
      });
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 flex justify-between items-start bg-gradient-to-r from-blue-50 to-slate-50 animate-slideDown">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all hover:scale-110 hover:rotate-90 duration-300">
            <svg className="w-8 h-8 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-10 space-y-8">
            {/* Task Description */}
            <section className="animate-slideUp">
              <div className="prose prose-lg max-w-none">
                {formatDescription(task.description)}
              </div>
            </section>

            {/* Resources Section - No heading, just links */}
            {task.links.length > 0 && (
              <section className="pt-4 space-y-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                {/* Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.links.filter(link => link.type === 'tool').map((link, idx) => (
                    <div key={link.id} className="animate-slideUp" style={{ animationDelay: `${0.15 + idx * 0.05}s` }}>
                      <EmbedRenderer url={link.url} title={link.title} type={link.type} />
                    </div>
                  ))}
                </div>
                
                {/* Video Resources Section */}
                {task.links.some(link => link.type === 'video') && (
                  <div className="pt-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <h4 className="text-xl font-bold text-slate-900 mb-6">Video Resources</h4>
                    <div className="space-y-6">
                      {task.links.filter(link => link.type === 'video').map((link, idx) => (
                        <div key={link.id} className="animate-slideUp" style={{ animationDelay: `${0.35 + idx * 0.1}s` }}>
                          <EmbedRenderer url={link.url} title={link.title} type={link.type} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* Footer - Removed old content, keeping it simple */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 animate-slideUp" style={{ animationDelay: '0.2s' }}>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 duration-200 shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
