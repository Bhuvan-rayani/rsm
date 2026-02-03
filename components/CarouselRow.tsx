import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface CarouselRowProps {
  title: string;
  tasks: Task[];
  onViewDetails: (task: Task) => void;
}

const CarouselRow: React.FC<CarouselRowProps> = ({ title, tasks, onViewDetails }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-3 px-2">{title}</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {tasks.map((t) => (
          <div key={t.id} className="min-w-[240px]">
            <TaskCard task={t} onViewDetails={onViewDetails} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CarouselRow;