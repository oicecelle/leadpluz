"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="card-dark p-6 md:p-8 rounded-2xl flex flex-col space-y-4 text-left select-none"
    >
      <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <h3 className="text-base font-bold text-white uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
