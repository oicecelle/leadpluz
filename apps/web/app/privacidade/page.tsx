"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GlowOrb from "../../components/GlowOrb";
import GradientText from "../../components/GradientText";
import SectionBadge from "../../components/SectionBadge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-[#a0a0b8] overflow-hidden flex flex-col justify-between">
      {/* Decorative background elements */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none -z-20" />
      <GlowOrb className="top-10 -right-20" size="600px" color="rgba(139, 69, 212, 0.15)" />
      <GlowOrb className="bottom-10 -left-20" size="400px" color="rgba(107, 47, 181, 0.1)" delay={2} />

      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-6 pt-32 pb-24 z-10 flex-1">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Home</span>
          </Link>
        </div>

        <div className="space-y-4 mb-12">
          <SectionBadge text="Segurança" />
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Política de <GradientText>Privacidade</GradientText>
          </h1>
          <p className="text-xs text-gray-500 font-mono">Última atualização: Junho de 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">1. Introdução e Compromisso</h2>
            <p>
              A privacidade e a segurança das informações dos nossos usuários e de suas respectivas bases de leads são valores fundamentais para a <strong>LEADPLUZ</strong>. Esta Política de Privacidade explica de forma transparente como coletamos, processamos, armazenamos e protegemos seus dados pessoais e as informações que passam pela nossa plataforma comercial, em plena consonância com a Lei Geral de Proteção de Dados (Lei nº 13.709/18 - LGPD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">2. Coleta de Informações</h2>
            <p>
              Nós coletamos informações em duas categorias distintas para garantir o pleno funcionamento do Serviço:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados da Conta do Usuário:</strong> Dados necessários para cadastro e autenticação, como nome completo, e-mail, senha criptografada e dados de pagamento geridos pela processadora segura Ticto.</li>
              <li><strong>Dados de Prospecção e Leads:</strong> Informações de empresas e contatos obtidos de bases de dados de acesso público pelo usuário (como palavras-chave de pesquisa do Google Maps) e as mensagens enviadas/recebidas por meio de conexões de WhatsApp ativas na plataforma.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">3. Uso das Informações</h2>
            <p>
              Os dados coletados são utilizados unicamente para:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fornecer, gerenciar e personalizar as funcionalidades do LEADPLUZ;</li>
              <li>Processar as solicitações de busca comercial configuradas ativamente pelo usuário;</li>
              <li>Fornecer suporte técnico e operacional ao cliente;</li>
              <li>Enviar atualizações críticas do sistema, alertas de uso e faturamento.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">4. Segurança de Dados e RLS (Row Level Security)</h2>
            <p>
              A segurança das suas informações de leads é o nosso maior ativo comercial.
            </p>
            <p>
              Utilizamos infraestrutura de nuvem moderna e robusta no **Supabase**. Cada conta e ambiente de cliente possui **isolamento completo de banco de dados por Row Level Security (RLS)**. Isso garante, no nível físico do banco de dados, que nenhuma outra conta ou terceiro possa visualizar, acessar ou modificar a sua base de contatos, histórico de conversas ou informações de inteligência de vendas. Toda a comunicação de rede é realizada via criptografia HTTPS/SSL ponta a ponta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">5. Compartilhamento e Cessão de Dados</h2>
            <p>
              O LEADPLUZ **não vende, não aluga e não compartilha** de forma alguma os dados cadastrais dos usuários ou as bases de leads salvas em suas contas para finalidades comerciais de terceiros. As únicas transmissões ocorrem para operadoras financeiras credenciadas (Ticto) para validação do plano, e para a infraestrutura técnica estrita que hospeda a própria plataforma, sob sigilo e termos equivalentes de proteção de dados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">6. Direitos do Titular de Dados (LGPD)</h2>
            <p>
              Conforme as disposições da LGPD, os usuários têm o direito de, a qualquer momento, mediante requisição simples por suporte eletrônico:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Confirmar a existência do tratamento de dados pessoais;</li>
              <li>Acessar, corrigir ou atualizar seus dados cadastrais;</li>
              <li>Solicitar a portabilidade ou a eliminação completa dos dados armazenados em nossos servidores.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">7. Alterações na Política de Privacidade</h2>
            <p>
              Podemos modificar esta Política de Privacidade a qualquer momento para adequação legislativa ou melhoria tecnológica. A versão em vigor estará sempre acessível nesta página, e a data da última atualização constará no topo do documento.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
