import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import SocialProofBar from "../components/SocialProofBar";
import HowItWorksSection from "../components/HowItWorksSection";
import FeaturesCarouselSection from "../components/FeaturesCarouselSection";
import LiaAssistantSection from "../components/LiaAssistantSection";
import AllFeaturesGridSection from "../components/AllFeaturesGridSection";
import DemoSection from "../components/DemoSection";
import GoogleApiFeatureSection from "../components/GoogleApiFeatureSection";
import SpecialistBanner from "../components/SpecialistBanner";
import PricingSection from "../components/PricingSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-[#a0a0b8] overflow-hidden select-none">
      {/* Decorative background grid */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none -z-20" />

      {/* Global Background Glow Orbs */}
      <div className="absolute top-[15%] left-[-100px] w-[500px] h-[500px] bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none -z-30" />
      <div className="absolute top-[45%] right-[-100px] w-[550px] h-[550px] bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none -z-30" />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none -z-30" />

      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Header com WhatsApp + Live Timeline Mockup */}
      <HeroSection />

      {/* 3. Proof Bar Marquee de Benefícios (Tips Horizontais) */}
      <SocialProofBar />

      {/* 4. CRM Autônomo, Follow-up, Alerta 24h & Agenda Autônoma (Sem Google Agenda) */}
      <HowItWorksSection />

      {/* 5. Carrossel de Funcionalidades Arredondadas (Financeiro, Assinatura Digital, Feed) */}
      <FeaturesCarouselSection />

      {/* 6. Seção Destacada — LIA (Assistente de IA no WhatsApp da Equipe) */}
      <LiaAssistantSection />

      {/* 7. Grid Completo — Todos os Recursos do CRM */}
      <AllFeaturesGridSection />

      {/* 8. Demonstração em Ação */}
      <div id="demonstracao">
        <DemoSection />
      </div>

      {/* 9. Transparência API Google Cloud */}
      <GoogleApiFeatureSection />

      {/* 10. Faixa Chamativa — Fale com um Especialista */}
      <SpecialistBanner />

      {/* 11. Planos e Assinatura */}
      <PricingSection />

      {/* 12. FAQ Accordion */}
      <FAQSection />

      {/* 13. Final CTA conversion layout */}
      <CTASection />

      {/* 14. Footer info links and segments */}
      <Footer />
    </div>
  );
}
