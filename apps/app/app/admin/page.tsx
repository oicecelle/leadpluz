"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  Inbox,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Lock,
  Unlock,
  Trash
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@repo/utils";

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
        // Fetch all profiles/users for administration
        const { data: usersList } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }) as any;

        const uList = usersList || [];
        setAdminUsers(uList);

        // Fetch support tickets
        const { data: ticketsList } = await supabase
          .from("support_tickets")
          .select("*, profiles(name, email)")
          .order("created_at", { ascending: false }) as any;
        setTickets(ticketsList || []);

        // Fetch API cost logs
        const { data: costLogs } = await supabase
          .from("api_cost_log")
          .select("*, profiles(name)")
          .order("created_at", { ascending: false })
          .limit(50) as any;
        setApiLogs(costLogs || []);

        // Calculate admin statistics
        const activeUsersCount = uList.filter((u: any) => u.plan_status === "active").length;
        
        // Estimate MRR (Starter = 197, Pro = 247, Ultra = 397)
        let totalMrr = 0;
        uList.forEach((u: any) => {
          if (u.plan_status === "active") {
            if (u.plan === "starter") totalMrr += 197;
            else if (u.plan === "pro") totalMrr += 247;
            else if (u.plan === "ultra") totalMrr += 397;
          }
        });

        // Sum search logs / API cost logs
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
      
      // Log audit
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-white border-r-[#222] border-b-[#222] border-l-[#222] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      {/* Top Navbar */}
      <header className="h-[60px] bg-[#111] border-b border-[#222] flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/leads" className="text-gray-400 hover:text-white flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao App</span>
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-sm font-bold text-white tracking-widest uppercase">LEADPLUZ ADMIN PANEL</h1>
        </div>

        <div className="flex space-x-2">
          {(["stats", "users", "tickets", "api_costs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 border ${
                tab === t
                  ? "bg-white text-black border-white"
                  : "bg-[#111] text-gray-400 border-[#222] hover:text-white"
              }`}
            >
              {t === "stats"
                ? "Visão Geral"
                : t === "users"
                  ? "Usuários"
                  : t === "tickets"
                    ? "Tickets"
                    : "Custos de API"}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Tab 1: Stats Overview */}
        {tab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Usuários Cadastrados", value: stats.totalUsers, icon: Users, color: "text-white" },
                { label: "Faturamento Mensal (MRR)", value: formatCurrency(stats.mrr), icon: DollarSign, color: "text-green-500" },
                { label: "WhatsApp Conectados", value: stats.activeInstances, icon: Activity, color: "text-blue-500" },
                { label: "Leads Buscados", value: stats.totalLeadsSearched, icon: Layers, color: "text-yellow-500" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="premium-card p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        {c.label}
                      </span>
                      <span className={`text-2xl font-extrabold tracking-tight ${c.color}`}>{c.value}</span>
                    </div>
                    <Icon className="w-8 h-8 text-gray-700" />
                  </div>
                );
              })}
            </div>

            {/* Sub-stats for Admin */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="premium-card p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Custo de API Google</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Consultas:</span>
                    <span className="text-white font-semibold">{stats.totalLeadsSearched / 10}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo Estimado (USD):</span>
                    <span className="text-white font-bold">${stats.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="premium-card p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pendências</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tickets de Suporte Abertos:</span>
                    <span className="text-yellow-500 font-bold">{stats.openTickets}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User management */}
        {tab === "users" && (
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Plano</th>
                    <th>Status Plano</th>
                    <th>Leads Usados</th>
                    <th>Cadastro</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-semibold text-white">{u.name}</td>
                      <td>{u.email}</td>
                      <td className="uppercase font-semibold text-xs">{u.plan}</td>
                      <td>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            u.plan_status === "active"
                              ? "bg-green-950/20 text-green-500"
                              : "bg-red-950/20 text-red-500"
                          }`}
                        >
                          {u.plan_status}
                        </span>
                      </td>
                      <td>{u.leads_used_this_cycle} / {u.leads_limit}</td>
                      <td>{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="text-right space-x-1">
                        <button
                          onClick={() => handleResetLeads(u.id)}
                          className="px-2.5 py-1 text-[9px] font-bold uppercase bg-white/5 border border-[#333] hover:bg-white/10 rounded-lg text-white"
                        >
                          Resetar Saldo
                        </button>
                        <button
                          onClick={() => handleBlockUser(u.id, !u.is_blocked)}
                          className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border ${
                            u.is_blocked
                              ? "bg-red-950/20 text-red-500 border-red-500/20 hover:bg-red-950/40"
                              : "bg-white/5 text-gray-400 border-[#333] hover:text-white"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* List */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Histórico de Chamados</h3>
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (t.status === "open") setSelectedTicket(t);
                    }}
                    className={`premium-card p-5 cursor-pointer transition-all duration-150 ${
                      t.status === "open" ? "border-yellow-500/20 hover:border-yellow-500/40" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                          {t.subject}
                        </h4>
                        <p className="text-xs text-gray-500">
                          De: {t.profiles?.name} ({t.profiles?.email})
                        </p>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                          t.status === "open"
                            ? "bg-yellow-950/20 text-yellow-500 border border-yellow-500/20"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mt-3 leading-relaxed">{t.message}</p>

                    {t.admin_reply && (
                      <div className="p-3 bg-[#161616] border-l-2 border-white text-xs text-gray-300 mt-4 rounded-r-lg">
                        <strong>Resposta:</strong> {t.admin_reply}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="premium-card p-12 text-center text-gray-500 text-sm">
                  Nenhum chamado registrado.
                </div>
              )}
            </div>

            {/* Reply Drawer / Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Responder Chamado</h3>
              {selectedTicket ? (
                <form onSubmit={handleReplyTicket} className="premium-card p-6 space-y-4">
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      <strong>Assunto:</strong> {selectedTicket.subject}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {selectedTicket.message}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1 pt-2 border-t border-[#222]">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sua Resposta</label>
                    <textarea
                      required
                      rows={5}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva a solução..."
                      className="premium-input text-xs"
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="flex-1 premium-button-secondary text-xs uppercase"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={ticketSaving}
                      className="flex-1 premium-button-primary text-xs uppercase"
                    >
                      {ticketSaving ? "Enviando..." : "Responder"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="premium-card p-8 text-center text-gray-500 text-xs">
                  Selecione um chamado aberto ao lado para responder.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: API Costs */}
        {tab === "api_costs" && (
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Palavra-chave</th>
                    <th>Cidades</th>
                    <th>Resultado Retornado</th>
                    <th>Custo Estimado</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLogs.length > 0 ? (
                    apiLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="font-semibold text-white">{log.profiles?.name || "Sistema"}</td>
                        <td>{log.keyword || "—"}</td>
                        <td>{log.city || "—"}</td>
                        <td>{log.results_returned} leads</td>
                        <td className="font-semibold text-green-500">${log.estimated_cost_usd.toFixed(2)}</td>
                        <td>{new Date(log.created_at).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                        Nenhum log de custos registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
