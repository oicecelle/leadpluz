"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import { Plus, X, Video, Calendar, Clock, Trash2, ArrowRight } from "lucide-react";
import { formatDate } from "@repo/utils";

export default function AgendamentosPage() {
  const [profile, setProfile] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter tab
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("30");
  const [platform, setPlatform] = useState<"google_meet" | "zoom" | "teams" | "other">("google_meet");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await (supabase.from("profiles") as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);

        if (prof) {
          const { data: agends } = await (supabase.from("schedules") as any)
            .select("*, user_leads(name, phone)")
            .eq("user_id", prof.id)
            .order("scheduled_at", { ascending: true });

          setCalls(agends || []);

          const { data: userLeads } = await (supabase.from("user_leads") as any)
            .select("id, name")
            .eq("user_id", prof.id);
          setLeads(userLeads || []);
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedLeadId || !title.trim() || !scheduledAt) return;
    setModalLoading(true);

    const callPayload = {
      user_id: profile.id,
      user_lead_id: selectedLeadId,
      title: title.trim(),
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: parseInt(duration),
      platform,
      meeting_url: meetingUrl.trim() || null,
      notes: notes.trim() || null,
      status: "upcoming" as const,
    };

    try {
      const { data, error } = await (supabase.from("schedules") as any)
        .insert([callPayload])
        .select("*, user_leads(name, phone)")
        .single();

      if (error) throw error;

      setCalls([...calls, data]);
      setShowAddModal(false);
      
      setSelectedLeadId("");
      setTitle("");
      setScheduledAt("");
      setDuration("30");
      setPlatform("google_meet");
      setMeetingUrl("");
      setNotes("");

      alert("Reunião agendada com sucesso!");
    } catch (err: any) {
      alert("Erro ao agendar reunião: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "completed" | "cancelled" | "no_show") => {
    try {
      const { error } = await (supabase.from("schedules") as any)
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setCalls(calls.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      alert("Status atualizado com sucesso.");
    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      const { error } = await (supabase.from("schedules") as any).delete().eq("id", id);
      if (error) throw error;

      setCalls(calls.filter((c) => c.id !== id));
      alert("Agendamento removido.");
    } catch (err: any) {
      alert("Erro ao remover agendamento: " + err.message);
    }
  };

  const filteredCalls = calls.filter((c) => {
    if (tab === "upcoming") return c.status === "upcoming";
    if (tab === "completed") return c.status === "completed";
    return c.status === "cancelled" || c.status === "no_show";
  });

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
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-[rgba(139,69,212,0.12)] w-full sm:w-auto pb-px">
            {(["upcoming", "completed", "cancelled"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 cursor-pointer ${
                  tab === t
                    ? "border-[#a855f7] text-white font-bold"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                {t === "upcoming" ? "Próximas Calls" : t === "completed" ? "Realizadas" : "Canceladas"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2 text-xs uppercase py-2.5 px-4 shadow-glow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Call</span>
          </button>
        </div>

        {/* Miniature Calendar Grid Preview */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cronograma do Mês</span>
            <span className="text-[9px] text-[#a855f7] font-extrabold uppercase tracking-wider">Visualização rápida</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="font-bold text-gray-500 uppercase text-[9px] tracking-wider">{d}</div>
            ))}
            
            {Array.from({ length: 28 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasCallThisDay = dayNum % 7 === 3; // Mock visual call indicator
              return (
                <div
                  key={idx}
                  className={`aspect-square p-2 border rounded-lg flex flex-col justify-between items-center transition-colors ${
                    hasCallThisDay 
                      ? "bg-[rgba(139,69,212,0.06)] border-[rgba(139,69,212,0.22)]" 
                      : "bg-[#141426]/30 border-[rgba(139,69,212,0.06)] hover:border-[rgba(139,69,212,0.15)]"
                  }`}
                >
                  <span className="font-semibold text-gray-400 text-[10px]">{dayNum}</span>
                  {hasCallThisDay && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-glow-sm" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCalls.length > 0 ? (
            filteredCalls.map((c) => {
              const dateObj = new Date(c.scheduled_at);
              const day = String(dateObj.getDate()).padStart(2, '0');
              const month = dateObj.toLocaleDateString("pt-BR", { month: 'short' }).substring(0, 3).toUpperCase();
              
              return (
                <div key={c.id} className="card p-5 hover:border-[rgba(139,69,212,0.25)] hover:shadow-glow-sm transition-all duration-150 relative flex">
                  
                  {/* Left Date Column (48px) */}
                  <div className="w-[48px] flex flex-col items-center justify-center pr-4">
                    <span className="text-xl font-extrabold text-white leading-none">{day}</span>
                    <span className="text-[9px] text-[#a855f7] font-bold tracking-wider mt-1">{month}</span>
                  </div>

                  {/* Vertical separator */}
                  <div className="w-[1px] bg-gradient-to-b from-transparent via-[rgba(139,69,212,0.15)] to-transparent mx-1.5"></div>

                  {/* Call details */}
                  <div className="flex-1 pl-4 space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium">Lead: <span className="text-purple-300 font-semibold">{c.user_leads?.name || "Sem Nome"}</span></p>
                      </div>

                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          c.status === "upcoming"
                            ? "bg-[#150f00] text-[#fbbf24] border-[rgba(245,158,11,0.3)]"
                            : c.status === "completed"
                              ? "bg-[#051505] text-[#4ade80] border-[rgba(34,197,94,0.3)]"
                              : "bg-[#150505] text-[#f87171] border-[rgba(239,68,68,0.3)]"
                        }`}
                      >
                        {c.status === "upcoming" ? "Pendente" : c.status === "completed" ? "Concluída" : "Cancelada"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-[11px] text-gray-400 font-medium pt-2 border-t border-[rgba(139,69,212,0.06)]">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(c.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{c.duration_minutes} min</span>
                      </div>
                    </div>

                    {c.meeting_url && (
                      <div className="pt-1">
                        <a
                          href={c.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center space-x-2 text-[10px] py-1.5 px-3 rounded-lg border-[rgba(139,69,212,0.22)]"
                        >
                          <Video className="w-3.5 h-3.5 text-[#a855f7]" />
                          <span>Entrar na Reunião</span>
                        </a>
                      </div>
                    )}

                    {/* Status actions */}
                    {c.status === "upcoming" && (
                      <div className="flex space-x-2 pt-1.5 justify-end">
                        <button
                          onClick={() => handleUpdateStatus(c.id, "completed")}
                          className="px-2.5 py-1.5 bg-[#051505] border border-green-500/25 text-[#4ade80] text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#051505]/75 cursor-pointer"
                        >
                          Concluída
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.id, "cancelled")}
                          className="px-2.5 py-1.5 bg-[#150505] border border-red-500/25 text-[#f87171] text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#150505]/75 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    {c.status !== "upcoming" && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleDeleteCall(c.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 card p-16 text-center text-gray-500 text-xs font-semibold">
              Nenhuma call agendada para esta listagem.
            </div>
          )}
        </div>
      </div>

      {/* Add Call Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0f1a] border border-[rgba(139,69,212,0.22)] rounded-xl overflow-hidden shadow-glow-sm animate-in scale-in duration-200">
            <header className="px-6 py-4 border-b border-[rgba(139,69,212,0.12)] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Agendar Reunião (Call)</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleAddCall} className="p-6 space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Selecionar Lead</label>
                <select
                  required
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="input text-xs cursor-pointer"
                >
                  <option value="">Selecione o lead...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Título da call</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Call de Alinhamento de Proposta"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Data e Hora</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="input text-xs cursor-pointer"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Duração (minutos)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="30">30 min</option>
                    <option value="60">1 hora</option>
                    <option value="90">1h30</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Link de Acesso (URL)</label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Anotações adicionais</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(139,69,212,0.12)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary text-xs uppercase py-2.5 px-4 cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
