"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  subtitle?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
  badge?: string;
  orderClass?: string;
}

export default function PricingCard({
  name,
  price,
  subtitle,
  features,
  ctaText,
  ctaLink,
  popular = false,
  badge = "",
  orderClass = ""
}: PricingCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      className={`relative p-6 md:p-8 rounded-2xl flex flex-col justify-between text-left select-none h-full transition-all duration-300 ${orderClass} ${
        popular
          ? "bg-[#14102a] border-2 border-purple-500 shadow-[0_0_30px_rgba(139,69,212,0.25)] scale-105 z-10"
          : "bg-[#0f0f1a] border border-purple-800/15 hover:border-purple-500/40"
      }`}
    >
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500 text-white text-[9px] font-extrabold tracking-widest uppercase flex items-center space-x-1 shadow-lg shadow-purple-950/50 animate-pulse-slow">
          <span>✦</span>
          <span>{badge || "Mais Popular"}</span>
        </div>
      )}

      {!popular && badge && (
        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">
          {badge}
        </span>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest leading-none">
            {name}
          </h3>
          <div className="flex items-baseline mt-3">
            <span className="text-sm font-semibold text-gray-500">R$</span>
            <span className="text-4xl font-extrabold text-white ml-1 font-sans">{price}</span>
            <span className="text-xs text-gray-500 ml-1">/mês</span>
          </div>
          {subtitle && <p className="text-[10px] text-purple-300 font-semibold mt-1">{subtitle}</p>}
        </div>

        <div className="h-px bg-purple-950/30" />

        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start space-x-3 text-xs text-gray-300 leading-relaxed">
              <div className="w-4 h-4 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8">
        <Link
          href={ctaLink}
          className={`block w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
            popular
              ? "btn-gradient text-white shadow-lg shadow-purple-950/50"
              : "border border-purple-800/40 text-white hover:bg-white/5"
          }`}
        >
          {ctaText}
        </Link>
      </div>
    </motion.div>
  );
}
