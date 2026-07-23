"use client";

import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SpecialistBanner() {
  return (
    <section className="relative py-16 px-6 md:px-12 bg-gradient-to-r from-purple-950 via-[#180833] to-[#0d061c] border-y border-purple-500/30 overflow-hidden text-left select-none">
      
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        
        <div className="space-y-3 text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span>Consultia Especializada LeadPluz</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
            Quer ver como a LeadPluz se adapta à sua clínica?
          </h2>

          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Fale diretamente com um de nossos especialistas em automação comercial no WhatsApp. Tiramos suas dúvidas e montamos uma demonstração ao vivo adaptada ao seu fluxo.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Link
            href="https://wa.me/5521976640033?text=Quero%20falar%20com%20um%20especialista%20sobre%20o%20LeadPluz"
            target="_blank"
            className="w-full sm:w-auto px-8 py-4 bg-white text-[#050508] hover:bg-gray-100 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-2xl transition-all duration-200 hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 text-purple-700 fill-purple-700/20" />
            <span>Falar com especialista no WhatsApp</span>
            <ArrowRight className="w-4 h-4 text-[#050508]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
