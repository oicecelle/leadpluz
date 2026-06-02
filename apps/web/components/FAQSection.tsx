"use client";

import { useState } from "react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import FAQItem from "./FAQItem";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "O que é LEADPLUZ?",
      a: "LEADPLUZ é uma plataforma SaaS brasileira de prospecção B2B completa. Ela permite buscar contatos locais qualificados, fazer disparos de mensagens automatizados pelo WhatsApp e gerenciar todo o seu funil de vendas em um CRM Kanban simples e intuitivo."
    },
    {
      q: "Como funciona a busca de leads?",
      a: "Você digita uma palavra-chave (ex: 'clínica odontológica') e uma cidade. O sistema consulta nossa base e o Google Maps, filtrando e retornando dados de contato válidos para a sua equipe comercial — contando com cache inteligente de resultados de 7 dias."
    },
    {
      q: "Posso usar meu próprio número de WhatsApp?",
      a: "Sim. Você conecta seu número diretamente na plataforma via QR code de forma rápida e simples."
    },
    {
      q: "Qual a diferença entre API não oficial e API Oficial?",
      a: "A API não oficial usa seu número pessoal do WhatsApp — mais simples, porém com risco de banimento se usado em excesso (recomendamos no máximo 50 disparos por dia). A API Oficial é homologada pela Meta, livre de riscos de banimento, disponível no plano Ultra."
    },
    {
      q: "Os leads se renovam todo mês?",
      a: "Sim. Seu limite de leads reseta automaticamente todo mês na data de aniversário da sua assinatura."
    },
    {
      q: "Se eu deletar leads, o saldo volta?",
      a: "Não. O saldo de cota mensal é consumido no momento da busca, independente do que você fizer com os leads depois."
    },
    {
      q: "Meus dados ficam seguros?",
      a: "Sim. Cada usuário tem seus dados completamente isolados e protegidos via Row Level Security (RLS) no Supabase. Os leads capturados e o histórico de disparos são exclusivos da sua conta."
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim, sem multa e sem fidelidade. O cancelamento pode ser feito de forma imediata na plataforma e seu acesso continua ativo até o fim do período já pago."
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-6 md:px-12 bg-[#050508] border-t border-purple-950/20 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <SectionBadge text="FAQ" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Perguntas <GradientText>frequentes</GradientText>
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Esclareça suas dúvidas rápidas sobre a plataforma e comece a prospectar hoje mesmo.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-2 border-t border-purple-950/20">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.q}
              answer={faq.a}
              isOpen={openIdx === idx}
              onToggle={() => handleToggle(idx)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
