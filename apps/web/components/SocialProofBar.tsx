"use client";

import { CheckCircle2, Sparkles, Clock, Zap, Shield, FileCheck, CalendarCheck, MessageSquare, Bot } from "lucide-react";

export default function SocialProofBar() {
  const tips = [
    { text: "+4h poupadas de trabalho por semana", icon: Clock },
    { text: "100% das conversas viram dado estruturado", icon: Sparkles },
    { text: "Zero digitação manual no CRM", icon: Zap },
    { text: "Follow-up automático 24/7", icon: Bot },
    { text: "Agenda inteligente sempre atualizada", icon: CalendarCheck },
    { text: "Assinatura digital direto no WhatsApp", icon: FileCheck },
    { text: "Prontuário e evolução do paciente no chat", icon: MessageSquare },
    { text: "Isolamento total de dados por clínica (RLS)", icon: Shield },
  ];

  const marqueeList = [...tips, ...tips, ...tips, ...tips];

  return (
    <section className="bg-[#080812] border-y border-purple-950/30 py-6 overflow-hidden w-full select-none relative">
      <div className="max-w-7xl mx-auto px-6 mb-3 text-center">
        <span className="text-[10px] font-extrabold text-purple-400/90 uppercase tracking-widest flex items-center justify-center space-x-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Vantagens Exclusivas da Plataforma LeadPluz</span>
        </span>
      </div>

      {/* Infinite marquee continuous loop */}
      <div className="relative w-full flex items-center overflow-x-hidden py-2">
        <div className="flex space-x-6 animate-marquee whitespace-nowrap">
          {marqueeList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-purple-950/40 border border-purple-800/35 text-xs font-semibold text-purple-200 shadow-sm backdrop-blur-sm shrink-0"
              >
                <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
