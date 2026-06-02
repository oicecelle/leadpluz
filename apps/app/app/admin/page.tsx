"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Users,
  DollarSign,
  Activity,
  Layers,
  Shield,
  ArrowRight,
  Lock,
  Unlock,
  Trash,
  HelpCircle,
  Clock
} from "lucide-react";
import { formatCurrency } from "@repo/utils";

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [tab, setTab] = useState<"stats" | "users" | "tickets" | "api_costs">("stats");

  // Admin states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    mrr: 0,
    activeInstances: 0,
    openTickets: 0,
    totalLeadsSearched: 0,
    estimatedCost: 0,
  });

  // Ticket reply states
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [ticketSaving, setTicketSaving] = useState(false);

  useEffect(() => {
    const loadAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle() as any;

      if (!prof || !prof.is_admin) {
        router.push("/dashboard/leads");
        return;
      }

      setProfile(prof);

      try {
        const { data: usersList } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }) as any;

        const uList = usersList || [];
        setAdminUsers(uList);

        const { data: ticketsList } = await supabase
          .from("support_tickets")
          .select("*, profiles(name, email)")
          .order("created_at", { ascending: false }) as any;
        setTickets(ticketsList || []);

        const { data: costLogs } = await supabase
          .from("api_cost_log")
          .select("*, profiles(name)")
          .order("created_at", { ascending: false })
          .limit(50) as any;
        setApiLogs(costLogs || []);

        let totalMrr = 0;
        uList.forEach((u: any) => {
          if (u.plan_status === "active") {
            if (u.plan === "starter") totalMrr += 197;
            else if (u.plan === "pro") totalMrr += 247;
            else if (u.plan === "ultra") totalMrr += 397;
          }
        });

        const { data: costSum } = await supabase
          .from("api_cost_log")
          .select("calls_made, results_returned, estimated_cost_usd") as any;

        let leadsCount = 0;
        let totalCseCost = 0;
        if (costSum) {
          costSum.forEach((c: any) => {
            leadsCount += c.results_returned || 0;
            totalCseCost += Number(c.estimated_cost_usd) || 0;
          });
        }

        setStats({
          totalUsers: uList.length,
          mrr: totalMrr,
          activeInstances: uList.filter((u: any) => u.uazapi_instance_status === "connected").length,
          openTickets: (ticketsList || []).filter((t: any) => t.status === "open").length,
          totalLeadsSearched: leadsCount,
          estimatedCost: totalCseCost,
        });
      } catch (err: any) {
        console.error("Erro ao carregar dados administrativos:", err.message);
      }
      setLoading(false);
    };
    loadAdminData();
  }, [router]);

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({ is_blocked: isBlocked })
        .eq("id", userId);

      if (error) throw error;

      setAdminUsers(adminUsers.map((u) => (u.id === userId ? { ...u, is_blocked: isBlocked } : u)));
      
      await (supabase.from("admin_audit_log") as any).insert({
        admin_id: profile.id,
        action: isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
        target_user_id: userId,
        details: { blocked: isBlocked }
      });

      alert(isBlocked ? "Usuário bloqueado." : "Usuário desbloqueado.");
    } catch (err: any) {
      alert("Erro ao alterar bloqueio: " + err.message);
    }
  };

  const handleResetLeads = async (userId: string) => {
    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({ leads_used_this_cycle: 0 })
        .eq("id", userId);

      if (error) throw error;

      setAdminUsers(adminUsers.map((u) => (u.id === userId ? { ...u, leads_used_this_cycle: 0 } : u)));
      
      await (supabase.from("admin_audit_log") as any).insert({
        admin_id: profile.id,
        action: "RESET_QUOTA",
        target_user_id: userId,
        details: {}
      });

      alert("Saldo de leads do usuário resetado com sucesso.");
    } catch (err: any) {
      alert("Erro ao resetar saldo: " + err.message);
    }
  };

  const handleImpersonateUser = (userId: string, userName: string) => {
    localStorage.setItem("impersonated_user_id", userId);
    localStorage.setItem("impersonated_user_name", userName);
    router.push("/dashboard/leads");
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setTicketSaving(true);

    try {
      const { error } = await (supabase.from("support_tickets") as any)
        .update({
          admin_reply: replyText.trim(),
          status: "closed" as const,
        })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id ? { ...t, admin_reply: replyText.trim(), status: "closed" } : t
        )
      );

      setSelectedTicket(null);
      setReplyText("");
      alert("Resposta enviada e ticket marcado como Fechado!");
    } catch (err: any) {
      alert("Erro ao responder ticket: " + err.message);
    } finally {
      setTicketSaving(false);
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
      <div className="space-y-6 select-none animate-in fade-in duration-200">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-[rgba(251,191,36,0.15)]">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {([
              { key: "stats", label: "Visão Geral" },
              { key: "users", label: "Gestão de Usuários" },
              { key: "tickets", label: "Tickets de Suporte" },
              { key: "api_costs", label: "Custos de API" }
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-150 border cursor-pointer whitespace-nowrap ${
                  tab === t.key
                    ? "bg-[#fbbf24] text-black border-[#fbbf24] font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    : "bg-[#0a0a0f] text-gray-400 border-[rgba(255,255,255,0.06)] hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-[#fbbf24] bg-yellow-950/20 border border-yellow-500/20 px-3 py-1 rounded font-bold uppercase tracking-wider block">
            Painel Geral
          </span>
        </div>

        {/* Tab 1: Stats Overview */}
        {tab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Usuários Cadastrados", value: stats.totalUsers, icon: Users, border: "border-yellow-500/20", color: "text-[#fbbf24]" },
                { label: "Faturamento Mensal (MRR)", value: formatCurrency(stats.mrr), icon: DollarSign, border: "border-green-500/20", color: "text-[#4ade80]" },
                { label: "Canais Conectados", value: stats.activeInstances, icon: Activity, border: "border-blue-500/20", color: "text-[#60a5fa]" },
                { label: "Total Leads Buscados", value: stats.totalLeadsSearched, icon: Layers, border: "border-purple-500/20", color: "text-purple-400" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className={`card p-5 border-l-2 hover:-translate-y-0.5 transition-all duration-150 ${c.border}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-extrabold text-white tracking-tight">{c.value}</span>
                      <Icon className={`w-4 h-4 ${c.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2.5 block">
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google Maps API Cost Estimation */}
              <div className="card p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                  Custo Operacional de API
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Buscas Efetuadas:</span>
                    <span className="text-white">{(stats.totalLeadsSearched / 10).toFixed(0)} requests</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Custo Estimado (USD):</span>
                    <span className="text-[#fbbf24] font-bold">${stats.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pendências de Suporte */}
              <div className="card p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                  Fila de Atendimento
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Tickets de Suporte Abertos:</span>
                    <span className="text-[#fbbf24] font-extrabold">{stats.openTickets}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-relaxed font-medium">
                    Chamados pendentes abertos por usuários do sistema. Clique na aba &quot;Tickets de Suporte&quot; para respondê-los.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User management */}
        {tab === "users" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead className="bg-[#141426]">
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Plano</th>
                    <th>Status</th>
                    <th>Leads Usados</th>
                    <th>Cadastro</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[rgba(139,69,212,0.04)] transition-colors">
                      <td className="font-semibold text-white">{u.name}</td>
                      <td className="text-gray-400 font-mono text-xs">{u.email}</td>
                      <td>
                        {u.plan === "ultra" ? (
                          <span className="badge bg-gradient-to-r from-[#6b2fb5] to-[#a855f7] border-0 text-white font-extrabold text-[10px] uppercase py-0.5 px-2 rounded-full flex items-center space-x-1 w-fit">
                            <span>⚡</span>
                            <span>{u.plan}</span>
                          </span>
                        ) : u.plan === "pro" ? (
                          <span className="badge badge-purple text-[10px] uppercase font-bold py-0.5 px-2 rounded-full">{u.plan}</span>
                        ) : (
                          <span className="badge bg-gray-900 border border-gray-800 text-gray-400 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full">{u.plan}</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                            u.plan_status === "active"
                              ? "bg-[#051505] text-[#4ade80] border-[rgba(34,197,94,0.3)]"
                              : "bg-[#150505] text-[#f87171] border-[rgba(239,68,68,0.3)]"
                          }`}
                        >
                          {u.plan_status}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-gray-300">
                        <strong className="text-white font-semibold">{u.leads_used_this_cycle}</strong> / {u.leads_limit}
                      </td>
                      <td className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                      
                      {/* Admin Actions */}
                      <td className="text-right space-x-2.5 whitespace-nowrap">
                        <button
                          onClick={() => handleImpersonateUser(u.id, u.name)}
                          className="px-2.5 py-1 text-[9px] font-bold uppercase bg-yellow-950/20 border border-yellow-500/20 hover:bg-yellow-950/40 rounded-lg text-[#fbbf24] transition-all cursor-pointer inline-flex items-center space-x-1"
                        >
                          <span>Impersonar</span>
                        </button>
                        <button
                          onClick={() => handleResetLeads(u.id)}
                          className="px-2.5 py-1 text-[9px] font-bold uppercase bg-[#141426] border border-[rgba(139,69,212,0.15)] hover:border-[rgba(139,69,212,0.3)] rounded-lg text-gray-300 transition-all cursor-pointer"
                        >
                          Resetar Saldo
                        </button>
                        <button
                          onClick={() => handleBlockUser(u.id, !u.is_blocked)}
                          className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                            u.is_blocked
                              ? "bg-[#150505] text-[#f87171] border-red-500/20 hover:bg-[#150505]/75"
                              : "bg-[#0a0a0f] text-gray-500 border-[rgba(255,255,255,0.06)] hover:text-white"
                          }`}
                        >
                          {u.is_blocked ? "Desbloquear" : "Bloquear"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tickets replies */}
        {tab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Histórico de Chamados</h3>
              
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (t.status === "open") setSelectedTicket(t);
                    }}
                    className={`card p-5 cursor-pointer hover:border-[rgba(251,191,36,0.3)] hover:shadow-glow-sm transition-all duration-150 ${
                      t.status === "open" ? "border-yellow-500/20" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                          {t.subject}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          De: <span className="text-purple-300 font-semibold">{t.profiles?.name}</span> ({t.profiles?.email})
                        </p>
                      </div>
                      
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                          t.status === "open"
                            ? "bg-[#150f00] text-[#fbbf24] border-[rgba(245,158,11,0.2)] animate-pulse"
                            : "bg-[#0a0a0f] text-gray-400 border-[rgba(255,255,255,0.06)]"
                        }`}
                      >
                        {t.status === "open" ? "Aberto" : "Resolvido"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mt-3.5 leading-relaxed font-medium">{t.message}</p>

                    {t.admin_reply && (
                      <div className="p-3 bg-[#0a0a0f] border-l-2 border-[#fbbf24] text-[11px] text-yellow-300 mt-3 rounded-r-lg">
                        <strong className="font-bold">Resposta Enviada:</strong> {t.admin_reply}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="card p-12 text-center text-gray-500 text-xs font-semibold">
                  Nenhum chamado aberto registrado.
                </div>
              )}
            </div>

            {/* Reply Drawer */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Responder Chamado</h3>
              
              {selectedTicket ? (
                <form onSubmit={handleReplyTicket} className="card p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="text-[11px] text-gray-400 space-y-1.5 leading-relaxed">
                    <p>
                      <strong className="text-white">Assunto:</strong> {selectedTicket.subject}
                    </p>
                    <p>
                      <strong className="text-white">Descrição:</strong> {selectedTicket.message}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Escrever Resposta</label>
                    <textarea
                      required
                      rows={5}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Instruções e solução comercial..."
                      className="input text-xs"
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="flex-1 btn-secondary text-xs uppercase"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={ticketSaving}
                      className="flex-1 btn-primary text-xs uppercase shadow-glow-sm text-center justify-center font-bold"
                      style={{ background: 'linear-gradient(135deg, #b5982f, #fbbf24)', color: '#000' }}
                    >
                      {ticketSaving ? "Enviando..." : "Responder"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="card p-8 text-center text-gray-500 text-xs font-semibold">
                  Selecione um chamado aberto ao lado para interagir e enviar uma resposta direta.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: API Costs */}
        {tab === "api_costs" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead className="bg-[#141426]">
                  <tr>
                    <th>Usuário</th>
                    <th>Palavra-chave</th>
                    <th>Cidades</th>
                    <th>Resultados</th>
                    <th>Custo Estimado</th>
                    <th>Data da Busca</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLogs.length > 0 ? (
                    apiLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[rgba(139,69,212,0.04)] transition-colors">
                        <td className="font-semibold text-white">{log.profiles?.name || "Sistema"}</td>
                        <td className="text-xs text-gray-400">{log.keyword || "—"}</td>
                        <td className="text-xs text-gray-400">{log.city || "—"}</td>
                        <td className="font-mono text-xs text-gray-300">{log.results_returned} contatos</td>
                        <td className="font-bold text-[#4ade80] font-mono text-xs">${log.estimated_cost_usd.toFixed(2)}</td>
                        <td className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                        Nenhum log de custos de API registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
