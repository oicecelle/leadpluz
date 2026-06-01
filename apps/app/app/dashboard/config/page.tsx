"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import { User, CreditCard, HelpCircle, Key, RefreshCw, Send, Check } from "lucide-react";

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

        // Fetch support tickets
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-white border-r-[#222] border-b-[#222] border-l-[#222] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Account Details */}
          <div className="space-y-6">
            {/* Profile form */}
            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Minha Conta</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="premium-input"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail (Leitura)</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="premium-input opacity-40 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Avatar URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="premium-input"
                  />
                </div>

                <button type="submit" disabled={saving} className="premium-button-primary text-xs uppercase">
                  {saving ? "Salvando..." : "Atualizar Cadastro"}
                </button>
              </form>
            </div>

            {/* Password change */}
            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3 mb-2">
                <Key className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Alterar Senha</h3>
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
                    className="premium-input"
                  />
                </div>

                <button type="submit" disabled={saving} className="premium-button-secondary text-xs uppercase">
                  Alterar Senha
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Billing & Support */}
          <div className="space-y-6">
            {/* Subscription details */}
            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3 mb-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Assinatura</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Plano Atual:</span>
                  <span className="text-white font-bold uppercase tracking-wider">{profile?.plan}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      profile?.plan_status === "active"
                        ? "bg-green-950/20 text-green-500 border border-green-500/20"
                        : "bg-red-950/20 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {profile?.plan_status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Renovação:</span>
                  <span className="text-white">
                    {profile?.plan_expires_at
                      ? new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Support section */}
            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#222] pb-3 mb-2">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Suporte Técnico</h3>
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
                    className="premium-input text-xs"
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
                    className="premium-input text-xs"
                  ></textarea>
                </div>

                <button type="submit" disabled={saving} className="premium-button-primary text-xs uppercase w-full">
                  Abrir Ticket
                </button>
              </form>

              {/* Tickets list */}
              {tickets.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#222] max-h-[200px] overflow-y-auto no-scrollbar">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-3 bg-[#161616] border border-[#222] rounded-lg text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{t.subject}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            t.status === "open"
                              ? "bg-yellow-950/20 text-yellow-500"
                              : t.status === "closed"
                                ? "bg-gray-800 text-gray-400"
                                : "bg-blue-950/20 text-blue-500"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-gray-400">{t.message}</p>
                      {t.admin_reply && (
                        <div className="p-2 bg-[#222] border-l-2 border-white text-gray-300 mt-2">
                          <strong>Suporte:</strong> {t.admin_reply}
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
