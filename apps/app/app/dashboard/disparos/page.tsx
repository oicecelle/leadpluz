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
  MessageSquare,
  Smartphone,
  Layers,
  ChevronRight,
  Info
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

  useEffect(() => {
    if (!profile) return;
    const loadDashboardData = async () => {
      const { data: leadsData } = await (supabase.from("user_leads") as any)
        .select("category")
        .eq("user_id", profile.id);
      if (leadsData) {
        const unique = Array.from(new Set(leadsData.map((x: any) => x.category).filter(Boolean)));
        setCategories(unique as string[]);
      }

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

      const { data: jobsData } = await (supabase.from("dispatch_jobs") as any)
        .select("*, dispatch_flows(name)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      setJobs(jobsData || []);
    };
    loadDashboardData();
  }, [profile]);

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
        const { error } = await (supabase.from("dispatch_flows") as any)
          .update(flowPayload)
          .eq("id", flowId);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase.from("dispatch_flows") as any)
          .insert([flowPayload])
          .select()
          .single();
        if (error) throw error;
        flowId = data.id;
        setSelectedFlowId(flowId);
        setFlows([...flows, data]);
      }

      const { error: delErr } = await (supabase.from("dispatch_steps") as any)
        .delete()
        .eq("flow_id", flowId);
      if (delErr) throw delErr;

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
    setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LEADPLUZ-Uazapi-Connection-Simulation");

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
        alert("Erro ao conectar: " + err.message);
        setInstanceStatus("disconnected");
        setQrCodeUrl(null);
      }
    }, 2000);
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
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-purple-500 border-r-purple-900/30 border-b-purple-900/30 border-l-purple-900/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl select-none">
        
        {/* Header de Configuração de API */}
        <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interface de Disparos:</span>
          
          <div className="bg-[#141426] p-1 rounded-full border border-[rgba(255,255,255,0.06)] flex space-x-1">
            {(["unofficial", "official"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setApiType(type)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  apiType === type
                    ? "btn-primary shadow-glow-sm"
                    : "bg-transparent text-gray-400 hover:text-white"
                }`}
              >
                {type === "unofficial" ? "WhatsApp Não Oficial" : "WhatsApp Oficial (API)"}
              </button>
            ))}
          </div>
        </div>

        {/* Unofficial API Panel */}
        {apiType === "unofficial" && (
          <div className="space-y-6">
            
            {/* Warning block */}
            <div className="flex items-start space-x-3 p-4 bg-yellow-950/15 border border-yellow-500/20 rounded-xl text-[#fbbf24] text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#fbbf24]" />
              <div>
                <strong className="font-bold">Atenção sobre API Não Oficial:</strong> Disparos via conexões não oficiais correm risco de banimento de número do WhatsApp. Recomendamos aquecer o chip e limitar o disparo diário a no máximo 50 mensagens.
              </div>
            </div>

            {/* Connection panel */}
            <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-[#a855f7]" />
                  <span>Conexão do WhatsApp (Instância Uazapi)</span>
                </h3>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs text-gray-500">Status do canal:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      instanceStatus === "connected"
                        ? "bg-[#4ade80] animate-pulse"
                        : instanceStatus === "connecting"
                          ? "bg-[#fbbf24] animate-pulse"
                          : "bg-[#f87171]"
                    }`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      instanceStatus === "connected"
                        ? "text-[#4ade80]"
                        : instanceStatus === "connecting"
                          ? "text-[#fbbf24]"
                          : "text-[#f87171]"
                    }`}>
                      {instanceStatus === "connected"
                        ? "Conectado"
                        : instanceStatus === "connecting"
                          ? "Gerando QR Code..."
                          : "Desconectado"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {instanceStatus === "disconnected" && (
                  <button 
                    onClick={handleConnectWhatsApp} 
                    className="btn-primary uppercase text-xs shadow-glow-sm cursor-pointer"
                  >
                    Conectar WhatsApp
                  </button>
                )}
                {instanceStatus === "connecting" && qrCodeUrl && (
                  <div className="flex flex-col items-center space-y-3 bg-white p-5 rounded-xl shadow-glow-md">
                    <img src={qrCodeUrl} alt="QR Code" className="w-[180px] h-[180px]" />
                    <span className="text-[10px] text-black font-extrabold uppercase tracking-wider">
                      Escaneie para conectar
                    </span>
                  </div>
                )}
                {instanceStatus === "connected" && (
                  <button 
                    onClick={handleDisconnectWhatsApp} 
                    className="btn-secondary text-xs uppercase cursor-pointer hover:border-red-500/40 hover:text-red-400"
                  >
                    Desconectar Número
                  </button>
                )}
              </div>
            </div>

            {/* Target selection */}
            <div className="card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#a855f7]" />
                <span>Público Alvo do Disparo</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Filtrar por Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input text-xs cursor-pointer"
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
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Filtrar por Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="input text-xs cursor-pointer"
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
                    className="input text-xs"
                  />
                </div>
                <div className="flex flex-col justify-center p-3.5 bg-[#0a0a0f] border border-[rgba(139,69,212,0.12)] rounded-lg text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Leads Selecionados</span>
                  <span className="text-xl font-extrabold text-white mt-1.5">{targetLeadsCount} Contatos</span>
                </div>
              </div>
            </div>

            {/* Step builder */}
            <div className="card p-6 space-y-6 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(139,69,212,0.12)] pb-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fluxo de Disparo</label>
                  <div className="flex flex-wrap gap-2.5">
                    <select
                      value={selectedFlowId}
                      onChange={(e) => setSelectedFlowId(e.target.value)}
                      className="input text-xs max-w-xs cursor-pointer"
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
                      className="input text-xs max-w-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSaveFlow}
                      disabled={savingFlow}
                      className="btn-secondary text-xs uppercase font-bold px-4 py-2 cursor-pointer"
                    >
                      {savingFlow ? "Salvando..." : "Salvar Fluxo"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="btn-secondary flex items-center space-x-2 text-xs uppercase font-bold py-2 px-3.5 cursor-pointer self-end"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Etapa</span>
                </button>
              </div>

              {/* Vertical connected steps timeline */}
              <div className="relative pl-10 space-y-8">
                {/* Connecting vertical line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#6b2fb5] to-[rgba(139,69,212,0.1)] pointer-events-none"></div>

                {steps.map((step, idx) => (
                  <div key={step.id} className="relative bg-[#141426]/40 border border-[rgba(139,69,212,0.12)] rounded-xl p-5 space-y-4 hover:border-[rgba(139,69,212,0.22)] transition-all">
                    
                    {/* Circle position label */}
                    <div className="absolute -left-[39px] top-5 w-7 h-7 rounded-full bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
                      {idx + 1}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="badge badge-purple text-[9px] font-bold uppercase tracking-wider">
                        {step.type === "message" ? "Mensagem Inicial" : `Gatilho de Resposta`}
                      </span>
                      {idx > 0 && (
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                        >
                          Remover Etapa
                        </button>
                      )}
                    </div>

                    {step.type === "trigger" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">
                            Validação do Gatilho
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
                            className="input text-xs cursor-pointer"
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
                            className="input text-xs"
                          />
                        </div>

                        {step.triggerType === "context" && (
                          <div className="md:col-span-2 text-[10px] text-[#fbbf24] bg-yellow-950/10 border border-yellow-500/20 p-3 rounded-lg leading-relaxed flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#fbbf24]" />
                            <span>A IA analisará a intenção da resposta. <strong>Nota: a IA pode cometer erros de interpretação.</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Texto da Mensagem</label>
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
                        className="input text-xs"
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
                          className="input text-xs cursor-pointer"
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

              {/* Bottom trigger settings and warn */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-5 border-t border-[rgba(139,69,212,0.12)]">
                <div className="text-[10px] text-gray-500 max-w-lg leading-relaxed flex items-center space-x-2 bg-[#0a0a0f] p-3 rounded-lg border border-[rgba(139,69,212,0.08)]">
                  <Info className="w-4 h-4 text-[#a855f7] flex-shrink-0" />
                  <span>Atenção: A interpretação contextual e classificação por Inteligência Artificial é automatizada. Lembre-se que a IA pode cometer erros.</span>
                </div>
                
                <button
                  onClick={handleStartBroadcast}
                  className="btn-primary flex items-center space-x-2 text-xs uppercase py-3 px-6 shadow-glow-sm cursor-pointer font-bold tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  <span>Iniciar Disparos</span>
                </button>
              </div>
            </div>

            {/* Histórico de Disparos */}
            <div className="card p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider">Histórico de Disparos Recentes</h3>
              {jobs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">Nenhum disparo registrado anteriormente.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="premium-table">
                    <thead className="bg-[#141426]">
                      <tr>
                        <th>Fluxo</th>
                        <th>Data / Hora</th>
                        <th>Status</th>
                        <th>Filtros</th>
                        <th>Envios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-[rgba(139,69,212,0.04)] transition-colors">
                          <td className="font-semibold text-white">{job.dispatch_flows?.name || "Fluxo Excluído"}</td>
                          <td className="text-xs text-gray-400">
                            {new Date(job.created_at).toLocaleDateString("pt-BR")} às {new Date(job.created_at).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                job.status === "completed"
                                  ? "bg-[#051505] text-[#4ade80] border-[rgba(34,197,94,0.3)]"
                                  : job.status === "running"
                                    ? "bg-[#0a1520] text-[#60a5fa] border-[rgba(59,130,246,0.3)] animate-pulse"
                                    : job.status === "pending"
                                      ? "bg-[#150f00] text-[#fbbf24] border-[rgba(245,158,11,0.3)]"
                                      : "bg-[#150505] text-[#f87171] border-[rgba(239,68,68,0.3)]"
                              }`}
                            >
                              {job.status === "completed" ? "Concluído" : job.status === "running" ? "Executando" : job.status === "pending" ? "Pendente" : "Falhou"}
                            </span>
                          </td>
                          <td className="text-xs text-gray-500 font-medium">
                            Status: {job.filter_status || "Todos"} | Categoria: {job.filter_category || "Todas"}
                          </td>
                          <td className="text-xs text-white font-mono font-bold">
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

        {/* Official API section */}
        {apiType === "official" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Tutorial Card */}
            <div className="card p-6 space-y-6">
              <div className="border-b border-[rgba(139,69,212,0.12)] pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#a855f7]" />
                  <span>Tutorial: Integração com WhatsApp Business API Oficial (Meta)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Siga os passos abaixo para registrar seu número na API Oficial de Nuvem da Meta.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Conta no Meta para Desenvolvedores",
                    desc: "Acesse developers.facebook.com com sua conta comercial do Facebook, crie um aplicativo empresarial e adicione o produto 'WhatsApp'."
                  },
                  {
                    step: "2",
                    title: "Configurar Número e Verificação",
                    desc: "Insira as informações comerciais, número de telefone que deseja usar e realize a verificação do número por SMS ou ligação de voz."
                  },
                  {
                    step: "3",
                    title: "Obter IDs e Token Permanente",
                    desc: "No painel do WhatsApp, copie o 'WhatsApp Business Account ID', o 'Phone Number ID' e crie um Token de Acesso Permanente em 'Usuários do Sistema'."
                  },
                  {
                    step: "4",
                    title: "Configurar Rota e Templates",
                    desc: "Registre seus templates de prospecção aprovados pela Meta para poder enviar mensagens ativas para novos leads sem bloqueios."
                  }
                ].map((s) => (
                  <div key={s.step} className="flex space-x-4">
                    <div className="w-6 h-6 rounded-full bg-[#141426] border border-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                      {s.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">{s.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chatwoot Support Connection Card */}
            <div className="card p-6 space-y-6">
              <div className="border-b border-[rgba(139,69,212,0.12)] pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-[#a855f7]" />
                  <span>Ativação da Caixa de Entrada Unificada (Chatwoot)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  O fluxo oficial direciona os disparos e respostas para o Chatwoot, evitando banimentos e facilitando o atendimento.
                </p>
              </div>

              <div className="p-4 bg-[rgba(139,69,212,0.04)] border border-[rgba(139,69,212,0.15)] rounded-xl space-y-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Para criar e configurar sua conta dedicada no Chatwoot integrada com a Meta API Oficial, nossa equipe precisa habilitar seu ambiente exclusivo.
                </p>
                <div className="text-[11px] text-gray-400">
                  Benefícios da API Oficial + Chatwoot:
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>Risco zero de banimento de chip no WhatsApp.</li>
                    <li>Caixa de entrada compartilhada para múltiplos atendentes responderem leads.</li>
                    <li>Status de entrega, leitura e relatórios precisos.</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div className="flex items-center space-x-2 text-[10px] text-[#fbbf24] bg-yellow-950/10 border border-yellow-500/20 px-3.5 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
                  <span>Requer plano ativo compatível com a API Oficial (Plano Ultra).</span>
                </div>
                
                <a
                  href="https://wa.me/5521976640033?text=Olá,%20gostaria%20de%20ativar%20a%20API%20Oficial%20e%20a%20conta%20Chatwoot%20no%20meu%20Lead%20Pluz!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs uppercase font-bold tracking-wider py-2.5 px-5 flex items-center space-x-2 cursor-pointer shadow-glow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Falar com o Suporte</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
