"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-purple-950/20 py-1 text-left select-none">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-4 text-sm font-bold text-white uppercase tracking-wider focus:outline-none transition-colors duration-200 hover:text-purple-300"
      >
        <span>{question}</span>
        <div className="w-6 h-6 rounded-full bg-purple-950/40 border border-purple-800/20 flex items-center justify-center text-purple-400 flex-shrink-0">
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed pb-4 pr-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
