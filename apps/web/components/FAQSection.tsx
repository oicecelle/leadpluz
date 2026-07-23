"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import FAQItem from "./FAQItem";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "O que é a LeadPluz e como ela funciona?",
      answer: "A LeadPluz é uma plataforma CRM 100% autônoma integrada ao WhatsApp para clínicas de saúde e estética. Ela captura, atende, agenda e gerencia o funil de leads sem que sua equipe precise digitar dados manualmente no sistema."
    },
    {
      question: "Preciso cadastrar meu cartão para testar por 7 dias?",
      answer: "Não! Você pode criar sua conta e usar a plataforma por 7 dias totalmente grátis, sem necessidade de informar cartão de crédito ou dados bancários."
    },
    {
      question: "O que é a LIA e como minha equipe a utiliza?",
      answer: "A LIA é a assistente de IA interna da sua equipe. Ela funciona diretamente dentro de uma conversa no WhatsApp da clínica e aceita comandos de voz ou texto para criar agendamentos, tarefas, buscar histórico de pacientes e enviar relatórios."
    },
    {
      question: "Como funciona a gestão de agenda da clínica?",
      answer: "A IA cria e gerencia a agenda de forma totalmente autônoma. Se um cliente solicitar reagendamento ou troca de horário no WhatsApp, a própria IA reajusta a vaga e notifica sua equipe."
    },
    {
      question: "Meus dados e os dados dos pacientes ficam seguros?",
      answer: "Sim. Adotamos o padrão Enterprise de isolamento de dados por conta (Row Level Security — RLS). Cada clínica tem acesso exclusivo às suas informações com criptografia de ponta a ponta."
    },
    {
      question: "Como funciona o envio de contratos e documentos?",
      answer: "A LeadPluz permite enviar termos e contratos diretamente no chat do WhatsApp para assinatura digital com validade jurídica, sem precisar que o paciente instale nada."
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 md:px-12 bg-[#050508] border-t border-purple-950/20 overflow-hidden select-none">
      <div className="max-w-4xl mx-auto w-full space-y-12 text-left">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <SectionBadge text="Dúvidas Frequentes" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Perguntas <GradientText>Frequentes</GradientText>
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Tudo o que você precisa saber sobre a LeadPluz antes de começar.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 pt-4">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
