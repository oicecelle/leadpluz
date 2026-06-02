"use client";

import { motion } from "framer-motion";
import { Check, Users, Send } from "lucide-react";
import { useState, useEffect } from "react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function DemoSection() {
  const [progress, setProgress] = useState(0);
  const [leadCounter, setLeadCounter] = useState(120);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setLeadCounter(120);
          return 0;
        }
        return prev + 1;
      });
    }, 100);

    const counterInterval = setInterval(() => {
      setLeadCounter((prev) => {
        if (prev >= 980) return 980;
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 150);

    return () => {
      clearInterval(progressInterval);
      clearInterval(counterInterval);
    };
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#050508] to-[#0a0a0f] border-t border-purple-950/20 overflow-hidden relative">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[450px] h-[450px] bg-purple-950/15 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-left"
        >
          <SectionBadge text="Demonstração" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Veja o <GradientText>LEADPLUZ</GradientText> em ação
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md">
            Experimente o poder de automatizar sua prospecção. Assista como nossa busca e sistema de disparo rodam em segundo plano de forma contínua e integrada.
          </p>

          <div className="space-y-3.5 pt-2">
            {[
              "Busca retorna leads em menos de 3 segundos",
              "Disparos com taxa de entrega acima de 98%",
              "CRM atualizado em tempo real"
            ].map((bullet, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs font-semibold text-gray-300">
                <div className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Animated Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="bg-[#0f0f1a] border border-purple-800/20 rounded-2xl p-5 md:p-6 w-full max-w-[500px] shadow-2xl space-y-5 font-sans relative text-left select-none">
            
            {/* Simulation Header */}
            <div className="flex justify-between items-center border-b border-purple-950/20 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-800/35 flex items-center justify-center text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block leading-none">Status da Campanha</span>
                  <span className="text-white text-xs font-bold">Disparos de Prospecção</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-green-950/20 border border-green-500/35 text-green-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                <span>Processando</span>
              </div>
            </div>

            {/* Simulated Live KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#050508] border border-purple-950/30 p-3 rounded-xl flex flex-col space-y-1">
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Busca de Leads</span>
                <span className="text-xl font-extrabold text-white">{leadCounter}</span>
                <span className="text-[8px] text-purple-400 font-semibold">Leads adicionados</span>
              </div>

              <div className="bg-[#050508] border border-purple-950/30 p-3 rounded-xl flex flex-col space-y-1">
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Entregues</span>
                <span className="text-xl font-extrabold text-white">
                  {Math.round(leadCounter * 0.98)}
                </span>
                <span className="text-[8px] text-green-400 font-semibold">98.2% de sucesso</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Progresso de Envio</span>
                <span className="text-white font-mono font-bold">{progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-[#050508] border border-purple-950/30 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all duration-100" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            {/* Activity Stream simulator */}
            <div className="space-y-2 bg-[#050508] border border-purple-950/30 p-3 rounded-xl">
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Histórico de Atividade</span>
              <div className="space-y-1.5 max-h-[80px] overflow-hidden">
                <div className="flex items-center justify-between text-[9px] text-gray-300">
                  <span className="flex items-center space-x-1.5">
                    <Send className="w-2.5 h-2.5 text-purple-400" />
                    <span className="font-semibold text-white">Mensagem enviada</span>
                    <span className="text-gray-500">para Bella Estética</span>
                  </span>
                  <span className="text-gray-600">agora</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-gray-300">
                  <span className="flex items-center space-x-1.5">
                    <Check className="w-2.5 h-2.5 text-green-400" />
                    <span className="font-semibold text-white">Campanha Pausada</span>
                    <span className="text-gray-500">cliente respondeu "Quero info"</span>
                  </span>
                  <span className="text-gray-600">1m atrás</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
