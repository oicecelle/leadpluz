"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import GlowOrb from "./GlowOrb";

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 md:px-12 bg-gradient-to-b from-[#0a0a0f] to-[#050508] border-t border-purple-950/20 overflow-hidden text-center flex flex-col items-center justify-center select-none">
      
      <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size="550px" color="rgba(139, 69, 212, 0.25)" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto space-y-8 flex flex-col items-center z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-400 glow-purple shadow-xl">
          <Zap className="w-8 h-8 fill-purple-400/20" />
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Sua clínica pronta para <br />
          <span className="gradient-text">vender no piloto automático</span>
        </h2>

        <p className="text-sm md:text-base text-gray-300 max-w-lg leading-relaxed mx-auto">
          Comece agora mesmo seu teste de 7 dias grátis. Configuração rápida em 5 minutos e sem necessidade de cartão de crédito.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
          <Link
            href="https://app.leadpluz.com/signup"
            className="w-full sm:w-auto px-10 py-4 bg-white text-[#050508] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all duration-200 shadow-2xl flex items-center justify-center space-x-2 hover:scale-105"
          >
            <span>Criar conta grátis agora</span>
            <ArrowRight className="w-4 h-4 text-[#050508]" />
          </Link>
          <Link
            href="https://wa.me/5521976640033?text=Quero%20saber%20mais%20sobre%20o%20LeadPluz"
            target="_blank"
            className="w-full sm:w-auto px-8 py-4 border border-purple-800/40 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-purple-950/40 transition-all duration-200 text-center flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Falar com o suporte</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
