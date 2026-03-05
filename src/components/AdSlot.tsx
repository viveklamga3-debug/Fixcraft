import React from 'react';
import { motion } from 'motion/react';

export const AdSlot: React.FC<{ position: 'top' | 'sidebar' | 'bottom' }> = ({ position }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className={`bg-industrial-800 border border-industrial-700 flex items-center justify-center overflow-hidden relative group ${
        position === 'top' ? 'h-24 w-full my-8' : 
        position === 'sidebar' ? 'h-[600px] w-full' : 
        'h-32 w-full my-12'
      }`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-industrial-600 text-[10px] uppercase tracking-widest font-mono">
        Advertisement
      </div>
      <div className="absolute top-2 right-2 w-1 h-1 bg-brand rounded-full animate-pulse" />
    </motion.div>
  );
};
