"use client";

import { motion } from "framer-motion";

interface SectionBadgeProps {
  text: string;
}

export default function SectionBadge({ text }: SectionBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-purple-800/40 bg-purple-950/30 text-purple-300 text-[10px] font-semibold uppercase tracking-widest leading-none"
    >
      <span className="text-purple-400 animate-pulse">✦</span>
      <span>{text}</span>
    </motion.div>
  );
}
