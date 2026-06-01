"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  HelpCircle,
  Database,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  FileSpreadsheet,
  FileUp,
  X,
  MessageSquare,
  Search
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatPhone } from "@repo/utils";

export default function CRMPage() {
  const [profile, setProfile] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Selected leads for batch actions
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Edit / Add Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Available categories & sources in results for filters
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

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
          // Fetch leads for user
          const { data: userLeads, error } = await (supabase.from("user_leads") as any)
            .select("*")
            .eq("user_id", prof.id)
            .order("created_at", { ascending: false });

          if (!error && userLeads) {
            setLeads(userLeads);
            
            // Extract unique categories and sources for filters
            const cats = Array.from(new Set(userLeads.map((l: any) => l.category).filter(Boolean)));
            const srcs = Array.from(new Set(userLeads.map((l: any) => l.source_type).filter(Boolean)));
            setCategories(cats as string[]);
            setSources(srcs as string[]);
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

          // Check cota
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

          // Map Excel columns to database fields
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
            const notas = getVal(["notas", "notes", "observacao", "observacoes"]);

            return {
              user_id: profile.id,
              name: nome,
              phone: telefone,
              email: email,
              category: categoria,
              city: cidade,
              state: estado,
              status: status,
              notes: notas,
              source_type: "import" as const
            };
          });

          // Insert into user_leads
          const { data: inserted, error: insertErr } = await (supabase.from("user_leads") as any)
            .insert(leadsToInsert)
            .select();

          if (insertErr) throw insertErr;

          // Update profiles leads used
          const newUsed = profile.leads_used_this_cycle + leadsToInsert.length;
          const { error: profileErr } = await (supabase.from("profiles") as any)
            .update({ leads_used_this_cycle: newUsed })
            .eq("id", profile.id);

          if (profileErr) throw profileErr;

          // Update local state
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

  const handleInlineStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await (supabase.from("user_leads") as any)
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
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
    };

    try {
      if (editingLead?.id) {
        // Update
        const { error } = await (supabase.from("user_leads") as any)
          .update(leadData)
          .eq("id", editingLead.id);
        if (error) throw error;

        setLeads(leads.map((l) => (l.id === editingLead.id ? { ...l, ...leadData } : l)));
        alert("Lead atualizado com sucesso.");
      } else {
        // Create
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

  // Metrics summary
  const totalLeads = leads.length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const proposalCount = leads.filter((l) => l.status === "proposal_sent").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;
  const noInterestCount = leads.filter((l) => l.status === "no_interest").length;

  // Filtered results
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.phone && l.phone.includes(searchQuery)) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || l.category === categoryFilter;
    const matchesSource = sourceFilter === "all" || l.source_type === sourceFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSource;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total leads", value: totalLeads, bg: "bg-[#111]" },
            { label: "Contatados", value: contactedCount, bg: "bg-[#111] border-l-2 border-yellow-500" },
            { label: "Proposta Enviada", value: proposalCount, bg: "bg-[#111] border-l-2 border-blue-500" },
            { label: "Convertidos", value: convertedCount, bg: "bg-[#111] border-l-2 border-green-500" },
            { label: "Sem interesse", value: noInterestCount, bg: "bg-[#111] border-l-2 border-red-500" },
          ].map((m) => (
            <div key={m.label} className={`premium-card p-4 flex flex-col justify-center ${m.bg}`}>
              <span className="text-2xl font-bold text-white tracking-wider">{m.value}</span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Toolbar & Filters */}
        <div className="premium-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="premium-input pl-9 w-full"
              />
            </div>

            {/* Filters toggle */}
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="premium-input py-1 text-xs"
              >
                <option value="all">Todos os Status</option>
                <option value="new">Novo</option>
                <option value="contacted">Contatado</option>
                <option value="proposal_sent">Proposta Enviada</option>
                <option value="converted">Convertido</option>
                <option value="no_interest">Sem interesse</option>
              </select>

              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="premium-input py-1 text-xs"
                >
                  <option value="all">Todas Categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditingLead(null);
                setShowEditModal(true);
              }}
              className="premium-button-primary flex items-center space-x-2 text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lead</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="premium-button-secondary flex items-center space-x-2 text-xs uppercase"
            >
              <FileUp className="w-4 h-4" />
              <span>Importar Excel</span>
            </button>
            <button
              onClick={handleExport}
              className="premium-button-secondary flex items-center space-x-2 text-xs uppercase"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Categoria</th>
                  <th>Cidade/Bairro</th>
                  <th className="w-[100px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="font-semibold text-white">{lead.name}</td>
                      <td>
                        <div className="flex flex-col text-xs space-y-0.5">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="hover:underline">
                              {formatPhone(lead.phone)}
                            </a>
                          )}
                          {lead.email && <span className="text-gray-500">{lead.email}</span>}
                        </div>
                      </td>
                      <td>
                        <select
                          value={lead.status}
                          onChange={(e) => handleInlineStatusChange(lead.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border font-semibold outline-none cursor-pointer ${
                            lead.status === "new"
                              ? "bg-gray-950/40 text-gray-400 border-gray-800"
                              : lead.status === "contacted"
                                ? "bg-yellow-950/20 text-yellow-500 border-yellow-500/20"
                                : lead.status === "proposal_sent"
                                  ? "bg-blue-950/20 text-blue-500 border-blue-500/20"
                                  : lead.status === "converted"
                                    ? "bg-green-950/20 text-green-500 border-green-500/20"
                                    : "bg-red-950/20 text-red-500 border-red-500/20"
                          }`}
                        >
                          <option value="new">Novo</option>
                          <option value="contacted">Contatado</option>
                          <option value="proposal_sent">Proposta Enviada</option>
                          <option value="converted">Convertido</option>
                          <option value="no_interest">Sem interesse</option>
                        </select>
                      </td>
                      <td>{lead.category || "—"}</td>
                      <td>{lead.city || "—"}</td>
                      <td className="text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setShowEditModal(true);
                          }}
                          className="p-1 hover:text-white text-gray-500 transition-colors inline-block"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 hover:text-red-500 text-gray-500 transition-colors inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {editingLead ? "Editar Lead" : "Novo Lead"}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
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
                    className="premium-input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingLead?.phone || ""}
                    placeholder="Ex: 5511999999999"
                    className="premium-input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingLead?.email || ""}
                    placeholder="contato@email.com"
                    className="premium-input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingLead?.category || ""}
                    placeholder="Ex: Odontologia"
                    className="premium-input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={editingLead?.city || ""}
                    className="premium-input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Estado (UF)</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={editingLead?.state || ""}
                    className="premium-input"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                  <select name="status" defaultValue={editingLead?.status || "new"} className="premium-input">
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
                    className="premium-input"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Observações / Notas</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingLead?.notes || ""}
                  className="premium-input"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="premium-button-secondary text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="premium-button-primary text-xs uppercase"
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
          <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Importar Leads de Excel</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                className="text-gray-500 hover:text-white transition-colors"
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

              <div className="border-2 border-dashed border-[#222] rounded-xl p-6 text-center hover:border-gray-600 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImportExcel}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileUp className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="text-xs font-semibold text-gray-300 block">
                  {importFile ? importFile.name : "Clique para selecionar ou arraste o arquivo"}
                </span>
                <span className="text-[10px] text-gray-500 mt-1 block">XLSX, XLS ou CSV</span>
              </div>

              {importResult && (
                <div className="p-4 bg-[#161616] border border-[#222] rounded-lg text-xs space-y-1">
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                  className="premium-button-secondary text-xs uppercase"
                >
                  Fechar
                </button>
                <button
                  onClick={executeImport}
                  disabled={!importFile || importLoading}
                  className="premium-button-primary text-xs uppercase flex items-center space-x-2"
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
