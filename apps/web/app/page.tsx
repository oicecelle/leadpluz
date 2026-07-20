import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import SocialProofBar from "../components/SocialProofBar";
import HowItWorksSection from "../components/HowItWorksSection";
import FeaturesSection from "../components/FeaturesSection";
import DemoSection from "../components/DemoSection";
import GoogleApiFeatureSection from "../components/GoogleApiFeatureSection";
import PricingSection from "../components/PricingSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-[#a0a0b8] overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none -z-20" />

      {/* Global Background Glow Orbs for texture */}
      <div className="absolute top-[20%] left-[-100px] w-[500px] h-[500px] bg-purple-900/5 rounded-full filter blur-[100px] pointer-events-none -z-30" />
      <div className="absolute top-[50%] right-[-100px] w-[550px] h-[550px] bg-purple-900/5 rounded-full filter blur-[100px] pointer-events-none -z-30" />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-purple-900/5 rounded-full filter blur-[100px] pointer-events-none -z-30" />

      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Header */}
      <HeroSection />

      {/* 3. Proof Bar Marquee */}
      <SocialProofBar />

      {/* 4. Timeline process step list */}
      <HowItWorksSection />

      {/* 5. Features Grid and Security Card */}
      <FeaturesSection />

      {/* 6. Live Dashboard Simulation and progress metrics */}
      <DemoSection />

      {/* 6.5. Transparência API Google Cloud */}
      <GoogleApiFeatureSection />

      {/* 7. Pricing plans */}
      <PricingSection />

      {/* 8. FAQ items Accordion */}
      <FAQSection />

      {/* 9. Final CTA conversion layout */}
      <CTASection />

      {/* 10. Footer info links and segments */}
      <Footer />
    </div>
  );
}
