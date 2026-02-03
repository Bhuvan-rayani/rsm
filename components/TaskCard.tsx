
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  const bgStyle = task.coverImage
    ? { backgroundImage: `url(${task.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div
      onClick={() => onViewDetails(task)}
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      style={bgStyle as React.CSSProperties}
    >
      {/* Fallback gradient if no cover */}
      {!task.coverImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

      {/* Content */}
      <div className="relative z-10 p-3 h-40 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-2">
          {task.authorAvatar && (
            <img src={task.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full ring-2 ring-white/50" />
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">{task.category}</span>
        </div>
        <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-sm">{task.title}</h3>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-10 transition-all bg-black/50 flex items-center justify-center gap-3">
        <button className="text-white text-xs px-3 py-1 rounded bg-white/20 hover:bg-white/30">View</button>
      </div>
    </div>
  );
};

export default TaskCard;
