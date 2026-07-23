"use client";

import { motion } from "framer-motion";
import { Search, Send, Trophy, Check, Clock, AlertTriangle, MessageSquare, Bot, Calendar, Sparkles, RefreshCw } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function HowItWorksSection() {
  const triggerTags = [
    { label: "Follow-up", color: "bg-purple-950/50 border-purple-700/40 text-purple-300" },
    { label: "Resgate", color: "bg-red-950/40 border-red-800/40 text-red-300" },
    { label: "Aniversário", color: "bg-pink-950/40 border-pink-800/40 text-pink-300" },
    { label: "Manutenção", color: "bg-amber-950/40 border-amber-800/40 text-amber-300" },
    { label: "Pós-procedimento", color: "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" },
    { label: "Lembrete", color: "bg-blue-950/40 border-blue-800/40 text-blue-300" },
  ];

  return (
    <section id="recursos" className="relative py-24 px-6 md:px-12 bg-[#050508] border-t border-purple-950/20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-gradient from-purple-950/10 to-transparent filter blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full space-y-24">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <SectionBadge text="CRM & Automação de Atendimento" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Follow-up Autônomo & <GradientText>Zero Leads Perdidos</GradientText>
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            A IA da LeadPluz identifica o momento exato de interagir com o cliente, envia disparos personalizados e gerencia a agenda da sua clínica de forma autônoma.
          </p>
        </div>

        {/* --- SEÇÃO 2: CRM Inteligente & Follow-up com Card de Exemplo + Tags (Item 3.8) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado Esquerdo: Textos + Linha de Tags de Disparo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-950/40 border border-purple-800/30 px-3 py-1 rounded-full">
                Gatilhos Inteligentes 24/7
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-snug">
                Nenhum lead fica sem resposta ou é esquecido no WhatsApp
              </h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              O sistema detecta automaticamente quando o lead para de responder e agenda um disparo de acompanhamento totalmente humanizado. Você escolhe quais gatilhos ativar e a IA cuida de toda a esteira de vendas.
            </p>

            {/* Linha de Tags/Pills Coloridas (Item 3.8) */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">
                Tipos de Disparos Automáticos Configuráveis:
              </span>
              <div className="flex flex-wrap gap-2">
                {triggerTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${tag.color}`}
                  >
                    • {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lado Direito: Card de Exemplo de Follow-up Programado (Item 3.8) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md bg-[#0f0f1a] border border-purple-800/30 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
              
              {/* Header do Card com Status de Alerta */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-950/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow">
                    MS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dr. Marcelo Silva</h4>
                    <span className="text-[10px] text-purple-300 font-medium">Interesse: Tratamento Ortodôntico</span>
                  </div>
                </div>
                
                {/* Tag de 24h sem resposta */}
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>24h sem resposta</span>
                </div>
              </div>

              {/* Box da Mensagem Programada */}
              <div className="bg-[#080810] border border-purple-900/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-purple-400 flex items-center space-x-1">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span>Follow-up Automático Programado</span>
                  </span>
                  <span className="text-[9px] text-green-400 font-mono font-bold">Pronto para Envio</span>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed font-sans bg-purple-950/25 p-3 rounded-lg border border-purple-900/20">
                  "Olá Dr. Marcelo! Vi que você ficou de confirmar o horário de avaliação da clínica. Conseguimos reservar uma vaga especial para amanhã às 16h. Vamos confirmar?"
                </p>

                <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1">
                  <span>Disparo via WhatsApp da Clínica</span>
                  <span className="text-purple-300 font-semibold">Agendado para 10:00h</span>
                </div>
              </div>

              {/* Status do Kanban */}
              <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span>Estágio: Follow-up 1</span>
                </span>
                <span className="text-purple-400 font-bold">Ação Sem Interferência Manual</span>
              </div>

            </div>
          </motion.div>

        </div>


        {/* --- SEÇÃO 4: Agenda Inteligente Autônoma sem menção ao Google Calendar (Item 3.9) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 border-t border-purple-950/20">
          
          {/* Mockup da Agenda Autônoma */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center order-2 lg:order-1"
          >
            <div className="w-full max-w-md bg-[#0f0f1a] border border-purple-800/30 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
              
              <div className="flex items-center justify-between pb-3 border-b border-purple-950/30">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Agenda Inteligente Autônoma
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px] font-bold">
                  Automação WhatsApp
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Event 1 */}
                <div className="p-3 bg-[#080810] border border-purple-900/25 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 block">14:00h · Confirmado</span>
                    <span className="text-white font-bold text-xs">Juliana Costa — Estética Facial</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-950/50 text-green-400 border border-green-800/40 text-[9px] font-bold">
                    Lembrete Enviado
                  </span>
                </div>

                {/* Event 2 (Remarcardo no WhatsApp) */}
                <div className="p-3 bg-[#080810] border border-purple-900/25 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 block flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      <span>16:30h · Remarcado pelo WhatsApp</span>
                    </span>
                    <span className="text-white font-bold text-xs">Camila Rocha — Limpeza de Pele</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40 text-[9px] font-bold">
                    Reajustado pela IA
                  </span>
                </div>
              </div>

              <div className="p-3 bg-purple-950/30 border border-purple-800/30 rounded-xl text-[10px] text-purple-200 leading-relaxed">
                ⚡ <strong>A IA ajusta a agenda de forma 100% autônoma:</strong> Se o cliente solicitar troca de horário ou desmarcar via WhatsApp, a agenda é reajustada instantaneamente.
              </div>

            </div>
          </motion.div>

          {/* Copy da Agenda Inteligente Autônoma */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left order-1 lg:order-2"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-950/40 border border-purple-800/30 px-3 py-1 rounded-full">
                Gestão de Agenda Autônoma
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-snug">
                A IA cria e gerencia a agenda da sua clínica de forma 100% autônoma
              </h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Esqueça recepção sobrecarregada ou planilhas desatualizadas. Se o cliente desmarcar ou pedir para mudar a data diretamente no conversa do WhatsApp, a própria IA encontra o próximo horário livre e atualiza os agendamentos.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Confirmação de presenças automatizada 24h antes da consulta",
                "Reagendamento automático direto pelo WhatsApp",
                "Histórico completo de atendimentos e procedimentos registrados"
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2.5 text-xs text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-purple-900/50 border border-purple-700/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                    ✓
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
