"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
  useDraggable,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { Plus, X, Phone, MapPin, Tag, ArrowRight } from "lucide-react";
import { formatPhone } from "@repo/utils";

function mapColumnTitleToStatus(title: string, index: number): string {
  const t = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t.includes("novo") || t.includes("entrada") || t.includes("lead")) return "new";
  if (t.includes("contat") || t.includes("conversa") || t.includes("primeiro") || t.includes("atend")) return "contacted";
  if (t.includes("propost") || t.includes("negoc") || t.includes("envia")) return "proposal_sent";
  if (t.includes("fechad") || t.includes("convert") || t.includes("ganho") || t.includes("sucesso")) return "converted";
  if (t.includes("perdid") || t.includes("sem interesse") || t.includes("desist") || t.includes("arquiv")) return "no_interest";
  
  if (index === 0) return "new";
  if (index === 1) return "contacted";
  if (index === 2) return "proposal_sent";
  if (index === 3) return "converted";
  return "no_interest";
}

function getColumnIdForStatus(status: string, cols: any[]) {
  const index = cols.findIndex((c, idx) => mapColumnTitleToStatus(c.title, idx) === status);
  if (index !== -1) return cols[index].id;
  if (status === "new") return cols[0]?.id;
  if (status === "contacted") return cols[1]?.id || cols[0]?.id;
  if (status === "proposal_sent") return cols[2]?.id || cols[0]?.id;
  if (status === "converted") return cols[3]?.id || cols[0]?.id;
  return cols[cols.length - 1]?.id;
}

