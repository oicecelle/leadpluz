"use client";

import { motion } from "framer-motion";
import { Search, Send, BarChart3, Kanban, Calendar, Layers, ShieldCheck } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  const features = [
    {
      title: "Busca Inteligente",
      description: "Varredura por palavra-chave e localização com cache de 7 dias. Múltiplas palavras-chave e cidades em uma única busca.",
      icon: Search
    },
    {
      title: "Disparos WhatsApp",
      description: "API não oficial (Uazapi) ou API Oficial Meta. Fluxos com gatilhos, respostas automáticas e status por etapa.",
      icon: Send
    },
    {
      title: "CRM Completo",
      description: "Métricas em tempo real: leads totais, contatados, proposta enviada, convertidos e sem interesse. Tudo em um dashboard.",
      icon: BarChart3
    },
    {
      title: "Kanban Visual",
      description: "Pipeline de vendas arrastável. Crie colunas personalizadas, mova leads entre fases e adicione observações em cada card.",
      icon: Kanban
    },
    {
      title: "Agendamento de Calls",
      description: "Gerencie todas as reuniões com leads. Google Meet, Zoom, Teams — tudo centralizado com histórico.",
      icon: Calendar
    },
    {
      title: "Integração Chatwoot",
      description: "Crie sua conta Chatwoot diretamente na plataforma. Centralize conversas da API Oficial com automação completa.",
      icon: Layers
    }
  ];

  return (
    <section id="funcionalidades" className="py-24 px-6 md:px-12 bg-[#050508]/80 border-t border-purple-950/20 grid-pattern">
      <div className="max-w-6xl mx-auto w-full space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <SectionBadge text="Funcionalidades" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Tudo que sua prospecção precisa, <GradientText>em uma plataforma</GradientText>
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Elimine planilhas bagunçadas e múltiplos sistemas. Centralize sua operação comercial do início ao fim.
          </p>
        </div>

        {/* Features Stagger Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f, idx) => (
            <FeatureCard
              key={idx}
              title={f.title}
              description={f.description}
              icon={f.icon}
            />
          ))}
        </motion.div>

        {/* Highlight security card (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-purple-950/20 via-[#0f0f1a] to-purple-950/20 border border-purple-800/20 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-left shadow-lg overflow-hidden select-none"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-500/40 flex items-center justify-center flex-shrink-0 text-purple-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-3 flex-1">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Segurança de Dados e Isolamento Completo</span>
              <span className="text-[9px] bg-purple-900/50 border border-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded-full">Padrão Enterprise</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Sua base de clientes é o seu maior ativo. No LEADPLUZ, cada conta possui isolamento de banco de dados por Row Level Security (RLS) no Supabase. Seus leads, históricos de chat e dados de disparo são armazenados de forma isolada e acessíveis exclusivamente pela sua equipe. Proteção total contra vazamentos ou invasões.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
