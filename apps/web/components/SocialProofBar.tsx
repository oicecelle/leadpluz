"use client";

import { Stethoscope, Sparkles, Scale, Home, HelpCircle, GraduationCap, HeartPulse, ShoppingBag } from "lucide-react";

export default function SocialProofBar() {
  const segments = [
    { name: "Odontologia", icon: Stethoscope },
    { name: "Estética", icon: Sparkles },
    { name: "Advocacia", icon: Scale },
    { name: "Imóveis", icon: Home },
    { name: "Consultoria", icon: HelpCircle },
    { name: "Educação", icon: GraduationCap },
    { name: "Saúde", icon: HeartPulse },
    { name: "Varejo", icon: ShoppingBag }
  ];

  const list = [...segments, ...segments, ...segments, ...segments];

  return (
    <section className="bg-[#0a0a0f] border-y border-purple-950/20 py-8 overflow-hidden w-full select-none">
      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Utilizado por empresas de todos os segmentos
        </span>
      </div>

      <div className="relative w-full flex items-center overflow-x-hidden py-2">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap">
          {list.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Icon className="w-4 h-4 text-purple-400/60" />
                <span>{item.name}</span>
                <span className="text-purple-950 ml-4">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
