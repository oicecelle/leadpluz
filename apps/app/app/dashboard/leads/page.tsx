"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import { Search, HelpCircle, FileDown, Plus, Trash2, Send, Check } from "lucide-react";
import * as XLSX from "xlsx";

export default function LeadsSearchPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!keywords.trim()) {
      alert("Por favor, digite pelo menos uma palavra-chave.");
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedLeads([]);

    try {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      const locationList = locations
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

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
          keywords: keywordList,
          locations: locationList.length > 0 ? locationList : ["Brasil"],
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

      setResults(data.leads || []);
      if (data.limitReached) {
        setUpgradeMsg(
          `Sua busca retornou ${data.totalFound} resultados, mas seu plano tem apenas ${profile.leads_limit - profile.leads_used_this_cycle} leads disponíveis este mês. Foram adicionados os primeiros ${data.addedCount} resultados. Faça upgrade para ver todos.`
        );
        setShowUpgradeModal(true);
      }

      // Reload profile balance
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

  // Pagination logic
  const totalPages = Math.ceil(results.length / perPage);
  const paginatedResults = results.slice((page - 1) * perPage, page * perPage);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Form panel */}
        <div className="premium-card p-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Palavras-chave
                  </label>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                    <div className="hidden group-hover:block absolute z-10 w-64 bg-[#111] border border-[#333] text-gray-300 text-xs p-3 rounded-lg shadow-xl -left-20 top-6">
                      Use termos específicos para melhores resultados. Ex: &quot;clínica odontológica&quot;, &quot;nail designer&quot;, &quot;academia de musculação&quot;. Evite termos muito genéricos.
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  placeholder="odontologia, pilates, estética (separe por vírgula)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="premium-input"
                />
              </div>

              {/* Locations */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Locais
                  </label>
                  {source !== "google" && (
                    <span className="text-[10px] text-yellow-500 font-medium">
                      (Não disponível para redes sociais)
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={source !== "google"}
                  placeholder={
                    source === "google"
                      ? "São Paulo SP, Campinas SP (separe por vírgula)"
                      : "Busca local desativada para redes sociais"
                  }
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  className="premium-input disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Source and Filters row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-[#222]">
              {/* Source Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fonte:</span>
                <div className="flex space-x-2">
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
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-150 ${
                        source === src
                          ? "bg-white text-black border-white"
                          : "bg-[#111] text-gray-400 border-[#222] hover:text-white"
                      }`}
                    >
                      {src === "google" ? "Google Maps" : src === "instagram" ? "Instagram" : "TikTok"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes (Only for Google Maps) */}
              {source === "google" && (
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phoneRequired}
                      onChange={(e) => setPhoneRequired(e.target.checked)}
                      className="w-4 h-4 accent-white cursor-pointer"
                    />
                    <span>Telefone Obrigatório</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailRequired}
                      onChange={(e) => setEmailRequired(e.target.checked)}
                      className="w-4 h-4 accent-white cursor-pointer"
                    />
                    <span>E-mail Obrigatório</span>
                  </label>
                </div>
              )}

              {/* Social Warning */}
              {source !== "google" && (
                <div className="text-xs text-yellow-500 bg-yellow-950/20 border border-yellow-500/20 px-3 py-2 rounded-lg">
                  ⚠️ A busca no Instagram/TikTok retorna o @ do perfil. Dados de contato não estão disponíveis.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-gray-500 leading-normal max-w-md">
                A quantidade de resultados depende da disponibilidade de dados no Google para cada busca.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="premium-button-primary flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Buscando..." : "Buscar Leads"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results section */}
        {results.length > 0 && (
          <div className="premium-card overflow-hidden">
            {/* Header / Actions toolbar */}
            <div className="p-4 border-b border-[#222] bg-[#161616] flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs text-gray-400">
                {selectedLeads.length} de {results.length} leads selecionados
              </div>

              <div className="flex items-center space-x-2">
                {selectedLeads.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-950/30 border border-red-500/20 text-red-500 text-xs font-bold uppercase hover:bg-red-950/50 transition-all duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir selecionados</span>
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="premium-button-secondary flex items-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === results.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
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
                    <tr key={lead.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelectOne(lead.id)}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                      </td>
                      <td className="font-semibold text-white">{lead.name}</td>
                      <td>{lead.category || "—"}</td>
                      <td>
                        {lead.city ? `${lead.city}, ${lead.state || "—"}` : "—"}
                      </td>
                      <td>
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="text-white hover:underline">
                            {lead.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-white hover:underline text-xs">
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
                            className="text-white hover:underline text-xs"
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
                            className="text-white hover:underline text-xs"
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
              <div className="p-4 border-t border-[#222] bg-[#161616] flex items-center justify-between">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="premium-button-secondary text-xs uppercase disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-400">
                  Página {page} de {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="premium-button-secondary text-xs uppercase disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <div className="premium-card p-12 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl text-gray-600">🔍</span>
            <div className="max-w-sm space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nenhum lead carregado</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Preencha o formulário acima para realizar uma busca inteligente no Google Maps ou mídias sociais.
              </p>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((x) => (
              <div key={x} className="premium-card p-6 animate-pulse flex flex-col space-y-3">
                <div className="h-4 bg-[#222] rounded w-1/4"></div>
                <div className="h-3 bg-[#222] rounded w-1/2"></div>
                <div className="h-3 bg-[#222] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade / Limit reached Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-xl p-8 shadow-2xl flex flex-col space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Limite atingido</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{upgradeMsg}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 premium-button-secondary uppercase text-xs"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    router.push("/dashboard/config");
                  }}
                  className="flex-1 premium-button-primary uppercase text-xs"
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
