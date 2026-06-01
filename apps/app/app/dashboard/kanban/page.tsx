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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Plus, X, Phone, MapPin, Tag, MoreHorizontal } from "lucide-react";
import { formatPhone } from "@repo/utils";

// Column Component
function KanbanColumn({ col, leads, onCardClick }: any) {
  const { setNodeRef } = useDroppable({
    id: col.id
  });

  return (
    <div
      ref={setNodeRef}
      className="w-[280px] bg-[#111] border border-[#222] rounded-xl flex flex-col max-h-[75vh] flex-shrink-0"
    >
      {/* Header */}
      <header className="p-4 border-b border-[#222] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color || "#333" }} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
        </div>
        <span className="text-[10px] bg-[#222] text-gray-400 font-bold px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </header>

      {/* Cards List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar">
        {leads.length > 0 ? (
          leads.map((l: any) => (
            <KanbanCard key={l.id} lead={l} onClick={() => onCardClick(l)} />
          ))
        ) : (
          <div className="text-center py-8 text-[11px] text-gray-600 border border-dashed border-[#222] rounded-lg">
            Sem leads nesta etapa
          </div>
        )}
      </div>
    </div>
  );
}

// Card Component
function KanbanCard({ lead, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="premium-card p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-gray-600"
    >
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-semibold text-white leading-normal truncate">{lead.name}</span>
        {lead.category && (
          <span className="text-[10px] text-gray-500 font-medium">{lead.category}</span>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#222] text-[11px] text-gray-400">
        {lead.phone && (
          <div className="flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-600" />
            <span>{formatPhone(lead.phone)}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-600" />
            <span className="truncate">
              {lead.city}, {lead.state || ""}
            </span>
          </div>
        )}
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

  // Active dragged card
  const [activeId, setActiveId] = useState<string | null>(null);

  // Detail Modal / Sidebar drawer
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const noteSaveTimeout = useRef<any>(null);

  // Column creation
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColColor, setNewColColor] = useState("#333333");

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
          // Fetch columns
          let { data: cols } = await (supabase.from("kanban_columns") as any)
            .select("*")
            .eq("user_id", prof.id)
            .order("position", { ascending: true });

          // If no columns, create default ones
          if (!cols || cols.length === 0) {
            const defaults = [
              { user_id: prof.id, title: "Novo lead", position: 0, color: "#333333" },
              { user_id: prof.id, title: "Primeiro contato", position: 1, color: "#ff9f43" },
              { user_id: prof.id, title: "Proposta enviada", position: 2, color: "#00d25b" },
              { user_id: prof.id, title: "Fechado", position: 3, color: "#0090e7" }
            ];
            const { data: inserted } = await (supabase.from("kanban_columns") as any)
              .insert(defaults)
              .select();
            cols = inserted || [];
          }

          setColumns(cols);

          // Fetch leads
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

    // Check if column exists
    const targetCol = columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    // Update in local state
    setLeads(
      leads.map((l) =>
        l.id === leadId ? { ...l, kanban_column_id: targetColumnId } : l
      )
    );

    // Update in DB
    try {
      const { error } = await (supabase.from("user_leads") as any)
        .update({
          kanban_column_id: targetColumnId
        })
        .eq("id", leadId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Erro ao mover card no banco:", err.message);
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
      setNewColColor("#333333");
      setShowAddColumn(false);
    } catch (err: any) {
      alert("Erro ao adicionar coluna: " + err.message);
    }
  };

  const handleCardClick = (lead: any) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.notes || "");
  };

  // Real-time observations saving
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

        // Update local state leads list
        setLeads(leads.map((l) => (l.id === selectedLead.id ? { ...l, notes: newVal } : l)));
      } catch (err: any) {
        console.error("Erro ao salvar observação:", err.message);
      }
    }, 1000); // 1s debounce
  };

  const handleCloseDrawer = () => {
    setSelectedLead(null);
    setDrawerNotes("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 flex flex-col h-full relative">
        {/* Kanban Board header */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Arraste os leads entre as colunas para atualizar as etapas.
          </div>
          <button
            onClick={() => setShowAddColumn(true)}
            className="premium-button-primary flex items-center space-x-2 text-xs uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Coluna</span>
          </button>
        </div>

        {/* Board Columns container */}
        <div className="flex-1 flex overflow-x-auto space-x-6 pb-6 items-start no-scrollbar">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {columns.map((col) => {
              // Group leads in this column
              const colLeads = leads
                .filter((l) => l.kanban_column_id === col.id)
                .sort((a, b) => a.kanban_position - b.kanban_position);

              return (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  leads={colLeads}
                  onCardClick={handleCardClick}
                />
              );
            })}

            {/* Drag overlay to display styled card during drag */}
            <DragOverlay>
              {activeId ? (
                <div className="premium-card p-4 space-y-3 shadow-2xl opacity-80 border-white">
                  <span className="text-sm font-semibold text-white leading-normal truncate">
                    {leads.find((l) => l.id === activeId)?.name}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Drawer Detail Sidebar */}
        {selectedLead && (
          <div className="fixed inset-y-0 right-0 w-[420px] bg-[#111] border-l border-[#222] z-50 flex flex-col justify-between shadow-2xl">
            <div>
              <header className="p-6 border-b border-[#222] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    Detalhes do Lead
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{selectedLead.name}</span>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
                {/* Details list */}
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Telefone
                    </span>
                    <span className="text-sm text-white">
                      {selectedLead.phone ? formatPhone(selectedLead.phone) : "—"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      E-mail
                    </span>
                    <span className="text-sm text-white">{selectedLead.email || "—"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Categoria / Localização
                    </span>
                    <span className="text-sm text-white">
                      {selectedLead.category || "—"} |{" "}
                      {selectedLead.city ? `${selectedLead.city}, ${selectedLead.state || ""}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Real-time Notes */}
                <div className="flex flex-col space-y-2 pt-4 border-t border-[#222]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Observações
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono">(salva em tempo real)</span>
                  </div>
                  <textarea
                    rows={4}
                    value={drawerNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Escreva notas e histórico comercial deste lead..."
                    className="premium-input text-xs"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#222] bg-[#161616] flex flex-col space-y-3">
              <button
                onClick={() => router.push("/dashboard/agendamentos")}
                className="w-full premium-button-primary text-xs uppercase"
              >
                Agendar Call
              </button>
              <button
                onClick={() => router.push("/dashboard/disparos")}
                className="w-full premium-button-secondary text-xs uppercase"
              >
                Iniciar Disparo
              </button>
            </div>
          </div>
        )}

        {/* Add Column Modal */}
        {showAddColumn && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
              <header className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Nova Coluna
                </h3>
                <button
                  onClick={() => setShowAddColumn(false)}
                  className="text-gray-500 hover:text-white transition-colors"
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
                    className="premium-input"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cor identificadora</label>
                  <input
                    type="color"
                    value={newColColor}
                    onChange={(e) => setNewColColor(e.target.value)}
                    className="w-12 h-10 border border-[#222] rounded-lg bg-transparent cursor-pointer"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                  <button
                    type="button"
                    onClick={() => setShowAddColumn(false)}
                    className="premium-button-secondary text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="premium-button-primary text-xs uppercase"
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
