"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import GlowOrb from "./GlowOrb";
import HeroMockup from "./HeroMockup";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-28 pb-16 px-6 md:px-12 overflow-hidden grid-pattern">
      {/* Background Glows */}
      <GlowOrb className="top-10 -right-20" size="600px" color="rgba(139, 69, 212, 0.2)" />
      <GlowOrb className="bottom-10 -left-20" size="400px" color="rgba(107, 47, 181, 0.15)" delay={2} />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-6 lg:space-y-7 text-left"
        >
          <div>
            <SectionBadge text="CRM 100% Autônomo para Clínicas & Estética" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[60px] font-extrabold tracking-tight leading-[1.1] text-white">
            <GradientText>Atendimento & Agenda</GradientText>
            <br />
            100% no WhatsApp.
          </h1>

          <p className="text-base md:text-lg text-gray-300 max-w-xl leading-relaxed">
            Sua clínica vende, agenda e organiza leads em tempo real direto nas conversas, sem que sua equipe precise digitar nada no CRM.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="https://app.leadpluz.com/signup"
              className="btn-gradient px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white text-center flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.02] transition-all"
            >
              <span>Começar teste grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#demonstracao"
              className="px-8 py-4 border border-purple-800/40 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-purple-950/40 transition-all duration-200 text-center"
            >
              Ver demonstração
            </Link>
          </div>

          {/* Texto "Teste sem compromisso" destacado (Item 3.5) */}
          <div className="flex items-center space-x-2 pt-1 text-sm font-semibold text-purple-300/90 bg-purple-950/30 border border-purple-800/30 px-4 py-2.5 rounded-xl max-w-fit shadow-sm">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Teste sem compromisso por 7 dias grátis · Sem cartão de crédito · Configuração em 5 min</span>
          </div>
        </motion.div>

        {/* Right Column: Interactive WhatsApp & Live Timeline Mockup (Item 3.6) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <HeroMockup />
        </motion.div>

      </div>
    </section>
  );
}

