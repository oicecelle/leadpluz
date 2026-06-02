"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import { User, CreditCard, HelpCircle, Key, ChevronRight, Check } from "lucide-react";

export default function ConfigPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await (supabase.from("profiles") as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);

        if (prof) {
          setName(prof.name);
          setAvatarUrl(prof.avatar_url || "");
        }

        const { data: ticks } = await (supabase.from("support_tickets") as any)
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        setTickets(ticks || []);
      }
      setLoading(false);
    };
    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({
          name: name.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      alert("Perfil atualizado com sucesso!");
    } catch (err: any) {
      alert("Erro ao atualizar perfil: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) throw error;
      setPassword("");
      alert("Senha alterada com sucesso!");
    } catch (err: any) {
      alert("Erro ao alterar senha: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !ticketSubject.trim() || !ticketMessage.trim()) return;
    setSaving(true);

    try {
      const { data, error } = await (supabase.from("support_tickets") as any)
        .insert([
          {
            user_id: profile.id,
            subject: ticketSubject.trim(),
            message: ticketMessage.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTickets([data, ...tickets]);
      setTicketSubject("");
      setTicketMessage("");
      alert("Ticket de suporte aberto com sucesso! Nosso time responderá em breve.");
    } catch (err: any) {
      alert("Erro ao abrir ticket: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-purple-500 border-r-purple-900/30 border-b-purple-900/30 border-l-purple-900/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl select-none animate-in fade-in duration-200">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Account Details */}
          <div className="space-y-6">
            
            {/* Profile form */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[rgba(139,69,212,0.12)] pb-3.5 mb-2">
                <User className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Minha Conta</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail (Leitura)</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="input text-xs opacity-40 cursor-not-allowed border-[rgba(255,255,255,0.02)]"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Avatar URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://suaimagem.com/avatar.jpg"
                    className="input text-xs"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary text-xs uppercase px-4 py-2 cursor-pointer mt-2"
                >
                  {saving ? "Salvando..." : "Atualizar Cadastro"}
                </button>
              </form>
            </div>

            {/* Password change */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[rgba(139,69,212,0.12)] pb-3.5 mb-2">
                <Key className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Alterar Senha</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input text-xs"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-secondary text-xs uppercase px-4 py-2 cursor-pointer mt-2"
                >
                  Alterar Senha
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Billing & Support */}
          <div className="space-y-6">
            
            {/* Subscription details */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[rgba(139,69,212,0.12)] pb-3.5 mb-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Assinatura do Plano</h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Plano Contratado:</span>
                  <span className="gradient-text font-extrabold uppercase tracking-wide text-sm">{profile?.plan}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Status da Assinatura:</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      profile?.plan_status === "active"
                        ? "bg-[#051505] text-[#4ade80] border-[rgba(34,197,94,0.3)]"
                        : "bg-[#150505] text-[#f87171] border-[rgba(239,68,68,0.3)]"
                    }`}
                  >
                    {profile?.plan_status === "active" ? "● Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Data de Renovação:</span>
                  <span className="text-white font-medium">
                    {profile?.plan_expires_at
                      ? new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Support section */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[rgba(139,69,212,0.12)] pb-3.5 mb-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Suporte Técnico</h3>
              </div>

              <form onSubmit={handleOpenTicket} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Assunto</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Qual a sua dúvida ou problema?"
                    className="input text-xs"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Mensagem</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Descreva com detalhes..."
                    className="input text-xs"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary text-xs uppercase w-full justify-center py-2.5 cursor-pointer shadow-glow-sm"
                >
                  Abrir Ticket
                </button>
              </form>

              {/* Tickets list */}
              {tickets.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[rgba(139,69,212,0.12)] max-h-[220px] overflow-y-auto no-scrollbar">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Chamados Abertos</span>
                  {tickets.map((t) => (
                    <div key={t.id} className="p-3.5 bg-[#141426]/50 border border-[rgba(139,69,212,0.08)] rounded-lg text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white uppercase tracking-wide text-[11px]">{t.subject}</span>
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full border ${
                            t.status === "open"
                              ? "bg-[#150f00] text-[#fbbf24] border-[rgba(245,158,11,0.2)]"
                              : "bg-[#0a0a0f] text-gray-400 border-[rgba(255,255,255,0.06)]"
                          }`}
                        >
                          {t.status === "open" ? "Aberto" : "Resolvido"}
                        </span>
                      </div>
                      <p className="text-gray-400 font-medium text-[11px] leading-relaxed">{t.message}</p>
                      
                      {t.admin_reply && (
                        <div className="p-3 bg-[#0a0a0f] border-l-2 border-[#a855f7] text-[11px] text-purple-300 mt-2.5 rounded-r-lg">
                          <strong className="font-bold block text-white uppercase tracking-wider text-[9px] mb-1">Resposta do Suporte:</strong> 
                          {t.admin_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
