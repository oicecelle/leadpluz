"use client";

import { motion } from "framer-motion";
import { Bot, Calendar, DollarSign, FileSignature, Send, Layers, Stethoscope, Building2, BarChart2, ShieldCheck, UserCheck, Zap } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function AllFeaturesGridSection() {
  const allFeatures = [
    {
      icon: Zap,
      title: "CRM 100% Autônomo",
      desc: "Kanban visual com atualização automatizada em tempo real. A conversa acontece no WhatsApp e a IA organiza o funil."
    },
    {
      icon: Calendar,
      title: "Agenda Inteligente Autônoma",
      desc: "Agendamento, confirmações e reagendamentos efetuados automaticamente direto na conversa com o cliente."
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira Completa",
      desc: "Controle de receita prevista, sinais de consulta, fluxo de caixa e comissionamento de profissionais."
    },
    {
      icon: FileSignature,
      title: "Assinatura Digital no WhatsApp",
      desc: "Envio e assinatura jurídica de contratos e termos de consentimento diretamente no chat sem apps terceiros."
    },
    {
      icon: Send,
      title: "Disparos & Automações 24/7",
      desc: "Sequências com gatilhos de follow-up, resgate, aniversários, manutenção e lembretes de pós-procedimento."
    },
    {
      icon: Bot,
      title: "LIA — Assistente Interna",
      desc: "Comande a plataforma por mensagem de texto ou áudio no WhatsApp da própria equipe."
    },
    {
      icon: Stethoscope,
      title: "Prontuário & Evolução",
      desc: "Registro estruturado do histórico clínico do paciente, observações e arquivos anexados ao perfil."
    },
    {
      icon: Building2,
      title: "Suporte Multiclínica",
      desc: "Gerencie múltiplas unidades ou filiais dentro do mesmo painel administrativo centralizado."
    },
    {
      icon: BarChart2,
      title: "Relatórios Periódicos",
      desc: "Relatórios diários, quinzenais e mensais automáticos enviados direto no grupo do WhatsApp da equipe."
    },
    {
      icon: ShieldCheck,
      title: "Isolamento de Dados (RLS)",
      desc: "Padrão Enterprise com isolamento por conta, criptografia de credenciais e segurança de nível médico."
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-[#050508] border-t border-purple-950/20 grid-pattern select-none text-left">
      <div className="max-w-6xl mx-auto w-full space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <SectionBadge text="Todos os Recursos" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ecossistema completo para <GradientText>escalar sua clínica</GradientText>
          </h2>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            Desenvolvido especificamente para o mercado de saúde, beleza e estética. Tudo integrado em uma única solução.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
                className="p-6 rounded-2xl bg-[#0d0d1a] border border-purple-900/25 hover:border-purple-500/40 transition-all duration-300 space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
