import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RotateCcw, Wrench, CheckCircle2 } from 'lucide-react';
import { DiagnosticQuestion, DiagnosticOption, Category } from '../types';

interface DiagnosticToolProps {
  category: Category;
  onClose: () => void;
  onSelectGuide: (id: string) => void;
  onSelectCategory: (category: Category) => void;
}

export const DiagnosticTool: React.FC<DiagnosticToolProps> = ({ category, onClose, onSelectGuide, onSelectCategory }) => {
  const [step, setStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<DiagnosticQuestion | null>(null);
  const [options, setOptions] = useState<DiagnosticOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultGuideId, setResultGuideId] = useState<string | null>(null);

  useEffect(() => {
    fetchStart();
  }, [category]);

  const fetchStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/diagnostic/start?category_id=${category.id}`);
      const data = await res.json();
      setCurrentQuestion(data.question);
      setOptions(data.options);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (option: DiagnosticOption) => {
    if (option.result_guide_id) {
      setResultGuideId(option.result_guide_id);
      setStep(3);
    } else if (option.next_question_id) {
      setLoading(true);
      try {
        const res = await fetch(`/api/diagnostic/question/${option.next_question_id}`);
        const data = await res.json();
        setCurrentQuestion(data.question);
        setOptions(data.options);
        setStep(step + 1);
      } catch (err) {
        console.error(err);
        setStep(3);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(3); // No result found
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-industrial-900 border-t sm:border border-industrial-700 w-full max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-4 sm:p-6 border-b border-industrial-700 flex justify-between items-center bg-industrial-800 shrink-0">
          <div className="flex items-center gap-3">
            <Wrench className="text-brand w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-xl sm:text-2xl truncate">Diagnostic: {category.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2">
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto">
          <div className="flex justify-between mb-8 max-w-xs mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors text-xs sm:text-sm ${
                  step >= s ? 'border-brand bg-brand text-white' : 'border-industrial-700 text-industrial-600'
                }`}>
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className={`text-[8px] sm:text-[10px] uppercase tracking-widest ${step >= s ? 'text-brand' : 'text-industrial-600'}`}>
                  {s === 1 ? 'Identify' : s === 2 ? 'Analyze' : 'Result'}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : step === 3 ? (
              <motion.div
                key="result"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-center py-4 sm:py-8"
              >
                {resultGuideId ? (
                  <>
                    <h3 className="text-2xl sm:text-3xl mb-4">We found a match!</h3>
                    <p className="text-gray-400 mb-8 text-sm sm:text-base">Based on your answers, we recommend the following guide:</p>
                    <button
                      onClick={() => onSelectGuide(resultGuideId)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest transition-all hover:scale-105"
                    >
                      View Repair Guide <ChevronRight size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl sm:text-3xl mb-4">No exact match found</h3>
                    <p className="text-gray-400 mb-8 text-sm sm:text-base">We couldn't identify the specific repair, but you can browse all guides in this category.</p>
                    <button
                      onClick={() => onSelectCategory(category)}
                      className="w-full sm:w-auto bg-industrial-700 hover:bg-industrial-600 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest transition-all"
                    >
                      Browse Category
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setStep(1); setResultGuideId(null); fetchStart(); }}
                  className="block mx-auto mt-8 text-industrial-500 hover:text-brand flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <RotateCcw size={14} /> Start Over
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <h3 className="text-xl sm:text-2xl mb-6 sm:text-white">{currentQuestion?.question}</h3>
                <div className="space-y-3">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt)}
                      className="w-full text-left p-4 bg-industrial-800 border border-industrial-700 rounded-lg hover:border-brand hover:bg-industrial-700 transition-all group flex justify-between items-center"
                    >
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">{opt.label}</span>
                      <ChevronRight size={18} className="text-industrial-600 group-hover:text-brand shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
