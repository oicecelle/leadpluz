"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  Database,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  FileUp,
  FileDown,
  X,
  MessageSquare,
  Search,
  Users,
  Send,
  Check,
  TrendingUp
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatPhone } from "@repo/utils";

export default function CRMPage() {
  const [profile, setProfile] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters and Sorting
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Selected leads for batch actions
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Edit / Add Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Derived categories & sources dynamically based on current leads in user's list (normalized & sorted)
  const categories = Array.from(new Set(
    leads.map((l: any) => {
      const cat = l.category?.trim();
      if (!cat) return null;
      return cat.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }).filter(Boolean)
  )).sort() as string[];

  const sources = Array.from(new Set(leads.map((l: any) => l.source_type).filter(Boolean))) as string[];

  // Excel Import state
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const loadProfileAndLeads = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await (supabase.from("profiles") as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);

        if (prof) {
          const { data: userLeads, error } = await (supabase.from("user_leads") as any)
            .select("*")
            .eq("user_id", prof.id)
            .order("created_at", { ascending: false });

          if (!error && userLeads) {
            setLeads(userLeads);
          }
        }
      }
      setLoading(false);
    };
    loadProfileAndLeads();
  }, []);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ total: number; imported: number; limitReached: boolean } | null>(null);

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Nome: "João Silva",
        Telefone: "5511999999999",
        Email: "joao.silva@exemplo.com",
        Categoria: "Dentista",
        Cidade: "São Paulo",
        Estado: "SP",
        Status: "new",
        Notas: "Interessado em implante dentário"
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Importacao");
    XLSX.writeFile(workbook, "modelo_importacao_leads.xlsx");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImportFile(files[0] || null);
    setImportResult(null);
  };

  const executeImport = async () => {
    if (!importFile || !profile) return;
    setImportLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const bstr = event.target?.result;
          if (!bstr) throw new Error("Não foi possível ler o arquivo.");
          const workbook = XLSX.read(bstr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) throw new Error("A planilha está vazia.");
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) throw new Error("Não foi possível ler os dados da planilha.");
          const data: any[] = XLSX.utils.sheet_to_json(worksheet);

          if (data.length === 0) {
            alert("Nenhum registro encontrado na planilha.");
            setImportLoading(false);
            return;
          }

          const balance = profile.leads_limit - profile.leads_used_this_cycle;
          if (balance <= 0) {
            alert("Seu saldo de leads está esgotado! Faça upgrade para continuar importando.");
            setImportLoading(false);
            return;
          }

          let recordsToImport = data;
          let limitReached = false;
          if (data.length > balance) {
            recordsToImport = data.slice(0, balance);
            limitReached = true;
          }

          const leadsToInsert = recordsToImport.map(row => {
            const getVal = (possibleKeys: string[]) => {
              const key = Object.keys(row).find(k => 
                possibleKeys.includes(k.toLowerCase().trim())
              );
              return key ? String(row[key]).trim() : null;
            };

            const nome = getVal(["nome", "name", "nome completo"]) || "Sem Nome";
            let telefone = getVal(["telefone", "phone", "celular", "whatsapp"]);
            if (telefone) {
              telefone = telefone.replace(/[\s\+\-\(\)]/g, '');
              if (telefone.length === 11 && !telefone.startsWith("55")) {
                telefone = "55" + telefone;
              } else if (telefone.length === 9 && !telefone.startsWith("55")) {
                telefone = "5511" + telefone;
              }
            }

            const email = getVal(["email", "e-mail", "correio eletronico"]);
            const categoria = getVal(["categoria", "category", "ramo", "segmento"]);
            const cidade = getVal(["cidade", "city", "bairro"]);
            const estado = getVal(["estado", "state", "uf"]);
            let status = getVal(["status", "situacao"]);
            const validStatuses = ["new", "contacted", "proposal_sent", "converted", "no_interest"];
            if (!status || !validStatuses.includes(status.toLowerCase())) {
              status = "new";
            } else {
              status = status.toLowerCase();
            }
            const notes = getVal(["notas", "notes", "observacao", "observacoes"]);

            return {
              user_id: profile.id,
              name: nome,
              phone: telefone,
              email: email,
              category: categoria,
              city: cidade,
              state: estado,
              status: status,
              notes: notes,
              source_type: "import" as const
            };
          });

          const { data: inserted, error: insertErr } = await (supabase.from("user_leads") as any)
            .insert(leadsToInsert)
            .select();

          if (insertErr) throw insertErr;

          const newUsed = profile.leads_used_this_cycle + leadsToInsert.length;
          const { error: profileErr } = await (supabase.from("profiles") as any)
            .update({ leads_used_this_cycle: newUsed })
            .eq("id", profile.id);

          if (profileErr) throw profileErr;

          setLeads(prev => [...(inserted || []), ...prev]);
          setProfile({ ...profile, leads_used_this_cycle: newUsed });

          setImportResult({
            total: data.length,
            imported: leadsToInsert.length,
            limitReached
          });

          alert(`Importação concluída com sucesso! ${leadsToInsert.length} leads importados.`);
        } catch (err: any) {
          alert("Erro ao processar conteúdo da planilha: " + err.message);
        } finally {
          setImportLoading(false);
        }
      };

      reader.readAsBinaryString(importFile);
    } catch (err: any) {
      alert("Erro ao ler o arquivo: " + err.message);
      setImportLoading(false);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredLeads.map((l) => l.id);
    const allSelected = filteredIds.every((id) => selectedLeads.includes(id));
    if (allSelected) {
      setSelectedLeads((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedLeads((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleExportSelected = () => {
    const leadsToExport = leads.filter((l) => selectedLeads.includes(l.id));
    if (leadsToExport.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(
      leadsToExport.map((l) => ({
        Nome: l.name,
        Telefone: l.phone || "",
        Email: l.email || "",
        Categoria: l.category || "",
        Cidade: l.city || "",
        Estado: l.state || "",
        Status: l.status,
        Origem: l.source_type || "",
        Notas: l.notes || "",
        BuscadoEm: l.created_at ? new Date(l.created_at).toLocaleDateString("pt-BR") : "",
        ContatadoEm: l.contacted_at ? new Date(l.contacted_at).toLocaleDateString("pt-BR") : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CRM Leads Selecionados");
    XLSX.writeFile(workbook, "leads_selecionados.xlsx");
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir os ${selectedLeads.length} leads selecionados?`)) return;
    try {
      const { error } = await (supabase.from("user_leads") as any)
        .delete()
        .in("id", selectedLeads);
      if (error) throw error;

      setLeads(leads.filter((l) => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);
      alert("Leads excluídos com sucesso.");
    } catch (err: any) {
      alert("Erro ao excluir leads: " + err.message);
    }
  };

  const handleInlineStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const existingLead = leads.find((l) => l.id === leadId);
      const contactedAt = newStatus === "contacted" 
        ? (existingLead?.contacted_at || new Date().toISOString()) 
        : (newStatus === "new" ? null : existingLead?.contacted_at);

      const { error } = await (supabase.from("user_leads") as any)
        .update({ status: newStatus, contacted_at: contactedAt })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus, contacted_at: contactedAt } : l)));
    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    try {
      const { error } = await (supabase.from("user_leads") as any).delete().eq("id", leadId);
      if (error) throw error;

      setLeads(leads.filter((l) => l.id !== leadId));
      alert("Lead excluído com sucesso.");
    } catch (err: any) {
      alert("Erro ao excluir lead: " + err.message);
    }
  };

  const handleSaveLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setModalLoading(true);

    const formData = new FormData(e.currentTarget);
    const contactedAtVal = formData.get("contacted_at") as string;
    const leadData = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      category: formData.get("category") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
      website: formData.get("website") as string,
      instagram: formData.get("instagram") as string,
      tiktok: formData.get("tiktok") as string,
      user_id: profile.id,
      contacted_at: contactedAtVal ? new Date(contactedAtVal).toISOString() : (formData.get("status") === "contacted" ? new Date().toISOString() : null),
    };

    try {
      if (editingLead?.id) {
        const { error } = await (supabase.from("user_leads") as any)
          .update(leadData)
          .eq("id", editingLead.id);
        if (error) throw error;

        setLeads(leads.map((l) => (l.id === editingLead.id ? { ...l, ...leadData } : l)));
        alert("Lead atualizado com sucesso.");
      } else {
        const { data, error } = await (supabase.from("user_leads") as any)
          .insert([leadData])
          .select()
          .single();
        if (error) throw error;

        setLeads([data, ...leads]);
        alert("Lead criado com sucesso.");
      }
      setShowEditModal(false);
      setEditingLead(null);
    } catch (err: any) {
      alert("Erro ao salvar lead: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleExport = () => {
    if (leads.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(
      leads.map((l) => ({
        Nome: l.name,
        Telefone: l.phone || "",
        Email: l.email || "",
        Categoria: l.category || "",
        Cidade: l.city || "",
        Estado: l.state || "",
        Status: l.status,
        Origem: l.source_type || "",
        Notas: l.notes || "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CRM Leads");
    XLSX.writeFile(workbook, "crm_leads.xlsx");
  };

  const totalLeads = leads.length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const proposalCount = leads.filter((l) => l.status === "proposal_sent").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;
  const noInterestCount = leads.filter((l) => l.status === "no_interest").length;

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.phone && l.phone.includes(searchQuery)) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || (l.category && l.category.trim().toLowerCase() === categoryFilter.toLowerCase());
    const matchesSource = sourceFilter === "all" || l.source_type === sourceFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSource;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 select-none">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total leads", value: totalLeads, border: "border-purple-500/20 hover:border-purple-500/40", icon: Users, color: "text-purple-400" },
            { label: "Contatados", value: contactedCount, border: "border-blue-500/20 hover:border-blue-500/40", icon: MessageSquare, color: "text-[#60a5fa]" },
            { label: "Proposta Enviada", value: proposalCount, border: "border-yellow-500/20 hover:border-yellow-500/40", icon: Send, color: "text-[#fbbf24]" },
            { label: "Convertidos", value: convertedCount, border: "border-green-500/20 hover:border-green-500/40", icon: Check, color: "text-[#4ade80]" },
            { label: "Sem interesse", value: noInterestCount, border: "border-red-500/20 hover:border-red-500/40", icon: X, color: "text-[#f87171]" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`card p-5 flex flex-col justify-center border-l-2 hover:-translate-y-0.5 transition-all duration-150 ${m.border}`}>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{m.value}</span>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2.5">
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Toolbar & Filters */}
        <div className="card p-4 flex flex-col gap-4">
          {/* Top row: Search and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-full"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setEditingLead(null);
                  setShowEditModal(true);
                }}
                className="btn-primary flex items-center space-x-2 text-xs py-2 uppercase font-bold tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Lead</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-secondary flex items-center space-x-2 text-xs py-2 uppercase font-bold tracking-wider cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                <span>Importar Excel</span>
              </button>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center space-x-2 text-xs py-2 uppercase font-bold tracking-wider cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          {/* Bottom row: Filters & Sorting (below search) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-[rgba(255,255,255,0.04)]">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtrar:</span>
              
              {/* Filters Selects */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input h-8 py-0 px-2 text-[11px] !w-32 font-medium cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="new">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="proposal_sent">Proposta</option>
                  <option value="converted">Convertido</option>
                  <option value="no_interest">Sem interesse</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input h-8 py-0 px-2 text-[11px] !w-36 font-medium cursor-pointer"
                >
                  <option value="all">Categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[10px] text-purple-300 font-bold whitespace-nowrap bg-[rgba(139,69,212,0.06)] border border-[rgba(139,69,212,0.15)] px-2.5 py-1 rounded-lg ml-1">
                {filteredLeads.length} de {leads.length} filtrados
              </span>
            </div>

            {/* Sorting */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input h-8 py-0 px-2 text-[11px] !w-36 font-medium cursor-pointer"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Actions floating bar */}
        {selectedLeads.length > 0 && (
          <div className="bg-purple-950/20 border border-purple-500/25 px-5 py-3 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
            <span className="text-xs text-purple-300 font-semibold">
              ⚡ {selectedLeads.length} {selectedLeads.length === 1 ? "lead selecionado" : "leads selecionados"}
            </span>
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleExportSelected}
                className="btn-primary py-1.5 px-3.5 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-glow-sm"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Exportar Selecionados</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 text-red-200 py-1.5 px-3.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Excluir Selecionados</span>
              </button>
              <button
                onClick={() => setSelectedLeads([])}
                className="btn-secondary py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead className="bg-[#141426]">
                <tr>
                  <th className="w-[45px]">
                    <div 
                      onClick={handleSelectAllFiltered}
                      className="w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer border-[rgba(139,69,212,0.3)] bg-transparent hover:border-[#8b45d4]"
                    >
                      {filteredLeads.length > 0 && filteredLeads.every(l => selectedLeads.includes(l.id)) && (
                        <div className="w-2.5 h-2.5 bg-[#a855f7] rounded-sm shadow-glow-sm" />
                      )}
                    </div>
                  </th>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Categoria</th>
                  <th>Cidade/Bairro</th>
                  <th>Buscado em</th>
                  <th className="w-[100px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.length > 0 ? (
                  sortedLeads.map((lead) => (
                    <tr key={lead.id} className={`hover:bg-[rgba(139,69,212,0.04)] transition-colors ${selectedLeads.includes(lead.id) ? "bg-[rgba(139,69,212,0.02)]" : ""}`}>
                      <td>
                        <div 
                           onClick={() => handleSelectLead(lead.id)}
                          className="w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer border-[rgba(139,69,212,0.3)] bg-transparent hover:border-[#8b45d4]"
                        >
                          {selectedLeads.includes(lead.id) && (
                            <div className="w-2.5 h-2.5 bg-[#a855f7] rounded-sm shadow-glow-sm" />
                          )}
                        </div>
                      </td>
                      <td className="font-semibold text-white break-words max-w-[200px]">{lead.name}</td>
                      <td className="whitespace-nowrap">
                        <div className="flex flex-col text-xs space-y-0.5">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="hover:underline hover:text-[#a855f7] font-mono text-white font-medium">
                              {formatPhone(lead.phone)}
                            </a>
                          )}
                          {lead.email && <span className="text-gray-500 font-medium">{lead.email}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col space-y-1">
                          <select
                            value={lead.status}
                            onChange={(e) => handleInlineStatusChange(lead.id, e.target.value)}
                            className={`text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-full border font-bold outline-none cursor-pointer transition-all ${
                              lead.status === "new"
                                ? "bg-[#0f0f1a] text-[#c084fc] border-[rgba(139,69,212,0.3)] hover:border-[rgba(139,69,212,0.5)]"
                                : lead.status === "contacted"
                                  ? "bg-[#0a1520] text-[#60a5fa] border-[rgba(59,130,246,0.3)] hover:border-[rgba(59,130,246,0.5)]"
                                  : lead.status === "proposal_sent"
                                    ? "bg-[#150f00] text-[#fbbf24] border-[rgba(245,158,11,0.3)] hover:border-[rgba(245,158,11,0.5)]"
                                    : lead.status === "converted"
                                      ? "bg-[#051505] text-[#4ade80] border-[rgba(34,197,94,0.3)] hover:border-[rgba(34,197,94,0.5)]"
                                      : "bg-[#150505] text-[#f87171] border-[rgba(239,68,68,0.3)] hover:border-[rgba(239,68,68,0.5)]"
                            }`}
                          >
                            <option value="new">Novo</option>
                            <option value="contacted">Contatado</option>
                            <option value="proposal_sent">Proposta</option>
                            <option value="converted">Convertido</option>
                            <option value="no_interest">Sem interesse</option>
                          </select>
                          {lead.status === "contacted" && lead.contacted_at && (
                            <span className="text-[9px] text-[#60a5fa] font-mono font-semibold">
                              🔑 {new Date(lead.contacted_at).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {lead.category ? (
                          <span className="badge badge-purple">{lead.category}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="text-gray-400 font-medium">{lead.city || "—"}</td>
                      <td className="text-gray-400 font-medium font-mono text-xs">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setShowEditModal(true);
                          }}
                          className="p-1 hover:text-white text-gray-500 transition-colors inline-block cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 hover:text-red-500 text-gray-500 transition-colors inline-block cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500 text-sm">
                      Nenhum lead encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f0f1a] border border-[rgba(139,69,212,0.22)] rounded-xl overflow-hidden shadow-glow-sm">
            <header className="px-6 py-4 border-b border-[rgba(139,69,212,0.12)] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {editingLead ? "Editar Lead" : "Novo Lead"}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveLead} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingLead?.name || ""}
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingLead?.phone || ""}
                    placeholder="Ex: 5511999999999"
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingLead?.email || ""}
                    placeholder="contato@email.com"
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingLead?.category || ""}
                    placeholder="Ex: Odontologia"
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={editingLead?.city || ""}
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Estado (UF)</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={editingLead?.state || ""}
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                  <select name="status" defaultValue={editingLead?.status || "new"} className="input">
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="proposal_sent">Proposta Enviada</option>
                    <option value="converted">Convertido</option>
                    <option value="no_interest">Sem interesse</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="@perfil"
                    defaultValue={editingLead?.instagram || ""}
                    className="input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Data de Contato</label>
                  <input
                    type="date"
                    name="contacted_at"
                    defaultValue={editingLead?.contacted_at ? new Date(editingLead.contacted_at).toISOString().split('T')[0] : ""}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Observações / Notas</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingLead?.notes || ""}
                  className="input"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(139,69,212,0.12)]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary text-xs uppercase"
                >
                  {modalLoading ? "Salvando..." : "Salvar Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0f1a] border border-[rgba(139,69,212,0.22)] rounded-xl overflow-hidden shadow-glow-sm">
            <header className="px-6 py-4 border-b border-[rgba(139,69,212,0.12)] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Importar Leads de Excel</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Suba sua lista de prospecção em formato Excel (.xlsx ou .csv). Os contatos serão adicionados diretamente ao seu funil do CRM.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="text-white hover:underline text-xs flex items-center space-x-1.5 font-semibold bg-transparent border-0 cursor-pointer p-0"
                >
                  <span>📥 Baixar Planilha Modelo</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-[rgba(139,69,212,0.15)] bg-[#141426]/50 rounded-xl p-6 text-center hover:border-[#a855f7]/50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImportExcel}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileUp className="w-8 h-8 text-gray-500 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                <span className="text-xs font-semibold text-gray-300 block">
                  {importFile ? importFile.name : "Clique para selecionar ou arraste o arquivo"}
                </span>
                <span className="text-[10px] text-gray-500 mt-1 block">XLSX, XLS ou CSV</span>
              </div>

              {importResult && (
                <div className="p-4 bg-[#050508] border border-[rgba(139,69,212,0.15)] rounded-lg text-xs space-y-1">
                  <div className="text-white font-bold">Resumo da Importação:</div>
                  <div className="text-gray-400">Total na planilha: {importResult.total}</div>
                  <div className="text-green-500 font-semibold">Importados com sucesso: {importResult.imported}</div>
                  {importResult.limitReached && (
                    <div className="text-yellow-500 font-bold mt-1">
                      ⚠️ Limite de cota atingido! Alguns registros não foram importados. Faça upgrade de plano.
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(139,69,212,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                  className="btn-secondary text-xs uppercase"
                >
                  Fechar
                </button>
                <button
                  onClick={executeImport}
                  disabled={!importFile || importLoading}
                  className="btn-primary text-xs uppercase flex items-center space-x-2 justify-center"
                >
                  <span>{importLoading ? "Processando..." : "Confirmar Importação"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
