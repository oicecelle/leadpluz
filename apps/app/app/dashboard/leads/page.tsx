"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import { Search, HelpCircle, FileDown, Trash2, Check, Info, AlertTriangle, X, Bolt } from "lucide-react";
import * as XLSX from "xlsx";

export default function LeadsSearchPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  
  // Chip input lists
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [locationList, setLocationList] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");

  const [keywords, setKeywords] = useState("");
  const [locations, setLocations] = useState("");
  const [source, setSource] = useState<"google" | "instagram" | "tiktok">("google");
  
  // Filters
  const [phoneRequired, setPhoneRequired] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await (supabase.from("profiles") as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);
      }
    };
    loadProfile();
  }, []);

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = keywordInput.trim().replace(/,/g, "");
      if (val && !keywordList.includes(val)) {
        setKeywordList([...keywordList, val]);
      }
      setKeywordInput("");
    }
  };

  const removeKeywordChip = (chip: string) => {
    setKeywordList(keywordList.filter((k) => k !== chip));
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = locationInput.trim().replace(/,/g, "");
      if (val && !locationList.includes(val)) {
        setLocationList([...locationList, val]);
      }
      setLocationInput("");
    }
  };

  const removeLocationChip = (chip: string) => {
    setLocationList(locationList.filter((l) => l !== chip));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let finalKeywords = [...keywordList];
    if (keywordInput.trim()) {
      finalKeywords.push(keywordInput.trim());
    }

    let finalLocations = [...locationList];
    if (locationInput.trim()) {
      finalLocations.push(locationInput.trim());
    }

    if (finalKeywords.length === 0) {
      alert("Por favor, digite pelo menos uma palavra-chave.");
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedLeads([]);
    setPage(1);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: profile.id,
          keywords: finalKeywords,
          locations: source === "google" ? (finalLocations.length > 0 ? finalLocations : ["Brasil"]) : ["Brasil"],
          source,
          filters: {
            phoneRequired,
            emailRequired,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        if (data.code === "BALANCE_EXHAUSTED") {
          setUpgradeMsg("Seu saldo de leads acabou! Faça upgrade para continuar buscando.");
          setShowUpgradeModal(true);
        } else {
          alert(data.error);
        }
        return;
      }

      const leads = data.leads || [];
      setResults(leads);

      if (leads.length === 0 && !data.error) {
        const filtersActive = phoneRequired || emailRequired;
        const filterMsg = filtersActive
          ? " Os filtros de campo obrigatório podem ter excluído todos os resultados disponíveis."
          : "";
        const msg = data.message
          ? data.message + filterMsg
          : `Nenhum lead encontrado para essa busca.${filterMsg}`;
        alert(msg);
      }

      if (data.limitReached) {
        setUpgradeMsg(
          `Sua busca retornou ${data.totalFound} resultados, mas seu plano tem apenas ${profile.leads_limit - profile.leads_used_this_cycle} leads disponíveis este mês. Foram adicionados os primeiros ${data.addedCount} resultados. Faça upgrade para ver todos.`
        );
        setShowUpgradeModal(true);
      }

      const { data: updatedProf } = await (supabase.from("profiles") as any)
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();
      setProfile(updatedProf);
    } catch (err: any) {
      alert("Erro ao buscar leads: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(
      results.map((r) => ({
        Nome: r.name,
        Categoria: r.category || "",
        Cidade: r.city || "",
        Estado: r.state || "",
        Telefone: r.phone || "",
        Email: r.email || "",
        Instagram: r.instagram || "",
        Website: r.website || "",
        Data: new Date(r.created_at).toLocaleDateString("pt-BR"),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "leads_prospectados.xlsx");
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === results.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(results.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((x) => x !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir os ${selectedLeads.length} leads selecionados?`)) return;

    try {
      const { error } = await (supabase.from("user_leads") as any)
        .delete()
        .in("id", selectedLeads);

      if (error) throw error;

      setResults(results.filter((r) => !selectedLeads.includes(r.id)));
      setSelectedLeads([]);
      alert("Leads excluídos com sucesso.");
    } catch (err: any) {
      alert("Erro ao excluir leads: " + err.message);
    }
  };

  const totalPages = Math.ceil(results.length / perPage);
  const paginatedResults = results.slice((page - 1) * perPage, page * perPage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-[#a855f7]" />
              <span>Busca de Leads</span>
            </h1>
            <p className="text-xs text-gray-500">
              Encontre leads qualificados por palavra-chave e cidade com cache inteligente.
            </p>
          </div>
        </div>

        {/* Card de Busca */}
        <div className="card p-6 relative">
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Keywords Tag Chip Input */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Palavras-chave
                    </label>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                      <div className="hidden group-hover:block absolute z-10 w-64 bg-[#0f0f1a] border border-[rgba(139,69,212,0.22)] text-gray-400 text-xs p-3 rounded-lg shadow-glow-sm -left-20 top-6">
                        Digite um termo e pressione vírgula ou Enter. Ex: &quot;clínica estética&quot;, &quot;nail designer&quot;.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-[42px] bg-[#141426] border border-[rgba(255,255,255,0.06)] focus-within:border-[#8b45d4] focus-within:ring-3 focus-within:ring-[#6b2fb5]/15 rounded-lg p-1.5 flex flex-wrap gap-1.5 transition-all duration-150">
                  {keywordList.map((chip) => (
                    <div key={chip} className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-[rgba(139,69,212,0.15)] border border-[rgba(139,69,212,0.3)] text-purple-300 text-xs font-medium">
                      <span>{chip}</span>
                      <button
                        type="button"
                        onClick={() => removeKeywordChip(chip)}
                        className="text-purple-400 hover:text-purple-200 focus:outline-none ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder={keywordList.length === 0 ? "Ex: odontologia, pilates, advocacia..." : "Adicionar..."}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    className="flex-1 bg-transparent border-0 outline-none text-white text-xs px-1 min-w-[80px]"
                  />
                </div>
              </div>

              {/* Locations Tag Chip Input */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Cidades / Localização
                  </label>
                  {source !== "google" && (
                    <span className="text-[9px] text-[#fbbf24] font-semibold bg-yellow-950/20 px-1.5 py-0.5 rounded">
                      Não disponível para redes sociais
                    </span>
                  )}
                </div>

                <div className={`min-h-[42px] rounded-lg p-1.5 flex flex-wrap gap-1.5 transition-all duration-150 ${
                  source !== "google" 
                    ? "bg-[#141426]/40 opacity-40 cursor-not-allowed border border-[rgba(255,255,255,0.02)]" 
                    : "bg-[#141426] border border-[rgba(255,255,255,0.06)] focus-within:border-[#8b45d4] focus-within:ring-3 focus-within:ring-[#6b2fb5]/15"
                }`}>
                  {source === "google" && locationList.map((chip) => (
                    <div key={chip} className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-[rgba(139,69,212,0.15)] border border-[rgba(139,69,212,0.3)] text-purple-300 text-xs font-medium">
                      <span>{chip}</span>
                      <button
                        type="button"
                        onClick={() => removeLocationChip(chip)}
                        className="text-purple-400 hover:text-purple-200 focus:outline-none ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    disabled={source !== "google"}
                    placeholder={
                      source !== "google"
                        ? "Local desativado"
                        : locationList.length === 0
                          ? "Ex: São Paulo SP, Rio de Janeiro RJ..."
                          : "Adicionar..."
                    }
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={handleLocationKeyDown}
                    className="flex-1 bg-transparent border-0 outline-none text-white text-xs px-1 min-w-[80px] disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Divider gradiente roxo */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(139,69,212,0.22)] to-transparent"></div>

            {/* Source and Filters row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
              
              {/* Segmented Control - Pill Group */}
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Origem:</span>
                <div className="bg-[#141426] p-1 rounded-full border border-[rgba(255,255,255,0.06)] flex space-x-1">
                  {(["google", "instagram", "tiktok"] as const).map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        setSource(src);
                        if (src !== "google") {
                          setPhoneRequired(false);
                          setEmailRequired(false);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        source === src
                          ? "btn-primary shadow-glow-sm"
                          : "bg-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      {src === "google" ? "Google Maps" : src === "instagram" ? "Instagram" : "TikTok"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes Customizados */}
              {source === "google" && (
                <div className="flex flex-wrap items-center gap-6">
                  <div 
                    onClick={() => setPhoneRequired(!phoneRequired)}
                    className="flex items-center space-x-2.5 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      phoneRequired 
                        ? "bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] border-transparent" 
                        : "border-[rgba(139,69,212,0.3)] bg-transparent group-hover:border-[#8b45d4]"
                    }`}>
                      {phoneRequired && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </div>
                    <span className="text-xs text-gray-300 font-medium">Telefone Obrigatório</span>
                  </div>

                  <div 
                    onClick={() => setEmailRequired(!emailRequired)}
                    className="flex items-center space-x-2.5 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      emailRequired 
                        ? "bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] border-transparent" 
                        : "border-[rgba(139,69,212,0.3)] bg-transparent group-hover:border-[#8b45d4]"
                    }`}>
                      {emailRequired && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </div>
                    <span className="text-xs text-gray-300 font-medium">E-mail Obrigatório</span>
                  </div>
                </div>
              )}

              {/* Filter Warning - appears when phone or email required is checked */}
              {source === "google" && (phoneRequired || emailRequired) && (
                <div className="flex items-start space-x-2 text-xs text-[#fbbf24] bg-yellow-950/15 border border-yellow-500/20 px-3.5 py-2 rounded-lg max-w-md animate-in fade-in duration-200 w-full lg:w-auto">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Filtro ativo: leads sem
                    {phoneRequired && emailRequired
                      ? " telefone e e-mail"
                      : phoneRequired
                      ? " telefone"
                      : " e-mail"}
                    {" "}não serão exibidos nos resultados.
                  </span>
                </div>
              )}

              {/* Social Warning */}
              {source !== "google" && (
                <div className="flex items-center space-x-2 text-xs text-[#fbbf24] bg-yellow-950/15 border border-yellow-500/20 px-3.5 py-2 rounded-lg max-w-md animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>A busca no Instagram/TikTok retorna o @. Dados de contato não disponíveis.</span>
                </div>
              )}
            </div>

            {/* Aviso informativo e Botão */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3">
              {source === "google" ? (
                <div className="flex items-center space-x-2 text-[11px] text-purple-300 bg-[rgba(139,69,212,0.06)] border border-[rgba(139,69,212,0.15)] px-3 py-2 rounded-lg">
                  <Info className="w-4 h-4 text-[#c084fc] flex-shrink-0" />
                  <span>Resultados sujeitos à disponibilidade dos dados do Google.</span>
                </div>
              ) : (
                <div className="w-[10px] h-[10px]"></div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-glow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border border-t-white border-r-[#222]/30 border-b-[#222]/30 border-l-[#222]/30 rounded-full animate-spin"></div>
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar Leads</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results section */}
        {results.length > 0 && (
          <div className="card overflow-hidden">
            {/* Header / Actions toolbar */}
            <div className="p-4 border-b border-[rgba(139,69,212,0.12)] bg-[#0f0f1a]/85 flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs text-gray-500 font-medium">
                {selectedLeads.length} de <span className="text-white font-bold">{results.length}</span> leads selecionados
              </div>

              <div className="flex items-center space-x-2">
                {selectedLeads.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/25 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-bold uppercase transition-all duration-150 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir selecionados</span>
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="btn-secondary flex items-center space-x-2 text-xs py-1.5"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead className="bg-[#141426]">
                  <tr>
                    <th className="w-10">
                      <div 
                        onClick={toggleSelectAll}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                          selectedLeads.length === results.length
                            ? "bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] border-transparent" 
                            : "border-[rgba(139,69,212,0.3)] bg-transparent"
                        }`}
                      >
                        {selectedLeads.length === results.length && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                    </th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Cidade/Estado</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Instagram</th>
                    <th>Website</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[rgba(139,69,212,0.04)] transition-colors">
                      <td>
                        <div 
                          onClick={() => toggleSelectOne(lead.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                            selectedLeads.includes(lead.id)
                              ? "bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] border-transparent" 
                              : "border-[rgba(139,69,212,0.2)] bg-transparent"
                          }`}
                        >
                          {selectedLeads.includes(lead.id) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                        </div>
                      </td>
                      <td className="font-semibold text-white">{lead.name}</td>
                      <td>
                        {lead.category ? (
                          <span className="badge badge-purple">{lead.category}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {lead.city ? `${lead.city}, ${lead.state || "—"}` : "—"}
                      </td>
                      <td>
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="text-white hover:text-[#a855f7] hover:underline font-medium font-mono text-xs">
                            {lead.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-gray-400 hover:text-white hover:underline text-xs">
                            {lead.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {lead.instagram ? (
                          <a
                            href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white hover:underline text-xs"
                          >
                            {lead.instagram}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {lead.website ? (
                          <a
                            href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#c084fc] hover:text-[#a855f7] hover:underline text-xs font-semibold"
                          >
                            Site
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[rgba(139,69,212,0.12)] bg-[#0f0f1a] flex items-center justify-between">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-secondary text-xs uppercase disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Página <span className="text-white font-bold">{page}</span> de {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn-secondary text-xs uppercase disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <div className="card p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#141426] flex items-center justify-center text-gray-500">
              <Search className="w-6 h-6 text-gray-600" />
            </div>
            <div className="max-w-sm space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Encontre seus primeiros leads</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Digite uma palavra-chave e cidade acima para começar a prospectar e coletar dados.
              </p>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((x) => (
              <div key={x} className="card p-6 animate-pulse flex flex-col space-y-3">
                <div className="h-4 bg-[#141426] rounded w-1/4"></div>
                <div className="h-3 bg-[#141426] rounded w-1/2"></div>
                <div className="h-3 bg-[#141426] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade / Limit reached Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0f0f1a] border border-[#a855f7]/30 rounded-xl p-8 shadow-glow-md flex flex-col space-y-6 animate-in scale-in duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-950/50 border border-[#a855f7]/30 flex items-center justify-center">
                  <Bolt className="w-5 h-5 text-[#a855f7] fill-[#a855f7]" />
                </div>
                <h3 className="text-md font-bold text-white uppercase tracking-wider">Limite de Leads Atingido</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{upgradeMsg}</p>
              <div className="flex space-x-3 pt-2 border-t border-[rgba(139,69,212,0.12)]">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 btn-secondary uppercase text-xs"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    router.push("/dashboard/config");
                  }}
                  className="flex-1 btn-primary uppercase text-xs justify-center"
                >
                  Ver planos de upgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
