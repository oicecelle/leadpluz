"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import { Plus, X, Video, Calendar, Clock, Trash2, Edit3, CheckCircle } from "lucide-react";
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
          // Fetch calls
          const { data: agends } = await (supabase.from("schedules") as any)
            .select("*, user_leads(name, phone)")
            .eq("user_id", prof.id)
            .order("scheduled_at", { ascending: true });

          setCalls(agends || []);

          // Fetch user leads for autocomplete selection
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
      
      // Reset form
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

  // Filtered calls list based on tab
  const filteredCalls = calls.filter((c) => {
    if (tab === "upcoming") return c.status === "upcoming";
    if (tab === "completed") return c.status === "completed";
    return c.status === "cancelled" || c.status === "no_show";
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-white border-r-[#222] border-b-[#222] border-l-[#222] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header Toolbar */}
        <div className="flex justify-between items-center">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-[#222] pb-px">
            {(["upcoming", "completed", "cancelled"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-b-2 ${
                  tab === t
                    ? "border-white text-white font-semibold"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                {t === "upcoming" ? "Próximas Calls" : t === "completed" ? "Realizadas" : "Canceladas"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="premium-button-primary flex items-center space-x-2 text-xs uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Call</span>
          </button>
        </div>

        {/* Custom Month Calendar Grid Preview (Miniature representation) */}
        <div className="premium-card p-6 grid grid-cols-7 gap-2 text-center text-xs">
          <div className="font-bold text-gray-500 uppercase text-[10px]">Dom</div>
          <div className="font-bold text-gray-500 uppercase text-[10px]">Seg</div>
          <div className="font-bold text-gray-500 uppercase text-[10px]">Ter</div>
          <div className="font-bold text-gray-500 uppercase text-[10px]">Qua</div>
          <div className="font-bold text-gray-500 uppercase text-[10px]">Qui</div>
          <div className="font-bold text-gray-500 uppercase text-[10px]">Sex</div>
          <div className="font-bold text-gray-500 uppercase text-[10px]">Sáb</div>
          
          {/* Render calendar grid blocks */}
          {Array.from({ length: 31 }).map((_, idx) => {
            const dayNum = idx + 1;
            // Check if there are calls on this day (simplified mock check)
            const hasCallThisDay = dayNum % 8 === 0;
            return (
              <div
                key={idx}
                className={`aspect-square p-2 border border-[#222] rounded-lg flex flex-col justify-between items-center ${
                  hasCallThisDay ? "bg-white/5 border-white/20" : "bg-[#111]"
                }`}
              >
                <span className="font-semibold text-gray-400">{dayNum}</span>
                {hasCallThisDay && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Calls List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCalls.length > 0 ? (
            filteredCalls.map((c) => (
              <div key={c.id} className="premium-card p-5 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                      {c.title}
                    </h4>
                    <p className="text-xs text-gray-400">Lead: {c.user_leads?.name || "Sem Nome"}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.status === "upcoming"
                        ? "bg-yellow-950/20 text-yellow-500 border border-yellow-500/20"
                        : c.status === "completed"
                          ? "bg-green-950/20 text-green-500 border border-green-500/20"
                          : "bg-red-950/20 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 pt-2 border-t border-[#222]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>{formatDate(c.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>Duração: {c.duration_minutes} min</span>
                  </div>
                </div>

                {c.meeting_url && (
                  <div className="pt-2">
                    <a
                      href={c.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-xs text-white hover:underline bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333]"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Entrar na Reunião</span>
                    </a>
                  </div>
                )}

                {/* Status action buttons */}
                {c.status === "upcoming" && (
                  <div className="flex space-x-2 pt-2 justify-end">
                    <button
                      onClick={() => handleUpdateStatus(c.id, "completed")}
                      className="px-3 py-1.5 bg-green-950/30 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase rounded-lg hover:bg-green-950/50"
                    >
                      Realizada
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(c.id, "cancelled")}
                      className="px-3 py-1.5 bg-red-950/30 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase rounded-lg hover:bg-red-950/50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {c.status !== "upcoming" && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleDeleteCall(c.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 premium-card p-12 text-center text-gray-500 text-sm">
              Nenhuma call agendada para esta listagem.
            </div>
          )}
        </div>
      </div>

      {/* Add Call Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Agendar Reunião (Call)</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
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
                  className="premium-input text-xs"
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
                  className="premium-input"
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
                    className="premium-input text-xs"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Duração (minutos)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="premium-input text-xs"
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
                    className="premium-input text-xs"
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
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Anotações adicionais</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="premium-input text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="premium-button-secondary text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="premium-button-primary text-xs uppercase"
                >
                  {modalLoading ? "Agendando..." : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
