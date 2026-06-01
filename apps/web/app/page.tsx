"use client";

import { motion } from "framer-motion";
import { Search, Send, Database, Calendar, Layers, ShieldCheck, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const faqs = [
    {
      q: "O que é LEADPLUZ?",
      a: "LEADPLUZ é um SaaS B2B completo de prospecção ativa. Ele permite buscar contatos locais qualificados, fazer disparos de mensagens automatizados pelo WhatsApp e gerenciar todo o seu funil de vendas em um CRM Kanban simples e intuitivo."
    },
    {
      q: "Como funciona a busca de leads?",
      a: "Você informa as palavras-chave (ex: 'clínica odontológica') e os locais onde quer prospectar. O sistema consulta nossa base e o Google Maps, filtrando e retornando dados de contato válidos para a sua equipe comercial."
    },
    {
      q: "Posso usar meu próprio número de WhatsApp?",
      a: "Sim! Oferecemos conexão via API não oficial (Uazapi) onde você pode escanear o QR code diretamente no seu número de celular, ou utilizar nossa integração oficial no plano Ultra."
    },
    {
      q: "O que é a API Oficial do WhatsApp?",
      a: "É a Meta Cloud API oficial. Fornece maior estabilidade, velocidade e elimina o risco de banimentos. Está disponível no plano Ultra integrado ao Chatwoot."
    },
    {
      q: "Meus leads ficam seguros?",
      a: "Sim! Cada conta possui isolamento de banco de dados por Row Level Security (RLS) no Supabase. Os seus leads e históricos comerciais são de acesso exclusivo da sua conta."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 landing-grid relative">
      {/* Header */}
      <header className="h-[70px] border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 max-w-7xl mx-auto w-full">
        <span className="text-sm font-extrabold tracking-widest text-white">LEADPLUZ</span>
        
        <div className="flex items-center space-x-6">
          <Link href="https://go.leadpluz.com/login" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="https://go.leadpluz.com/login" className="cta-button py-2 px-5 text-xs">
            Começar agora
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto space-y-8 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold tracking-wider leading-tight text-white uppercase"
        >
          Encontre clientes.<br />Conecte. Converta.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed"
        >
          LEADPLUZ busca leads qualificados, dispara mensagens personalizadas no WhatsApp e gerencia todo o seu funil comercial em um só lugar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex space-x-4 pt-4"
        >
          <Link href="https://go.leadpluz.com/login" className="cta-button">
            Começar agora
          </Link>
          <a href="#funcionalidades" className="secondary-button">
            Ver demonstração
          </a>
        </motion.div>
      </section>

      {/* Animated App Mockup Demo */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl glow-effect aspect-video flex flex-col"
        >
          {/* Mock app header */}
          <div className="h-10 bg-[#161616] border-b border-[#222] flex items-center px-4 space-x-2 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <span className="text-[10px] text-gray-500 font-mono ml-4 truncate">app.leadpluz.com/dashboard/leads</span>
          </div>
          {/* Mock content rendering a search */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="h-6 bg-[#222] rounded w-1/3 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((x) => (
                <div key={x} className="h-8 bg-[#161616] border border-[#222] rounded-lg animate-pulse flex items-center px-3 justify-between">
                  <div className="h-3 bg-[#222] rounded w-1/4"></div>
                  <div className="h-3 bg-[#222] rounded w-1/6"></div>
                  <div className="h-3 bg-[#222] rounded w-1/12"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span>Busca finalizada: 24.774 leads qualificados adicionados.</span>
              <span className="text-white font-semibold flex items-center space-x-1">
                <span>Ir para o CRM</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="bg-[#111] border-y border-[#222] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl font-bold uppercase text-white tracking-widest">Como funciona</h2>
            <p className="text-xs text-gray-500">Aumente sua conversão em 3 passos estruturados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Busque", desc: "Digite sua palavra-chave e localização no painel e capture centenas de contatos." },
              { step: "02", title: "Conecte", desc: "Configure seus fluxos de mensagens automáticas de WhatsApp e inicie o envio." },
              { step: "03", title: "Converta", desc: "Organize seus contatos no CRM visual Kanban e finalize os agendamentos." }
            ].map((s) => (
              <div key={s.step} className="space-y-4">
                <span className="text-4xl font-extrabold text-gray-800 tracking-wider block">{s.step}</span>
                <h4 className="text-lg font-bold text-white uppercase tracking-wide">{s.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-2xl font-bold uppercase text-white tracking-widest">Funcionalidades Premium</h2>
          <p className="text-xs text-gray-500">Tudo o que você precisa para prospecção B2B de ponta a ponta</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { title: "Busca Inteligente", desc: "Varredura avançada por palavra-chave e cidade com cache inteligente de 7 dias.", icon: Search },
            { title: "Disparos no WhatsApp", desc: "Dispare scripts estruturados via Uazapi (não oficial) ou Meta Cloud API (oficial).", icon: Send },
            { title: "CRM Kanban", desc: "Visualize e movimente contatos em um pipeline de vendas integrado por colunas.", icon: Database },
            { title: "Agendamento de Calls", desc: "Marque e gerencie reuniões diretamente no calendário comercial do lead.", icon: Calendar },
            { title: "Integração Chatwoot", desc: "Tenha centralização completa de conversas do WhatsApp no Plano Ultra.", icon: Layers },
            { title: "Segurança de Dados", desc: "Conformidade e isolamento de banco de dados via Supabase RLS policies.", icon: ShieldCheck }
          ].map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={fadeInUp} className="landing-card space-y-4">
                <Icon className="w-8 h-8 text-white" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{f.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#111] border-t border-[#222] py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl font-bold uppercase text-white tracking-widest">Dúvidas frequentes</h2>
            <p className="text-xs text-gray-500">Tire suas dúvidas rápidas sobre o LEADPLUZ</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-[#222] pb-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center text-left py-3 text-sm font-bold text-white uppercase tracking-wider focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl">{activeFaq === idx ? "−" : "+"}</span>
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-gray-400 leading-relaxed pt-2">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222] py-12 px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs font-bold tracking-widest text-white">LEADPLUZ</span>
          <div className="flex space-x-6 text-[10px] uppercase font-bold text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Termos de uso</Link>
            <Link href="#" className="hover:text-white transition-colors">Política de privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Suporte</Link>
          </div>
          <span className="text-[10px] text-gray-600">
            © {new Date().getFullYear()} LEADPLUZ. Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}
