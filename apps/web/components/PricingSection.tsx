"use client";

import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  const starterFeatures = [
    "500 leads por mês",
    "Busca por palavra-chave e cidade",
    "Disparo WhatsApp (API não oficial)",
    "CRM + Kanban integrado",
    "Agendamento de calls",
    "Exportar/importar planilhas Excel"
  ];

  const proFeatures = [
    "2.000 leads por mês",
    "Tudo do plano Starter",
    "Múltiplas palavras-chave simultâneas",
    "Fluxos de disparo avançados",
    "Suporte prioritário via WhatsApp"
  ];

  const ultraFeatures = [
    "10.000 leads por mês",
    "Tudo do plano Pro",
    "API Oficial WhatsApp (Meta)",
    "Conta Chatwoot inclusa",
    "Fluxos de disparo ilimitados",
    "Suporte VIP dedicado"
  ];

  return (
    <section id="planos" className="relative py-24 px-6 md:px-12 bg-[#050508]/90 border-t border-purple-950/20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial-gradient from-purple-950/15 to-transparent filter blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <SectionBadge text="Planos" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Simples, transparente, <GradientText>sem surpresas</GradientText>
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Escolha o plano ideal para a sua escala de vendas. Cancele quando quiser, sem multas.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-stretch pt-4"
        >
          {/* Card Starter */}
          <PricingCard
            name="Starter"
            price="197"
            badge="Para começar"
            features={starterFeatures}
            ctaText="Começar com Starter"
            ctaLink="https://go.leadpluz.com/cadastro?plano=starter"
            orderClass="order-2 lg:order-none"
          />

          {/* Card Pro (Popular highlight) */}
          <PricingCard
            name="Pro"
            price="247"
            subtitle="4x mais leads que o Starter"
            badge="✦ Mais Popular"
            features={proFeatures}
            ctaText="Começar com Pro"
            ctaLink="https://go.leadpluz.com/cadastro?plano=pro"
            popular={true}
            orderClass="order-1 lg:order-none"
          />

          {/* Card Ultra */}
          <PricingCard
            name="Ultra"
            price="397"
            badge="Para escalar"
            features={ultraFeatures}
            ctaText="Começar com Ultra"
            ctaLink="https://go.leadpluz.com/cadastro?plano=ultra"
            orderClass="order-3 lg:order-none"
          />
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
