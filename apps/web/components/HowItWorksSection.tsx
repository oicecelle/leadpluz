"use client";

import { motion } from "framer-motion";
import { Search, Send, Trophy, Check } from "lucide-react";
import SectionBadge from "./SectionBadge";
import GradientText from "./GradientText";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Busque",
      desc: "Digite qualquer palavra-chave e cidade. Acesse uma base de leads qualificados já no primeiro segundo — com cache inteligente de resultados.",
      icon: Search,
      preview: (
        <div className="bg-[#0f0f1a] border border-purple-800/20 rounded-xl p-4 space-y-3 shadow-lg max-w-sm w-full font-sans text-left">
          <div className="flex items-center space-x-2 border-b border-purple-950/20 pb-2">
            <Search className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Busca de Contatos</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex flex-col space-y-1">
              <span className="text-gray-500 font-semibold uppercase text-[8px]">Palavra-Chave</span>
              <span className="bg-[#050508] border border-purple-950/25 px-2 py-1 rounded text-white truncate">Clínica Estética</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-500 font-semibold uppercase text-[8px]">Cidade</span>
              <span className="bg-[#050508] border border-purple-950/25 px-2 py-1 rounded text-white truncate">Rio de Janeiro</span>
            </div>
          </div>
          <div className="h-2 w-full bg-purple-950/20 rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "80%" }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              className="h-full bg-purple-500"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1">
            <span>Buscando leads...</span>
            <span className="text-green-400 font-bold">80%</span>
          </div>
        </div>
      )
    },
    {
      number: "02",
      title: "Conecte",
      desc: "Configure fluxos de disparo automatizados. Defina gatilhos, respostas automáticas e atribua status a cada etapa da conversa.",
      icon: Send,
      preview: (
        <div className="bg-[#0f0f1a] border border-purple-800/20 rounded-xl p-4 space-y-3 shadow-lg max-w-sm w-full font-sans text-left">
          <div className="flex items-center justify-between border-b border-purple-950/20 pb-2">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Sequência de Disparo</span>
            <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 text-[8px] font-bold border border-purple-900/30">ATIVO</span>
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex items-start space-x-2 bg-[#050508] p-2 rounded border border-purple-950/30">
              <span className="px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-bold">1</span>
              <div className="flex-1 space-y-1">
                <span className="text-[8px] text-gray-500 font-semibold uppercase">Mensagem Inicial</span>
                <p className="text-white text-[9px] leading-tight">{"Olá {{nome}}, vimos seu perfil em..."}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 bg-[#050508] p-2 rounded border border-purple-950/30">
              <span className="px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-bold">2</span>
              <div className="flex-1 space-y-1">
                <span className="text-[8px] text-gray-500 font-semibold uppercase">Gatilho / Resposta</span>
                <p className="text-purple-300 text-[9px] leading-tight flex items-center space-x-1">
                  <span>Palavra Exata:</span>
                  <span className="text-white font-mono bg-purple-950 px-1 rounded">"quero saber mais"</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "03",
      title: "Converta",
      desc: "Acompanhe cada lead no CRM visual. Mova pelo Kanban, agende calls e feche negócios com total rastreabilidade.",
      icon: Trophy,
      preview: (
        <div className="bg-[#0f0f1a] border border-purple-800/20 rounded-xl p-4 space-y-3 shadow-lg max-w-sm w-full font-sans text-left">
          <div className="flex items-center space-x-2 border-b border-purple-950/20 pb-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">CRM Funil Kanban</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#050508] p-2 rounded border border-purple-950/25 space-y-1.5">
              <span className="text-[8px] text-blue-400 font-bold uppercase tracking-wider">Contatado</span>
              <div className="bg-[#0f0f1a] border border-purple-950/40 p-1.5 rounded text-[8px] space-y-1 shadow">
                <span className="font-semibold text-white block">Bella Estética</span>
                <span className="text-gray-500">Aguardando call</span>
              </div>
            </div>
            <div className="bg-[#050508] p-2 rounded border border-purple-950/25 space-y-1.5">
              <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider">Convertido</span>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="bg-[#0f0f1a] border border-purple-950/40 p-1.5 rounded text-[8px] space-y-1 shadow border-l-2 border-l-green-500"
              >
                <span className="font-semibold text-white block">Sorriso Ideal</span>
                <span className="text-green-400 font-bold flex items-center space-x-0.5">
                  <Check className="w-2.5 h-2.5" />
                  <span>Plano Pro Fechado</span>
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="como-funciona" className="relative py-24 px-6 md:px-12 bg-[#050508] border-t border-purple-950/20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-gradient from-purple-950/10 to-transparent filter blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-3">
          <SectionBadge text="Processo" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Da busca ao fechamento, <GradientText>em minutos</GradientText>
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Uma esteira de vendas automatizada que faz o trabalho pesado para a sua equipe comercial.
          </p>
        </div>

        {/* Steps Timeline Grid */}
        <div className="relative space-y-16 lg:space-y-24">
          
          {/* Vertical connector line */}
          <div className="absolute top-8 left-6 lg:left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%-80px)] bg-purple-950/40 -z-10">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="w-full bg-gradient-to-b from-purple-500 to-purple-800"
            />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={step.number}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                {/* Step Info */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -35 : 35 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex items-start space-x-4 lg:space-x-8 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 border border-purple-500/30 flex items-center justify-center text-white text-base font-extrabold tracking-wider shadow-lg shadow-purple-950/50">
                    {step.number}
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-bold text-white tracking-wide uppercase">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>

                {/* Step Preview Mockup */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex justify-center ${
                    isEven ? "lg:order-2 lg:justify-end" : "lg:order-1 lg:justify-start"
                  }`}
                >
                  <div className="hover:scale-105 transition-transform duration-300 w-full flex justify-center lg:justify-end">
                    {step.preview}
                  </div>
                </motion.div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
