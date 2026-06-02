"use client";

import { motion } from "framer-motion";

interface GlowOrbProps {
  className?: string;
  size?: string;
  color?: string;
  delay?: number;
}

export default function GlowOrb({ 
  className = "", 
  size = "500px", 
  color = "rgba(107, 47, 181, 0.25)",
  delay = 0 
}: GlowOrbProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [0.8, 1.1, 0.8],
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        delay, 
        ease: "easeInOut" 
      }}
      className={`absolute rounded-full pointer-events-none filter blur-[80px] -z-10 ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`
      }}
    />
  );
}
