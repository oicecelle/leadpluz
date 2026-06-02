"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import AnimatedCounter from "./AnimatedCounter";
import GlowOrb from "./GlowOrb";
import HeroMockup from "./HeroMockup";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12 overflow-hidden grid-pattern">
      {/* Background Glows */}
      <GlowOrb className="top-10 -right-20" size="600px" color="rgba(139, 69, 212, 0.2)" />
      <GlowOrb className="bottom-10 -left-20" size="400px" color="rgba(107, 47, 181, 0.15)" delay={2} />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-6 lg:space-y-8 text-left"
        >
          <div>
            <SectionBadge text="Plataforma de prospecção B2B" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold tracking-tight leading-[1.1] text-white">
            <GradientText>Encontre clientes.</GradientText>
            <br />
            Conecte. Converta.
          </h1>

          <p className="text-base md:text-lg text-gray-400 max-w-lg leading-relaxed">
            LEADPLUZ busca leads qualificados, dispara mensagens no WhatsApp e gerencia todo o seu funil comercial em um só lugar.
          </p>

          {/* KPI list */}
          <div className="grid grid-cols-3 gap-4 py-4 max-w-lg border-y border-purple-950/20">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-extrabold text-white flex items-center">
                +<AnimatedCounter value={24000} duration={2} />
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Leads Gerados</span>
            </div>
            
            <div className="flex flex-col border-l border-purple-950/20 pl-4">
              <span className="text-2xl md:text-3xl font-extrabold text-white flex items-center">
                <AnimatedCounter value={98} duration={2.2} />%
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Taxa de Entrega</span>
            </div>
            
            <div className="flex flex-col border-l border-purple-950/20 pl-4">
              <span className="text-2xl md:text-3xl font-extrabold text-white flex items-center">
                <AnimatedCounter value={3} duration={1.5} />x
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Mais Conversões</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="https://go.leadpluz.com/cadastro"
              className="btn-gradient px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white text-center flex items-center justify-center space-x-2"
            >
              <span>Começar agora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#como-funciona"
              className="px-8 py-4 border border-purple-800/40 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all duration-200 text-center"
            >
              Ver como funciona
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Interactive Mockup */}
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
