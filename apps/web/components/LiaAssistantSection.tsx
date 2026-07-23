"use client";

import { motion } from "framer-motion";
import { Bot, Mic, Sparkles, Calendar, CheckSquare, Search, BarChart2, MessageSquare } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function LiaAssistantSection() {
  const commands = [
    {
      icon: Calendar,
      cmd: '"LIA, agende avaliação para Juliana quinta às 15h"',
      action: "Cria agendamento e notifica o profissional responsável"
    },
    {
      icon: CheckSquare,
      cmd: '"LIA, crie tarefa para enviar orçamento do Dr. Marcelo"',
      action: "Cria tarefa com prazo e lembrete automático"
    },
    {
      icon: Search,
      cmd: '"LIA, busca o histórico e telefone da paciente Camila"',
      action: "Retorna instantaneamente os dados do lead cadastrado"
    },
    {
      icon: BarChart2,
      cmd: '"LIA, me envie o relatório de faturamento deste mês"',
      action: "Gera e envia resumo completo com métricas e conversões"
    }
  ];

  return (
    <section className="relative py-24 px-6 md:px-12 bg-gradient-to-br from-[#1b0838] via-[#0d061c] to-[#050508] border-t border-b border-purple-500/30 overflow-hidden text-left select-none">
      
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-purple-600/15 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Lado Esquerdo: Apresentação da LIA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Assistente Interna da Equipe</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Conheça a <GradientText>LIA</GradientText>: Sua Assistente de IA dentro do WhatsApp
          </h2>

          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            A LIA não fala com o seu cliente — <strong>ela é o copiloto da sua equipe</strong>. Dentro do WhatsApp da própria clínica, você ou seus atendentes comandam o CRM usando <strong>mensagens de texto ou áudio</strong>.
          </p>

          {/* Relatórios Periódicos Highlight */}
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <span>Relatórios Automáticos no seu WhatsApp</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Receba os relatórios dos principais indicadores da clínica de forma 100% automática: <strong>diariamente, quinzenalmente e mensalmente</strong>, direto no grupo da sua equipe.
            </p>
          </div>
        </motion.div>

        {/* Lado Direito: Interface do WhatsApp da Equipe com a LIA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md bg-[#0a0a14] border-2 border-purple-500/40 rounded-3xl p-5 shadow-[0_0_60px_rgba(168,85,247,0.25)] space-y-4">
            
            {/* LIA Chat Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-purple-900/30">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white shadow-lg shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                  <span>LIA — Copiloto LeadPluz</span>
                  <span className="bg-purple-500/30 border border-purple-400/40 text-purple-300 text-[8px] font-bold px-1.5 py-0.5 rounded">IA Ativa</span>
                </h4>
                <p className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <Mic className="w-3 h-3 text-purple-400" />
                  <span>Aceita comandos de texto e áudio</span>
                </p>
              </div>
            </div>

            {/* Simulated Commands */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                Exemplos de comandos executados no chat:
              </span>

              {commands.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="p-3 rounded-xl bg-[#120b24] border border-purple-800/30 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-purple-200">
                      <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{c.cmd}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5">
                      ↳ <strong>Ação executada:</strong> {c.action}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Badge */}
            <div className="text-[10px] text-purple-300 font-bold text-center pt-2 border-t border-purple-950/40">
              ⚡ Sem precisar abrir sistemas lentos — resolva tudo em segundos pelo celular.
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
