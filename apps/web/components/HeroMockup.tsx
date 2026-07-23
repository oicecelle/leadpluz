"use client";

import { motion } from "framer-motion";
import { Check, Clock, Calendar, UserCheck, AlertCircle, Sparkles, MessageSquare, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function HeroMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[580px] bg-[#090912] border border-purple-800/30 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_40px_rgba(139,69,212,0.2)] flex flex-col font-sans select-none text-left">
      
      {/* Window Header */}
      <div className="h-10 bg-[#06060c] border-b border-purple-950/40 flex items-center px-4 justify-between flex-shrink-0">
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        </div>
        <div className="flex items-center space-x-2 bg-[#0d0d18] px-3 py-1 rounded border border-purple-900/30 text-[10px] text-gray-400">
          <Zap className="w-3 h-3 text-purple-400 fill-purple-400/20" />
          <span className="font-semibold text-white">LeadPluz Sync ● Tempo Real</span>
        </div>
        <span className="text-[9px] text-purple-400 font-mono font-bold bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/30">
          Sem Digitação Manual
        </span>
      </div>

      {/* Grid: 2 Columns (Left: Chat simulation, Right: Live Timeline CRM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-purple-950/30 min-h-[340px]">
        
        {/* Left Column: WhatsApp Real Conversation */}
        <div className="p-4 bg-[#0a0a14] flex flex-col justify-between space-y-3">
          
          {/* Chat Contact Header */}
          <div className="flex items-center space-x-3 pb-3 border-b border-purple-950/30">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-700 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                JC
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a14]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Juliana Costa</h4>
              <p className="text-[9px] text-gray-400 flex items-center space-x-1">
                <span>WhatsApp Clínica</span>
                <span className="text-purple-400 font-semibold">• Atendimento Ativo</span>
              </p>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="space-y-3 flex-1 flex flex-col justify-end text-[11px] leading-relaxed">
            
            {/* Lead Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121222] border border-purple-900/25 rounded-2xl rounded-tl-none p-3 text-gray-200 shadow-sm max-w-[90%]"
            >
              <p className="text-white font-medium">
                Olá! Gostaria de agendar uma consulta de avaliação estética para esta semana.
              </p>
              <span className="text-[8px] text-gray-500 block text-right mt-1 font-mono">14:32</span>
            </motion.div>

            {/* Clinic / Human-like IA Response */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-950/40 border border-purple-700/40 rounded-2xl rounded-tr-none p-3 text-purple-100 shadow-sm self-end max-w-[92%]"
            >
              <div className="flex items-center space-x-1 text-[8px] text-purple-300 font-semibold mb-1 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                <span>Resposta Natural da Clínica</span>
              </div>
              <p>
                Com certeza, Juliana! Temos disponibilidade para Quinta-feira às 15:00. Posso reservar esse horário para você?
              </p>
              <span className="text-[8px] text-purple-300/60 block text-right mt-1 font-mono">14:32 ✓✓</span>
            </motion.div>

            {/* Lead Confirmation */}
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#121222] border border-purple-900/25 rounded-2xl rounded-tl-none p-3 text-gray-200 shadow-sm max-w-[90%]"
              >
                <p className="text-white font-medium">Perfeito! Pode confirmar na quinta às 15h, por favor.</p>
                <span className="text-[8px] text-gray-500 block text-right mt-1 font-mono">14:33</span>
              </motion.div>
            )}

          </div>

          <div className="pt-2 text-[9px] text-gray-500 border-t border-purple-950/20 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3 text-purple-400" />
              <span>WhatsApp Web Integrado</span>
            </span>
            <span className="text-emerald-400 font-semibold">● Online</span>
          </div>

        </div>

        {/* Right Column: Live Lead Timeline Update */}
        <div className="p-4 bg-[#080810] flex flex-col justify-between space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-purple-950/30">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Timeline Estruturada</span>
            </span>
            <span className="text-[8px] font-bold text-green-400 bg-green-950/40 border border-green-800/40 px-2 py-0.5 rounded-full animate-pulse">
              Atualizando ao vivo
            </span>
          </div>

          {/* Timeline Feed Cards */}
          <div className="space-y-2.5 flex-1">
            
            {/* Card 1: Lead Identified */}
            <div className="bg-[#0f0f1c] border border-purple-900/20 p-2.5 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-400 font-bold uppercase flex items-center space-x-1">
                  <UserCheck className="w-3 h-3 text-purple-400" />
                  <span>Interesse Identificado</span>
                </span>
                <span className="text-purple-400 font-bold">Score 94/100</span>
              </div>
              <p className="text-xs font-bold text-white">Avaliação Estética Facial</p>
            </div>

            {/* Card 2: Appointment Scheduled */}
            <div className="bg-[#0f0f1c] border border-purple-900/20 p-2.5 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-400 font-bold uppercase flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>Agendamento Criado</span>
                </span>
                <span className="text-blue-400 font-mono text-[9px]">Automatizado</span>
              </div>
              <p className="text-xs font-bold text-white">Quinta-feira · 15:00h</p>
            </div>

            {/* Card 3: Signal Payment Status (Adjusted: Sinal AINDA NÃO PAGO) */}
            <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-amber-400 font-bold uppercase flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Status do Sinal</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 font-bold text-[8px] px-1.5 py-0.5 rounded border border-amber-500/30">
                  PENDENTE
                </span>
              </div>
              <p className="text-xs font-bold text-amber-200">Sinal ainda não pago · Lembrete agendado</p>
            </div>

          </div>

          {/* Footer Indicator */}
          <div className="bg-purple-950/30 border border-purple-800/30 p-2 rounded-lg text-[9px] text-gray-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
            <span>IA estrutura dados, cadastra agendamento e agenda follow-up <strong>sem digitação manual</strong>.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