// Column Component
function KanbanColumn({ col, leads, onCardClick, onStatusChange }: any) {
  const { setNodeRef } = useDroppable({
    id: col.id
  });

  return (
    <div
      ref={setNodeRef}
      className="w-[280px] bg-[#0f0f1a] border border-[rgba(139,69,212,0.12)] rounded-xl flex flex-col max-h-[75vh] flex-shrink-0"
    >
      {/* Header */}
      <header className="p-4 border-b border-[rgba(139,69,212,0.12)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color || "#6b2fb5" }} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
        </div>
        <span className="badge badge-purple px-2 py-0.5 rounded-full text-[10px]">
          {leads.length}
        </span>
      </header>

      {/* Cards List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar min-h-[150px]">
        {leads.length > 0 ? (
          leads.map((l: any) => (
            <KanbanCard key={l.id} lead={l} onClick={() => onCardClick(l)} onStatusChange={onStatusChange} />
          ))
        ) : (
          <div className="text-center py-10 text-[11px] text-gray-600 border border-dashed border-[rgba(139,69,212,0.12)] rounded-lg font-medium">
            Sem leads nesta etapa
          </div>
        )}
      </div>
    </div>
  );
}

// Card Component
function KanbanCard({ lead, onClick, onStatusChange }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(2deg)`,
        opacity: isDragging ? 0.7 : 1,
        boxShadow: isDragging ? "var(--glow-md)" : undefined,
        zIndex: 50
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="bg-[#141426] border border-[rgba(139,69,212,0.1)] rounded-lg p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-[rgba(139,69,212,0.5)] hover:shadow-glow-sm transition-all duration-200"
    >
      <div className="flex flex-col space-y-1">
        <span className="text-xs font-semibold text-white leading-normal truncate">{lead.name}</span>
        {lead.category && (
          <span className="badge badge-purple w-fit py-0 px-2 rounded-full text-[9px] font-bold uppercase tracking-wider">{lead.category}</span>
        )}
      </div>

      <div className="space-y-1.5 pt-2.5 border-t border-[rgba(139,69,212,0.08)] text-[11px] text-gray-400">
        {lead.phone && (
          <div className="flex items-center space-x-1.5 font-mono text-[10px]">
            <Phone className="w-3 h-3 text-gray-500" />
            <span>{formatPhone(lead.phone)}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center space-x-1.5 text-[10px]">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="truncate">
              {lead.city}, {lead.state || ""}
            </span>
          </div>
        )}
      </div>

      {/* Select Dropdown to update Status directly from card */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="mt-2.5 pt-2.5 border-t border-[rgba(139,69,212,0.08)]"
      >
        <select
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
          className={`w-full text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-lg border font-bold outline-none cursor-pointer bg-[#0f0f1a] transition-all ${
            lead.status === "new"
              ? "text-[#c084fc] border-[rgba(139,69,212,0.3)] hover:border-[rgba(139,69,212,0.5)]"
              : lead.status === "contacted"
                ? "text-[#60a5fa] border-[rgba(59,130,246,0.3)] hover:border-[rgba(59,130,246,0.5)]"
                : lead.status === "proposal_sent"
                  ? "text-[#fbbf24] border-[rgba(245,158,11,0.3)] hover:border-[rgba(245,158,11,0.5)]"
                  : lead.status === "converted"
                    ? "text-[#4ade80] border-[rgba(34,197,94,0.3)] hover:border-[rgba(34,197,94,0.5)]"
                    : "text-[#f87171] border-[rgba(239,68,68,0.3)] hover:border-[rgba(239,68,68,0.5)]"
          }`}
        >
          <option value="new">Novo</option>
          <option value="contacted">Contatado</option>
          <option value="proposal_sent">Proposta</option>
          <option value="converted">Convertido</option>
          <option value="no_interest">Sem interesse</option>
        </select>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const noteSaveTimeout = useRef<any>(null);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColColor, setNewColColor] = useState("#8b45d4");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    const loadKanbanData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await (supabase.from("profiles") as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);

        if (prof) {
          let { data: cols } = await (supabase.from("kanban_columns") as any)
            .select("*")
            .eq("user_id", prof.id)
            .order("position", { ascending: true });

          if (!cols || cols.length === 0) {
            const defaults = [
              { user_id: prof.id, title: "Novo lead", position: 0, color: "#8b45d4" },
              { user_id: prof.id, title: "Primeiro contato", position: 1, color: "#60a5fa" },
              { user_id: prof.id, title: "Proposta enviada", position: 2, color: "#fbbf24" },
              { user_id: prof.id, title: "Fechado", position: 3, color: "#4ade80" }
            ];
            const { data: inserted } = await (supabase.from("kanban_columns") as any)
              .insert(defaults)
              .select();
            cols = inserted || [];
          }

          setColumns(cols);

          const { data: userLeads } = await (supabase.from("user_leads") as any)
            .select("*")
            .eq("user_id", prof.id);

          setLeads(userLeads || []);
        }
      }
      setLoading(false);
    };
    loadKanbanData();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const targetColumnId = over.id as string;

    const leadToMove = leads.find((l) => l.id === leadId);
    if (!leadToMove) return;

    const targetCol = columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    const colIndex = columns.findIndex((c) => c.id === targetColumnId);
    const newStatus = mapColumnTitleToStatus(targetCol.title, colIndex);
    const contactedAt = newStatus === "contacted"
      ? (leadToMove.contacted_at || new Date().toISOString())
      : (newStatus === "new" ? null : leadToMove.contacted_at);

    setLeads(
      leads.map((l) =>
        l.id === leadId ? { ...l, kanban_column_id: targetColumnId, status: newStatus, contacted_at: contactedAt } : l
      )
    );

    try {
      const { error } = await (supabase.from("user_leads") as any)
        .update({
          kanban_column_id: targetColumnId,
          status: newStatus,
          contacted_at: contactedAt
        })
        .eq("id", leadId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Erro ao mover card no banco:", err.message);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const leadToMove = leads.find((l) => l.id === leadId);
    if (!leadToMove) return;

    const targetColumnId = getColumnIdForStatus(newStatus, columns);
    const contactedAt = newStatus === "contacted"
      ? (leadToMove.contacted_at || new Date().toISOString())
      : (newStatus === "new" ? null : leadToMove.contacted_at);

    setLeads(
      leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: newStatus,
              kanban_column_id: targetColumnId,
              contacted_at: contactedAt
            }
          : l
      )
    );

    try {
      const { error } = await (supabase.from("user_leads") as any)
        .update({
          status: newStatus,
          kanban_column_id: targetColumnId,
          contacted_at: contactedAt
        })
        .eq("id", leadId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Erro ao atualizar status do card:", err.message);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newColTitle.trim()) return;

    try {
      const { data, error } = await (supabase.from("kanban_columns") as any)
        .insert([
          {
            user_id: profile.id,
            title: newColTitle.trim(),
            position: columns.length,
            color: newColColor
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setColumns([...columns, data]);
      setNewColTitle("");
      setNewColColor("#8b45d4");
      setShowAddColumn(false);
    } catch (err: any) {
      alert("Erro ao adicionar coluna: " + err.message);
    }
  };

  const handleCardClick = (lead: any) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.notes || "");
  };

  const handleNotesChange = (newVal: string) => {
    setDrawerNotes(newVal);

    if (noteSaveTimeout.current) {
      clearTimeout(noteSaveTimeout.current);
    }

    noteSaveTimeout.current = setTimeout(async () => {
      if (!selectedLead) return;
      try {
        const { error } = await (supabase.from("user_leads") as any)
          .update({ notes: newVal })
          .eq("id", selectedLead.id);

        if (error) throw error;

        setLeads(leads.map((l) => (l.id === selectedLead.id ? { ...l, notes: newVal } : l)));
      } catch (err: any) {
        console.error("Erro ao salvar observação:", err.message);
      }
    }, 1000);
  };

  const handleCloseDrawer = () => {
    setSelectedLead(null);
    setDrawerNotes("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 flex flex-col h-full relative select-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white">Funil Comercial Kanban</h1>
            <p className="text-xs text-gray-500">Arraste os leads entre as etapas para atualizar o progresso comercial.</p>
          </div>
          <button
            onClick={() => setShowAddColumn(true)}
            className="btn-primary flex items-center space-x-2 text-xs uppercase py-2 cursor-pointer shadow-glow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Coluna</span>
          </button>
        </div>

        {/* Board Columns container */}
        <div className="flex-1 flex overflow-x-auto space-x-6 pb-6 items-start no-scrollbar min-h-[500px]">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {columns.map((col, index) => {
              const colLeads = leads
                .filter((l) => {
                  if (l.kanban_column_id === col.id) return true;
                  if (!l.kanban_column_id && index === 0) return true;
                  return false;
                })
                .sort((a, b) => a.kanban_position - b.kanban_position);

              return (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  leads={colLeads}
                  onCardClick={handleCardClick}
                  onStatusChange={handleStatusChange}
                />
              );
            })}

            <DragOverlay>
              {activeId ? (
                <div className="bg-[#141426] border border-[#a855f7]/50 rounded-lg p-4 space-y-3 shadow-glow-md rotate-[2deg] opacity-90 cursor-grabbing">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-semibold text-white leading-normal truncate">
                      {leads.find((l) => l.id === activeId)?.name}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Drawer Detail Sidebar - Slide Panel */}
        {selectedLead && (
          <>
            {/* Backdrop click-out */}
            <div 
              onClick={handleCloseDrawer} 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
            ></div>
            
            <div className="fixed inset-y-0 right-0 w-[380px] bg-[#0f0f1a] border-l border-[rgba(139,69,212,0.22)] z-50 flex flex-col justify-between shadow-glow-lg animate-in slide-in-from-right duration-300">
              <div>
                <header className="p-6 border-b border-[rgba(139,69,212,0.12)] flex items-center justify-between">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Detalhes do Lead
                    </span>
                    <span className="text-sm font-bold text-purple-300 truncate max-w-[280px]">{selectedLead.name}</span>
                  </div>
                  <button
                    onClick={handleCloseDrawer}
                    className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </header>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] no-scrollbar">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Telefone
                      </span>
                      <span className="text-xs font-semibold text-white font-mono">
                        {selectedLead.phone ? formatPhone(selectedLead.phone) : "—"}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        E-mail
                      </span>
                      <span className="text-xs font-semibold text-white truncate">{selectedLead.email || "—"}</span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Categoria / Localização
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {selectedLead.category || "—"} |{" "}
                        {selectedLead.city ? `${selectedLead.city}, ${selectedLead.state || ""}` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Notes */}
                  <div className="flex flex-col space-y-2 pt-4 border-t border-[rgba(139,69,212,0.12)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Observações
                      </span>
                      <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-wider">(salva automático)</span>
                    </div>
                    <textarea
                      rows={5}
                      value={drawerNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Histórico comercial, detalhes do contato..."
                      className="input text-xs"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Drawer actions */}
              <div className="p-6 border-t border-[rgba(139,69,212,0.12)] bg-[#0a0a0f] flex flex-col space-y-3">
                <button
                  onClick={() => router.push("/dashboard/agendamentos")}
                  className="w-full btn-primary text-xs py-3 font-semibold uppercase tracking-wider justify-center shadow-glow-sm cursor-pointer"
                >
                  <span>Agendar Call</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push("/dashboard/disparos")}
                  className="w-full btn-secondary text-xs py-3 font-semibold uppercase tracking-wider justify-center cursor-pointer"
                >
                  <span>Iniciar Disparo</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add Column Modal */}
        {showAddColumn && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0f0f1a] border border-[rgba(139,69,212,0.22)] rounded-xl overflow-hidden shadow-glow-sm animate-in scale-in duration-200">
              <header className="px-6 py-4 border-b border-[rgba(139,69,212,0.12)] flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Nova Coluna
                </h3>
                <button
                  onClick={() => setShowAddColumn(false)}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              <form onSubmit={handleAddColumn} className="p-6 space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Título da etapa</label>
                  <input
                    type="text"
                    required
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    placeholder="Ex: Contato via WhatsApp"
                    className="input"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cor identificadora</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={newColColor}
                      onChange={(e) => setNewColColor(e.target.value)}
                      className="w-12 h-10 border border-[rgba(139,69,212,0.22)] rounded-lg bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 font-mono font-medium">{newColColor}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(139,69,212,0.12)]">
                  <button
                    type="button"
                    onClick={() => setShowAddColumn(false)}
                    className="btn-secondary text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs uppercase py-2.5 px-4 cursor-pointer"
                  >
                    Adicionar Coluna
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
