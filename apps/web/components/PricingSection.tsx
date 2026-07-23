"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import { Check, Sparkles, Zap, Bot, ArrowRight } from "lucide-react";

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const commonFeatures = [
    "CRM 100% Autônomo Kanban + Atendimento no WhatsApp",
    "Agenda Inteligente Autônoma (marcações e lembretes)",
    "LIA — Assistente de IA interna direto no WhatsApp da equipe",
    "Assinatura digital de contratos e termos no WhatsApp",
    "Gestão Financeira Completa (receita prevista, sinais, comissões)",
    "Disparos automáticos com gatilhos (Follow-up, Resgate, Aniversário)",
    "Buscas Ilimitadas de Leads (Google Maps & Web)",
    "Isolamento Enterprise de Dados por Conta (RLS)"
  ];

  return (
    <section id="planos" className="relative py-24 px-6 md:px-12 bg-[#050508]/90 border-t border-purple-950/20 overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial-gradient from-purple-950/15 to-transparent filter blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <SectionBadge text="Planos e Assinatura" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Escolha o plano ideal para a <GradientText>sua clínica</GradientText>
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
            Sem pegadinhas ou recursos bloqueados. Todos os planos contam com acesso ilimitado a todas as ferramentas.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex justify-center pt-2">
            <div className="bg-[#0e0e1a] p-1.5 rounded-full border border-purple-800/30 flex items-center space-x-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  billingPeriod === "monthly"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Faturamento Mensal
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
                  billingPeriod === "yearly"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>Faturamento Anual</span>
                <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                  2 MESES GRÁTIS
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
          
          {/* Card Mensal (Tag: Completo) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-[#0e0e1c] border border-purple-800/30 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-8 shadow-xl text-left"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-950/60 border border-purple-700/40 text-purple-300 px-3 py-1 rounded-full">
                  ✦ Completo
                </span>
                <span className="text-xs text-gray-400 font-semibold">Sem fidelidade</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Plano Mensal Completo</h3>
                <p className="text-xs text-gray-400">Todos os módulos inclusos sem restrições</p>
              </div>

              <div className="flex items-baseline space-x-2 border-b border-purple-900/30 pb-6">
                <span className="text-4xl md:text-5xl font-black text-white font-mono">
                  {billingPeriod === "monthly" ? "R$ 197" : "R$ 164"}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/mês</span>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  Recursos Inclusos:
                </span>
                <ul className="space-y-2.5 text-xs text-gray-300">
                  {commonFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href="https://app.leadpluz.com/signup"
              className="btn-gradient w-full py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white text-center block shadow-lg hover:scale-[1.02] transition-all"
            >
              Começar Teste Grátis de 7 Dias 🚀
            </a>
          </motion.div>

          {/* Card Anual (Destaque + Bullet da IA ajustado) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#180933] to-[#0a0518] border-2 border-purple-500/60 shadow-[0_0_50px_rgba(139,69,212,0.3)] flex flex-col justify-between space-y-8 relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md">
              ✦ Melhor Custo-Benefício
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 border border-purple-400/40 text-purple-200 px-3 py-1 rounded-full">
                  ✦ Anual Econômico
                </span>
                <span className="text-xs text-emerald-400 font-bold">Economize 20%</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Plano Anual Pro</h3>
                <p className="text-xs text-gray-300">Para clínicas que buscam aceleração máxima</p>
              </div>

              <div className="flex items-baseline space-x-2 border-b border-purple-900/30 pb-6">
                <span className="text-4xl md:text-5xl font-black text-white font-mono">
                  {billingPeriod === "monthly" ? "R$ 147" : "R$ 127"}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/mês em 12x</span>
              </div>

              {/* Bullet Features (Item 3.12: Substituted item with IA que cria documentos...) */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">
                  Tudo do plano Mensal e mais:
                </span>
                <ul className="space-y-2.5 text-xs text-gray-200">
                  <li className="flex items-start space-x-2.5 font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>IA que cria documentos, sugere disparos e estratégias comerciais</span>
                  </li>
                  {commonFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href="https://app.leadpluz.com/signup"
              className="w-full py-4 bg-white text-[#050508] hover:bg-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-center block shadow-xl transition-all hover:scale-[1.02]"
            >
              Assinar Plano Anual ⚡
            </a>
          </motion.div>

        </div>

        {/* Garantias */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-purple-400">🔒</span>
            <span>Pagamento Criptografado</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-400">✓</span>
            <span>7 dias de teste grátis sem cartão</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-400">⚡</span>
            <span>Liberação Imediata</span>
          </div>
        </div>

      </div>
    </section>
  );
}
