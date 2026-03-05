import React from 'react';
import { motion } from 'motion/react';
import { Clock, Gauge, DollarSign, ArrowRight } from 'lucide-react';
import { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-industrial-900 border border-industrial-700 rounded-xl overflow-hidden flex flex-col h-full hover:border-brand/50 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={guide.image_url}
          alt={guide.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-industrial-900 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-brand text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
            {guide.difficulty}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl mb-2 group-hover:text-brand transition-colors line-clamp-1">
          {guide.title}
        </h3>
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1">
          {guide.summary}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-industrial-800">
          <div className="flex items-center gap-2 text-industrial-500">
            <Clock size={14} />
            <span className="text-[10px] uppercase tracking-wider font-mono">{guide.time_estimate}</span>
          </div>
          <div className="flex items-center gap-2 text-industrial-500">
            <DollarSign size={14} />
            <span className="text-[10px] uppercase tracking-wider font-mono">{guide.cost_estimate}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-industrial-800/50 flex justify-between items-center group-hover:bg-brand/10 transition-colors">
        <span className="text-[10px] uppercase font-bold tracking-widest text-industrial-400 group-hover:text-brand">View Full Guide</span>
        <ArrowRight size={16} className="text-industrial-600 group-hover:text-brand transform group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
};
