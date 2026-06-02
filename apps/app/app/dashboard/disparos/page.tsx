"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  Send,
  AlertTriangle,
  QrCode,
  CheckCircle,
  Plus,
  Trash2,
  HelpCircle,
  MessageSquare
} from "lucide-react";

interface Step {
  id: string;
  type: "message" | "trigger" | "wait";
  messageText: string;
  messageType: "text" | "image" | "file";
  mediaUrl: string;
  triggerKeyword: string;
  triggerType: "exact" | "contains" | "context";
  statusAfterSend: string;
  waitMinutes: number;
}

export default function DisparosPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // API Selection
  const [apiType, setApiType] = useState<"unofficial" | "official">("unofficial");

  // WhatsApp connection states
  const [instanceStatus, setInstanceStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Broadcast configuration
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [limitCount, setLimitCount] = useState("50");
  const [targetLeadsCount, setTargetLeadsCount] = useState(0);

  // Step builder
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "1",
      type: "message",
      messageText: "Olá {{nome}}! Tudo bem?",
      messageType: "text",
      mediaUrl: "",
      triggerKeyword: "",
      triggerType: "contains",
      statusAfterSend: "contacted",
      waitMinutes: 0,
    },
  ]);

  // Flows and Jobs database state
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string>("");
  const [flowName, setFlowName] = useState<string>("Fluxo de Disparo Padrão");
  const [savingFlow, setSavingFlow] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  // Chatwoot integration (Official API)
  const [chatwootConnected, setChatwootConnected] = useState(false);
  const [chatwootUrl, setChatwootUrl] = useState("");
  const [inboxes, setInboxes] = useState<string[]>([]);
  const [selectedInbox, setSelectedInbox] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await (supabase.from("profiles") as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);

        if (prof) {
          setInstanceStatus(prof.uazapi_instance_status || "disconnected");
          setQrCodeUrl(prof.uazapi_qr_code || null);
          setChatwootConnected(!!prof.chatwoot_account_id);
          setChatwootUrl(prof.chatwoot_url || "");
        }
      }
      setLoading(false);
    };
    loadProfileData();
  }, []);

  // Fetch categories, flows and jobs
  useEffect(() => {
    if (!profile) return;
    const loadDashboardData = async () => {
      // 1. Fetch categories
      const { data: leadsData } = await (supabase.from("user_leads") as any)
        .select("category")
        .eq("user_id", profile.id);
      if (leadsData) {
        const unique = Array.from(new Set(leadsData.map((x: any) => x.category).filter(Boolean)));
        setCategories(unique as string[]);
      }

      // 2. Fetch flows
      const { data: flowsData } = await (supabase.from("dispatch_flows") as any)
        .select("*")
        .eq("user_id", profile.id);
      setFlows(flowsData || []);

      if (flowsData && flowsData.length > 0) {
        setSelectedFlowId(flowsData[0].id);
        setFlowName(flowsData[0].name);
        setApiType(flowsData[0].api_type);
      } else {
        setSelectedFlowId("");
        setFlowName("Fluxo de Disparo Padrão");
      }

      // 3. Fetch jobs
      const { data: jobsData } = await (supabase.from("dispatch_jobs") as any)
        .select("*, dispatch_flows(name)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      setJobs(jobsData || []);
    };
    loadDashboardData();
  }, [profile]);

  // Load steps when selectedFlowId changes
  useEffect(() => {
    if (!selectedFlowId) {
      setSteps([
        {
          id: "1",
          type: "message",
          messageText: "Olá {{nome}}! Tudo bem?",
          messageType: "text",
          mediaUrl: "",
          triggerKeyword: "",
          triggerType: "contains",
          statusAfterSend: "contacted",
          waitMinutes: 0,
        },
      ]);
      setFlowName("Fluxo de Disparo Padrão");
      return;
    }

    const fetchSteps = async () => {
      const { data: stepsData } = await (supabase.from("dispatch_steps") as any)
        .select("*")
        .eq("flow_id", selectedFlowId)
        .order("position", { ascending: true });

      if (stepsData && stepsData.length > 0) {
        setSteps(stepsData.map((s: any) => ({
          id: s.id,
          type: s.type,
          messageText: s.message_text || "",
          messageType: s.message_type || "text",
          mediaUrl: s.media_url || "",
          triggerKeyword: s.trigger_keyword || "",
          triggerType: s.trigger_type || "contains",
          statusAfterSend: s.status_after_send || "contacted",
          waitMinutes: s.wait_minutes || 0,
        })));
        const selected = flows.find(f => f.id === selectedFlowId);
        if (selected) {
          setFlowName(selected.name);
          setApiType(selected.api_type);
        }
      }
    };
    fetchSteps();
  }, [selectedFlowId, flows]);

  const handleSaveFlow = async () => {
    if (!profile) return;
    if (!flowName.trim()) {
      alert("Por favor, digite um nome para o fluxo.");
      return;
    }

    setSavingFlow(true);
    try {
      let flowId = selectedFlowId;

      const flowPayload = {
        user_id: profile.id,
        name: flowName.trim(),
        api_type: apiType,
        is_active: true,
        whatsapp_instance_id: profile.uazapi_instance_id || null,
        chatwoot_inbox_id: selectedInbox || null
      };

      if (flowId) {
        // Update flow
        const { error } = await (supabase.from("dispatch_flows") as any)
          .update(flowPayload)
          .eq("id", flowId);
        if (error) throw error;
      } else {
        // Create flow
        const { data, error } = await (supabase.from("dispatch_flows") as any)
          .insert([flowPayload])
          .select()
          .single();
        if (error) throw error;
        flowId = data.id;
        setSelectedFlowId(flowId);
        setFlows([...flows, data]);
      }

      // Delete existing steps
      const { error: delErr } = await (supabase.from("dispatch_steps") as any)
        .delete()
        .eq("flow_id", flowId);
      if (delErr) throw delErr;

      // Insert new steps
      const stepsPayload = steps.map((step, idx) => ({
        flow_id: flowId,
        position: idx,
        type: step.type,
        message_text: step.messageText || null,
        message_type: step.messageType || "text",
        media_url: step.mediaUrl || null,
        trigger_keyword: step.triggerKeyword || null,
        trigger_type: step.triggerType || "contains",
        status_after_send: step.statusAfterSend || "contacted",
        wait_minutes: step.waitMinutes || null
      }));

      const { error: insErr } = await (supabase.from("dispatch_steps") as any)
        .insert(stepsPayload);
      if (insErr) throw insErr;

      alert("Fluxo salvo com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar fluxo: " + err.message);
    } finally {
      setSavingFlow(false);
    }
  };

  // Recalculate target leads on filter change
  useEffect(() => {
    const calculateLeads = async () => {
      if (!profile) return;
      let query = (supabase
        .from("user_leads") as any)
        .select("id", { count: "exact" })
        .eq("user_id", profile.id);

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }

      const { count } = await query;
      const parsedLimit = parseInt(limitCount);
      setTargetLeadsCount(Math.min(count || 0, isNaN(parsedLimit) ? 0 : parsedLimit));
    };
    calculateLeads();
  }, [profile, filterStatus, filterCategory, limitCount]);

  const handleConnectWhatsApp = async () => {
    setInstanceStatus("connecting");
    // Simulate loading QR Code
    setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LEADPLUZ-Uazapi-Connection-Simulation");

    // Simulate polling connection scan after 8 seconds
    setTimeout(async () => {
      if (!profile) return;
      try {
        const { error } = await (supabase
          .from("profiles") as any)
          .update({
            uazapi_instance_status: "connected",
            uazapi_instance_id: "inst_" + Math.floor(Math.random() * 10000)
          })
          .eq("id", profile.id);

        if (error) throw error;
        setInstanceStatus("connected");
        setQrCodeUrl(null);
      } catch (err: any) {
        console.error("Erro ao conectar:", err.message);
      }
    }, 8000);
  };

  const handleDisconnectWhatsApp = async () => {
    if (!profile) return;
    try {
      const { error } = await (supabase
        .from("profiles") as any)
        .update({
          uazapi_instance_status: "disconnected",
          uazapi_instance_id: null,
          uazapi_qr_code: null
        })
        .eq("id", profile.id);

      if (error) throw error;
      setInstanceStatus("disconnected");
      setQrCodeUrl(null);
    } catch (err: any) {
      alert("Erro ao desconectar: " + err.message);
    }
  };

  const handleAddStep = () => {
    const newStep: Step = {
      id: String(steps.length + 1),
      type: "trigger",
      messageText: "Olá! Como podemos ajudar?",
      messageType: "text",
      mediaUrl: "",
      triggerKeyword: "Quero saber mais",
      triggerType: "contains",
      statusAfterSend: "proposal_sent",
      waitMinutes: 0,
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleStartBroadcast = async () => {
    if (instanceStatus !== "connected" && apiType === "unofficial") {
      alert("Por favor, conecte o WhatsApp antes de iniciar o disparo.");
      return;
    }
    if (targetLeadsCount === 0) {
      alert("Nenhum lead selecionado para receber os disparos.");
      return;
    }
    if (!selectedFlowId) {
      alert("Por favor, salve o fluxo antes de iniciar os disparos.");
      return;
    }

    try {
      // 1. Insert dispatch_jobs
      const { data: job, error: jobErr } = await (supabase.from("dispatch_jobs") as any)
        .insert([{
          user_id: profile.id,
          flow_id: selectedFlowId,
          status: "pending",
          total_leads: targetLeadsCount,
          sent_count: 0,
          failed_count: 0,
          filter_status: filterStatus,
          filter_category: filterCategory,
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (jobErr) throw jobErr;

      // 2. Fetch targeted leads
      let query = (supabase.from("user_leads") as any)
        .select("id")
        .eq("user_id", profile.id);

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }
      const limitVal = parseInt(limitCount);
      if (!isNaN(limitVal)) {
        query = query.limit(limitVal);
      }

      const { data: targetLeads, error: leadsErr } = await query;
      if (leadsErr) throw leadsErr;

      // 3. Insert lead jobs
      if (targetLeads && targetLeads.length > 0) {
        const leadJobs = targetLeads.map((l: any) => ({
          job_id: job.id,
          user_lead_id: l.id,
          status: "pending" as const
        }));
        
        const { error: ljErr } = await (supabase.from("dispatch_lead_jobs") as any)
          .insert(leadJobs);
        if (ljErr) throw ljErr;
      }

      // 4. Update local jobs state
      const jobWithFlowName = {
        ...job,
        dispatch_flows: { name: flowName }
      };
      setJobs([jobWithFlowName, ...jobs]);

      alert("Disparo iniciado com sucesso! As mensagens serão processadas em segundo plano pelo n8n.");
    } catch (err: any) {
      alert("Erro ao iniciar disparo: " + err.message);
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
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Selector Header */}
        <div className="premium-card p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interface de Disparos:</span>
          <div className="flex space-x-2">
            {(["unofficial", "official"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setApiType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-150 ${
                  apiType === type
                    ? "bg-white text-black border-white"
                    : "bg-[#111] text-gray-400 border-[#222] hover:text-white"
                }`}
              >
                {type === "unofficial" ? "WhatsApp Não Oficial (Uazapi)" : "WhatsApp Oficial (Meta / Chatwoot)"}
              </button>
            ))}
          </div>
        </div>

        {/* Unofficial API section */}
        {apiType === "unofficial" && (
          <div className="space-y-6">
            {/* Warning block */}
            <div className="flex items-start space-x-3 p-4 bg-yellow-950/20 border border-yellow-500/30 rounded-xl text-yellow-500 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>Atenção:</strong> Disparos via API não oficial correm risco de banimento permanente do número. Recomendamos usar a API Oficial ou limitar a no máximo 50 mensagens por dia.
              </div>
            </div>

            {/* Connection panel */}
            <div className="premium-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-white tracking-wider">Conexão do WhatsApp</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Status atual:</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                      instanceStatus === "connected"
                        ? "bg-green-950/20 text-green-500 border border-green-500/20"
                        : instanceStatus === "connecting"
                          ? "bg-yellow-950/20 text-yellow-500 border border-yellow-500/20 animate-pulse"
                          : "bg-red-950/20 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {instanceStatus === "connected"
                      ? "Conectado"
                      : instanceStatus === "connecting"
                        ? "Carregando QR..."
                        : "Desconectado"}
                  </span>
                </div>
              </div>

              <div>
                {instanceStatus === "disconnected" && (
                  <button onClick={handleConnectWhatsApp} className="premium-button-primary uppercase text-xs">
                    Conectar WhatsApp
                  </button>
                )}
                {instanceStatus === "connecting" && qrCodeUrl && (
                  <div className="flex flex-col items-center space-y-2 bg-white p-4 rounded-xl">
                    <img src={qrCodeUrl} alt="QR Code" className="w-[200px] h-[200px]" />
                    <span className="text-[10px] text-black font-semibold">Escaneie com seu WhatsApp</span>
                  </div>
                )}
                {instanceStatus === "connected" && (
                  <button onClick={handleDisconnectWhatsApp} className="premium-button-secondary uppercase text-xs">
                    Desconectar Número
                  </button>
                )}
              </div>
            </div>

            {/* Target selection */}
            <div className="premium-card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">Público do Disparo</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Por Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="premium-input text-xs"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="proposal_sent">Proposta Enviada</option>
                    <option value="converted">Convertido</option>
                    <option value="no_interest">Sem interesse</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Por Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="premium-input text-xs"
                  >
                    <option value="all">Todas as Categorias</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Quantidade Limite</label>
                  <input
                    type="number"
                    value={limitCount}
                    onChange={(e) => setLimitCount(e.target.value)}
                    className="premium-input text-xs"
                  />
                </div>
                <div className="flex flex-col justify-end p-2 bg-[#161616] border border-[#222] rounded-lg text-center">
                  <span className="text-xs text-gray-400">Total Leads no Preview</span>
                  <span className="text-lg font-bold text-white mt-1">{targetLeadsCount} Leads</span>
                </div>
              </div>
            </div>

            {/* Step builder */}
            <div className="premium-card p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Selecionar ou Criar Fluxo</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedFlowId}
                      onChange={(e) => setSelectedFlowId(e.target.value)}
                      className="premium-input text-xs max-w-xs"
                    >
                      <option value="">+ Criar Novo Fluxo</option>
                      {flows.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Nome do fluxo..."
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      className="premium-input text-xs max-w-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSaveFlow}
                      disabled={savingFlow}
                      className="premium-button-secondary text-xs uppercase"
                    >
                      {savingFlow ? "Salvando..." : "Salvar Fluxo"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="premium-button-secondary flex items-center space-x-2 text-xs uppercase self-end"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Etapa</span>
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={step.id} className="p-4 bg-[#161616] border border-[#222] rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase">Etapa {idx + 1}</span>
                      {idx > 0 && (
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="text-red-500 hover:text-red-400 text-xs"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    {step.type === "trigger" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">
                            Tipo de Validação do Gatilho
                          </label>
                          <select
                            value={step.triggerType || "contains"}
                            onChange={(e) => {
                              const updated = [...steps];
                              const s = updated[idx];
                              if (s) {
                                s.triggerType = e.target.value as any;
                                setSteps(updated);
                              }
                            }}
                            className="premium-input text-xs"
                          >
                            <option value="contains">Se Contém a palavra</option>
                            <option value="exact">Palavra Exata</option>
                            <option value="context">Pelo Contexto (Inteligência Artificial)</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">
                            {step.triggerType === "context" ? "Intenção/Contexto Esperado" : "Palavra-Chave / Gatilho"}
                          </label>
                          <input
                            type="text"
                            placeholder={step.triggerType === "context" ? "Ex: Demonstrou interesse, Tirar dúvida..." : "Quero saber mais, preço, info"}
                            value={step.triggerKeyword}
                            onChange={(e) => {
                              const updated = [...steps];
                              const s = updated[idx];
                              if (s) {
                                s.triggerKeyword = e.target.value;
                                setSteps(updated);
                              }
                            }}
                            className="premium-input text-xs"
                          />
                        </div>

                        {step.triggerType === "context" && (
                          <div className="md:col-span-2 text-[10px] text-yellow-500 bg-yellow-950/20 border border-yellow-500/20 p-2 rounded-lg leading-relaxed flex items-center space-x-2">
                            <span className="font-semibold">⚠️ Nota:</span>
                            <span>A Inteligência Artificial analisará a resposta livre do cliente para inferir essa intenção. *Aviso: a IA pode cometer erros de interpretação.*</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Mensagem a Enviar</label>
                      <textarea
                        rows={3}
                        value={step.messageText}
                        onChange={(e) => {
                          const updated = [...steps];
                          const s = updated[idx];
                          if (s) {
                            s.messageText = e.target.value;
                            setSteps(updated);
                          }
                        }}
                        className="premium-input text-xs"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                          Alterar status do lead para
                        </label>
                        <select
                          value={step.statusAfterSend}
                          onChange={(e) => {
                            const updated = [...steps];
                            const s = updated[idx];
                            if (s) {
                              s.statusAfterSend = e.target.value;
                              setSteps(updated);
                            }
                          }}
                          className="premium-input text-xs"
                        >
                          <option value="new">Novo</option>
                          <option value="contacted">Contatado</option>
                          <option value="proposal_sent">Proposta Enviada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-[#222]">
                <div className="text-[10px] text-gray-400 max-w-md leading-normal flex items-center space-x-1.5 bg-[#161616] p-2 rounded-lg border border-[#222]">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                  <span>Atenção: A interpretação contextual e classificação de leads por Inteligência Artificial é automatizada. A IA pode cometer erros de interpretação.</span>
                </div>
                <button
                  onClick={handleStartBroadcast}
                  className="premium-button-primary flex items-center space-x-2 text-xs uppercase"
                >
                  <Send className="w-4 h-4" />
                  <span>Iniciar Disparo</span>
                </button>
              </div>
            </div>

            {/* Histórico de Disparos */}
            <div className="premium-card p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">Histórico de Disparos</h3>
              {jobs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Nenhum disparo realizado anteriormente.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Fluxo</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Filtros</th>
                        <th>Envios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td className="font-semibold text-white">{job.dispatch_flows?.name || "Fluxo Excluído"}</td>
                          <td className="text-xs text-gray-400">
                            {new Date(job.created_at).toLocaleDateString("pt-BR")} {new Date(job.created_at).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                                job.status === "completed"
                                  ? "bg-green-950/20 text-green-500 border border-green-500/20"
                                  : job.status === "running"
                                    ? "bg-blue-950/20 text-blue-500 border border-blue-500/20 animate-pulse"
                                    : job.status === "pending"
                                      ? "bg-yellow-950/20 text-yellow-500 border border-yellow-500/20"
                                      : "bg-red-950/20 text-red-500 border border-red-500/20"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="text-xs text-gray-500">
                            Status: {job.filter_status || "Todos"} | Cat: {job.filter_category || "Todas"}
                          </td>
                          <td className="text-xs text-white">
                            {job.sent_count} / {job.total_leads}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official API section (Disabled/Ultra Plan demo) */}
        {apiType === "official" && (
          <div className="premium-card p-12 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl">💼</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Disparos via API Oficial</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Os disparos de API Oficial exigem integração com o Meta Cloud API e conta Chatwoot (Plano Ultra).
            </p>
            {profile?.plan !== "ultra" && (
              <div className="text-[10px] text-yellow-500 bg-yellow-950/20 border border-yellow-500/20 px-4 py-2 rounded-lg font-bold uppercase tracking-wider mt-4">
                Disponível apenas no plano Ultra
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
