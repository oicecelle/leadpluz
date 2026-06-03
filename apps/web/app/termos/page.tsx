"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GlowOrb from "../../components/GlowOrb";
import GradientText from "../../components/GradientText";
import SectionBadge from "../../components/SectionBadge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermosPage() {
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
          <SectionBadge text="Legal" />
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Termos de <GradientText>Uso</GradientText>
          </h1>
          <p className="text-xs text-gray-500 font-mono">Última atualização: Junho de 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma <strong>LEADPLUZ</strong> (doravante denominada "Serviço" ou "Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer termo aqui descrito, solicitamos que não utilize os nossos serviços.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">2. Descrição dos Serviços</h2>
            <p>
              O LEADPLUZ é uma plataforma B2B desenvolvida para facilitar processos comerciais, oferecendo funcionalidades de:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Varredura e captação de leads qualificados com base em fontes de dados públicas;</li>
              <li>Ferramentas de disparo e automação de mensagens ativas via integração com o WhatsApp;</li>
              <li>Painel CRM integrado com funil estilo Kanban para gerenciamento de clientes em potencial.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">3. Responsabilidades do Usuário</h2>
            <p>
              Ao utilizar nossa plataforma, o usuário se compromete a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Garantir a veracidade dos dados inseridos durante o cadastro de sua conta;</li>
              <li>Utilizar a plataforma em estrita conformidade com a legislação brasileira vigente, em especial a Lei Geral de Proteção de Dados (LGPD) e o Marco Civil da Internet;</li>
              <li>Não utilizar o Serviço para envio de comunicações abusivas, em massa e sem consentimento prévio do destinatário final (SPAM abusivo);</li>
              <li>Assumir a inteira responsabilidade pelas abordagens de vendas feitas, pelas mensagens enviadas e pelas negociações conduzidas por meio do Serviço.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">4. Funcionamento do WhatsApp e Integração</h2>
            <p>
              O LEADPLUZ integra-se com serviços de envio de mensagens. O uso do WhatsApp para prospecção ativa é de inteira responsabilidade do usuário. Você declara estar ciente de que as diretrizes comerciais e políticas do WhatsApp Inc. proíbem SPAM e que o LEADPLUZ não possui influência ou responsabilidade em caso de suspensão, banimento ou perda de números decorrentes do uso inadequado de envios em massa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">5. Planos de Assinatura, Cobrança e Reembolso</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cobrança:</strong> Os planos são cobrados de forma recorrente mensal ou anualmente, dependendo do ciclo de faturamento escolhido. O processamento dos pagamentos é realizado de forma segura através da plataforma <strong>Ticto</strong>.</li>
              <li><strong>Cancelamento:</strong> O cancelamento da assinatura pode ser solicitado a qualquer momento pelo usuário diretamente no painel de controle ou junto ao suporte, impedindo cobranças futuras.</li>
              <li><strong>Reembolso:</strong> De acordo com o Código de Defesa do Consumidor, é garantido o direito de arrependimento e reembolso integral em até 7 dias corridos após a contratação inicial.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">6. Limitação de Responsabilidade</h2>
            <p>
              O LEADPLUZ envida todos os esforços razoáveis para assegurar a máxima disponibilidade e segurança da plataforma. No entanto, não garantimos que o Serviço será ininterrupto, livre de falhas de rede de operadoras de telefonia ou erros externos. A plataforma é fornecida "como está", sem garantias adicionais implícitas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-950/40 pb-2">7. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar ou atualizar estes Termos de Uso periodicamente. Quando houver alterações significativas, os usuários serão notificados através de avisos na plataforma ou por e-mail. O uso continuado do Serviço após as alterações constitui aceitação dos novos Termos.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
