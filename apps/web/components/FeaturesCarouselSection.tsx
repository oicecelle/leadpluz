"use client";

import { motion } from "framer-motion";
import { DollarSign, FileSignature, LayoutDashboard, Calendar, Zap, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useRef } from "react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function FeaturesCarouselSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const carouselCards = [
    {
      icon: DollarSign,
      title: "Financeiro Completo",
      badge: "Gestão Financeira",
      desc: "Controle de receita prevista, histórico de sinais pagos, cálculo automático de comissões de profissionais e visão clara de fluxo de caixa em tempo real.",
      bullets: [
        "Receita prevista vs. realizada",
        "Controle automático de sinal",
        "Comissões de especialistas"
      ]
    },
    {
      icon: FileSignature,
      title: "Assinatura Digital no WhatsApp",
      badge: "Documentos e Contratos",
      desc: "Envio e assinatura de contratos, termos de consentimento e documentos direto na conversa do WhatsApp, sem precisar de apps externos.",
      bullets: [
        "Validade jurídica completa",
        "Assinatura em 1 clique pelo celular",
        "Armazenamento automático no CRM"
      ]
    },
    {
      icon: LayoutDashboard,
      title: "Feed Inteligente & Dashboard",
      badge: "Métricas em Tempo Real",
      desc: "Acompanhe os principais indicadores da clínica ao vivo: taxa de conversão de procedimentos, volume de leads, reuniões e receita acumulada.",
      bullets: [
        "Painel visual intuitivo",
        "Comparativo diário e mensal",
        "Exportação de relatórios"
      ]
    },
    {
      icon: Calendar,
      title: "Agenda Autônoma no WhatsApp",
      badge: "Marcações Inteligentes",
      desc: "Agendamento, remarcação e lembretes de consultas processados direto pelo assistente no WhatsApp da clínica.",
      bullets: [
        "Reagendamento automático",
        "Confirmação por mensagem",
        "Leads organizados no Kanban"
      ]
    },
    {
      icon: Zap,
      title: "CRM Autônomo Kanban",
      badge: "Pipeline de Vendas",
      desc: "Linha do tempo atualizada ao vivo. A cada interação do cliente, a IA move o lead de estágio e atribui tarefas para a equipe.",
      bullets: [
        "Zero digitação de dados",
        "Histórico completo da conversa",
        "Alertas de follow-up"
      ]
    }
  ];

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-[#080812] border-t border-purple-950/20 overflow-hidden relative select-none">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 text-left max-w-xl">
            <SectionBadge text="Recursos da Plataforma" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Tudo o que sua clínica precisa, <GradientText>em um único sistema</GradientText>
            </h2>
            <p className="text-xs md:text-sm text-gray-400">
              Arraste para os lados para explorar as funcionalidades autônomas da LeadPluz.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => handleScroll("left")}
              className="w-10 h-10 rounded-full bg-purple-950/40 border border-purple-800/35 flex items-center justify-center text-purple-300 hover:bg-purple-900/40 hover:border-purple-600/50 transition-all cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-10 h-10 rounded-full bg-purple-950/40 border border-purple-800/35 flex items-center justify-center text-purple-300 hover:bg-purple-900/40 hover:border-purple-600/50 transition-all cursor-pointer"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scrollbar-none pb-6 pt-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {carouselCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                className="w-[320px] md:w-[360px] shrink-0 bg-[#0e0e1c] border border-purple-900/30 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl snap-start transition-all duration-300 group"
              >
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 bg-purple-950/50 border border-purple-800/30 px-2.5 py-1 rounded-full">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {card.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="border-t border-purple-950/40 pt-4 space-y-2 text-left">
                  {card.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center space-x-2 text-[11px] text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
