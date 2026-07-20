"use client";

import { motion } from "framer-motion";
import { Key, ShieldCheck, Calculator, GraduationCap, ExternalLink, CheckCircle2 } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function GoogleApiFeatureSection() {
  const steps = [
    {
      icon: GraduationCap,
      title: "Passo a Passo Didático Incluso",
      description: "Dentro do painel, disponibilizamos um guia completo com tutoriais visuais e links diretos para você criar suas credenciais no Google Cloud em poucos minutos."
    },
    {
      icon: ShieldCheck,
      title: "Chaves Armazenadas com Criptografia",
      description: "Sua Google API Key e CX ID são criptografados com padrões AES-256 no banco de dados e mascarados na interface (exibindo apenas os 2 últimos dígitos)."
    },
    {
      icon: Calculator,
      title: "Estimativa Transparente de Custos",
      description: "Exibimos o custo projetado de cada pesquisa. Além disso, o Google Cloud concede US$ 200 de crédito gratuito mensal para cada conta, tornando a prospecção praticamente sem custos."
    }
  ];

  return (
    <section className="relative py-20 px-6 md:px-12 bg-[#080812] border-t border-b border-purple-950/30 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <SectionBadge text="Integração Direta Google Cloud" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Utilize sua própria <GradientText>API Key do Google</GradientText> com Total Segurança
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Busque leads direto da fonte oficial sem intermediários, sem bloqueios e aproveitando os <strong className="text-purple-300 font-bold">US$ 200 de crédito renovado todo mês pelo próprio Google Cloud</strong>.
          </p>
        </div>

        {/* 3 Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#0e0e1c]/80 border border-purple-900/30 hover:border-purple-500/40 transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Banner com atalhos e ressalva de cota */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#140b28] via-[#120824] to-[#0a0518] border border-purple-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-white flex items-center justify-center md:justify-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sem limites arbitrários no sistema: Buscas 100% ilimitadas!</span>
            </h4>
            <p className="text-xs text-gray-400">
              Aprenda a conectar em menos de 3 minutos no painel com nossos atalhos para o Google Console e Custom Search.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-[11px] font-bold text-purple-300 text-center shrink-0">
            🎁 Cota mensal gratuita do Google: US$ 200/mês
          </div>
        </div>

      </div>
    </section>
  );
}
