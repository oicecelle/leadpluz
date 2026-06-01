"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";

export default function PlanosPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: prof } = await (supabase.from("profiles") as any)
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (prof) {
        setProfile(prof);
        // If already active, send back to dashboard
        if (prof.plan_status === "active" || prof.plan_status === "trial") {
          router.push("/dashboard/leads");
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handleSimulateSubscription = async (plan: "starter" | "pro" | "ultra") => {
    if (!profile) return;
    setLoading(true);
    
    // Simulate webhook behavior locally by directly updating profile in this test/dev environment
    const limits = {
      starter: 500,
      pro: 2000,
      ultra: 10000
    };

    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({
          plan: plan,
          plan_status: "active",
          plan_started_at: new Date().toISOString(),
          plan_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          leads_limit: limits[plan],
          leads_used_this_cycle: 0
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Update cookies for middleware
      document.cookie = `plan-status=active; path=/; max-age=86400; SameSite=Lax`;
      
      alert(`Plano ${plan.toUpperCase()} assinado com sucesso (Simulado)!`);
      router.push("/dashboard/leads");
    } catch (err: any) {
      alert("Erro ao simular assinatura: " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-white border-r-[#222] border-b-[#222] border-l-[#222] rounded-full animate-spin"></div>
      </div>
    );
  }

  const plans = [
    {
      name: "Starter",
      id: "starter",
      price: "R$ 197",
      leads: "500 leads/mês",
      features: [
        "Busca inteligente de leads",
        "Disparos via WhatsApp não oficial (Uazapi)",
        "CRM completo com Kanban",
        "Agendamento de calls com leads",
        "Suporte por tickets",
      ],
      notIncluded: [
        "API Oficial do WhatsApp",
        "Integração Chatwoot",
      ]
    },
    {
      name: "Pro",
      id: "pro",
      price: "R$ 247",
      leads: "2.000 leads/mês",
      highlight: true,
      features: [
        "Busca inteligente de leads",
        "Disparos via WhatsApp não oficial (Uazapi)",
        "CRM completo com Kanban",
        "Agendamento de calls com leads",
        "Suporte prioritário por tickets",
      ],
      notIncluded: [
        "API Oficial do WhatsApp",
        "Integração Chatwoot",
      ]
    },
    {
      name: "Ultra",
      id: "ultra",
      price: "R$ 397",
      leads: "10.000 leads/mês",
      features: [
        "Busca inteligente de leads",
        "Disparos via WhatsApp não oficial (Uazapi)",
        "API Oficial do WhatsApp (Meta Cloud API)",
        "Integração Chatwoot inclusa",
        "CRM completo com Kanban",
        "Agendamento de calls com leads",
        "Suporte VIP dedicado",
      ],
      notIncluded: []
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-white tracking-wider mb-4 uppercase">Escolha seu plano</h1>
          <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
            Selecione uma assinatura para começar a prospectar leads qualificados e disparar mensagens automáticas via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`premium-card relative flex flex-col justify-between p-8 ${
                p.highlight ? "border-white bg-[#161616]" : "bg-[#111]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  Mais Escolhido
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">{p.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-extrabold text-white">{p.price}</span>
                  <span className="text-xs text-gray-500 ml-1">/mês</span>
                </div>

                <div className="border-t border-[#222] py-4 mb-6">
                  <span className="text-sm font-semibold text-white">{p.leads}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start space-x-3 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-white flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {p.notIncluded.map((f) => (
                    <li key={f} className="flex items-start space-x-3 text-xs text-gray-600 line-through">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSimulateSubscription(p.id as any)}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  p.highlight
                    ? "bg-white text-black hover:opacity-90"
                    : "bg-[#1a1a1a] text-white border border-[#333] hover:bg-[#222]"
                }`}
              >
                <span>Assinar Plano</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
