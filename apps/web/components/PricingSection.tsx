"use client";

import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  const singlePlanFeatures = [
    "Buscas Ilimitadas de Leads (Google Maps & Web)",
    "Filtros por palavra-chave, cidade e segmento",
    "Uso da sua própria chave de API do Google (com $200 grátis/mês)",
    "Passo a passo didático de configuração e chaves mascaradas",
    "Disparos no WhatsApp via API Não Oficial (Uazapi)",
    "Disparos no WhatsApp via API Oficial (Meta)",
    "CRM Kanban completo + Agendamentos",
    "Exportação e Importação via Planilhas (CSV / Excel)",
    "Acesso Vitalício sem mensalidades recorrentes"
  ];

  return (
    <section id="planos" className="relative py-24 px-6 md:px-12 bg-[#050508]/90 border-t border-purple-950/20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial-gradient from-purple-950/15 to-transparent filter blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto w-full space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <SectionBadge text="Plano Único Vitalício" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Acesso Completo & <GradientText>Buscas Ilimitadas</GradientText>
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Pague uma única vez por R$ 97,00 e tenha acesso vitalício a toda a plataforma LeadPluz.
          </p>
        </div>

        {/* Single Featured Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#140b28] to-[#0a0518] border-2 border-purple-500/50 shadow-[0_0_50px_rgba(139,69,212,0.25)] space-y-8 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md">
              ✦ PLANO VITALÍCIO
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white tracking-wide">Plano LeadPluz Pro</h3>
              <p className="text-xs text-gray-400">Acesso ilimitado à busca de leads + CRM + Disparos</p>
            </div>

            <div className="flex items-baseline space-x-2 border-b border-purple-900/30 pb-6">
              <span className="text-4xl md:text-5xl font-black text-white font-mono">R$ 97</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                Pague 1x • Acesso Vitalício
              </span>
            </div>

            {/* List of features */}
            <div className="space-y-3.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Tudo o que está incluído:
              </span>
              <ul className="space-y-2.5 text-xs text-gray-300">
                {singlePlanFeatures.map((feat, i) => (
                  <li key={i} className="flex items-center space-x-2.5">
                    <span className="w-4 h-4 rounded-full bg-purple-900/60 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <a
              href="https://checkout.ticto.app/OB52C3D66"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm uppercase tracking-wider font-extrabold py-4 px-6 w-full rounded-xl text-center block shadow-glow-md hover:scale-[1.02] transition-all"
            >
              Garantir Acesso Vitalício por R$ 97 🚀
            </a>
          </div>
        </motion.div>

        {/* Reassurance text */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 pt-6">
          <div className="flex items-center space-x-2">
            <span className="text-purple-500">🔒</span>
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-500">✓</span>
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-500">⚡</span>
            <span>Ativação Imediata</span>
          </div>
        </div>

      </div>
    </section>
  );
}
