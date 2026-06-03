"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";
import { Check, Zap, ArrowRight, Eye, EyeOff, X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard/leads");
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error("Por favor, preencha o seu nome.");
        }

        // Check if user already exists in DB
        const checkRes = await fetch("/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();
        if (checkData.exists) {
          throw new Error("Este e-mail já está cadastrado.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage("Cadastro realizado! Faça login com suas credenciais.");
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        if (data.session) {
          // Save or clear email in localStorage
          if (rememberMe) {
            localStorage.setItem("remembered_email", email);
          } else {
            localStorage.removeItem("remembered_email");
          }

          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;

          const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
            .select("plan_status, is_admin")
            .eq("id", data.session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          const planStatus = profile?.plan_status || "inactive";
          const isAdmin = profile?.is_admin ? "true" : "false";

          document.cookie = `plan-status=${planStatus}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `is-admin=${isAdmin}; path=/; max-age=86400; SameSite=Lax`;

          router.push(profile?.is_admin ? "/admin" : "/dashboard/leads");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro no processo de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col md:flex-row select-none">
      
      {/* Coluna Esquerda - Marca e Benefícios (40%) */}
      <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#1a0533] to-[#0a0a0f] relative overflow-hidden flex-col justify-between p-12 border-r border-[rgba(139,69,212,0.12)]">
        
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[rgba(139,69,212,0.15)] blur-[100px] pointer-events-none"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none"></div>

        {/* Top brand */}
        <div className="flex items-center space-x-2 relative z-10">
          <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
          <span className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">
            LEAD<span className="text-purple-400">PLUZ</span>
          </span>
        </div>

        {/* Mid logo & benefits */}
        <div className="space-y-8 relative z-10 my-auto">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-white leading-tight">
              Encontre clientes.<br />Conecte. Converta.
            </h2>
            <p className="text-xs text-gray-400 max-w-sm">
              Tudo o que você precisa para automatizar sua prospecção ativa via WhatsApp e gerenciar leads em um só painel.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {[
              "Busca inteligente de leads qualificados",
              "Automação de disparos via WhatsApp",
              "CRM Kanban para controle de vendas",
            ].map((b) => (
              <div key={b} className="flex items-center space-x-3 text-xs text-gray-300">
                <div className="w-5 h-5 rounded-full bg-purple-950/40 border border-purple-800/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#a855f7]" />
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer brand */}
        <div className="text-[10px] text-gray-600 relative z-10 font-mono">
          &copy; {new Date().getFullYear()} LEADPLUZ. Todos os direitos reservados.
        </div>
      </div>

      {/* Coluna Direita - Formulário (60%) */}
      <div className="flex-1 bg-[#050508] flex items-center justify-center p-6 relative">
        {/* Small mobile branding header */}
        <div className="absolute top-6 left-6 flex md:hidden items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
          <span className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">
            LEAD<span className="text-purple-400">PLUZ</span>
          </span>
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {isSignUp ? "Crie sua conta no LEADPLUZ" : "Entrar na sua conta"}
            </h1>
            <p className="text-xs text-gray-400">
              {isSignUp
                ? "Preencha seus dados abaixo para começar"
                : "Bem-vindo de volta! Faça login com suas credenciais"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 pt-2">
            {isSignUp && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Marcelle Profissional"
                  className={`input ${name.trim() ? "border-[#6b2fb5]" : "border-[rgba(255,255,255,0.06)]"}`}
                />
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`input ${
                  error ? "border-[#f87171]" : email.trim() ? "border-[#6b2fb5]" : "border-[rgba(255,255,255,0.06)]"
                }`}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input pr-10 w-full ${
                    error ? "border-[#f87171]" : password.trim() ? "border-[#6b2fb5]" : "border-[rgba(255,255,255,0.06)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-2.5 cursor-pointer group pt-1"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  rememberMe 
                    ? "bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] border-transparent" 
                    : "border-[rgba(139,69,212,0.3)] bg-transparent group-hover:border-[#8b45d4]"
                }`}>
                  {rememberMe && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                </div>
                <span className="text-xs text-gray-300 font-medium select-none">Lembrar de mim</span>
              </div>
            )}

            {error && (
              <div className="text-xs text-[#f87171] bg-red-950/20 border border-[#f87171]/20 rounded px-3 py-2 animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {message && (
              <div className="text-xs text-[#4ade80] bg-green-950/20 border border-[#4ade80]/20 rounded px-3 py-2 animate-in fade-in duration-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center text-xs py-3 font-semibold mt-4"
            >
              <span>{loading ? "Processando..." : isSignUp ? "Confirmar Cadastro" : "Entrar na Plataforma"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            {isSignUp ? (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                  setMessage("");
                }}
                className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Já possui uma conta? Faça login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPlansModal(true)}
                className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Não tem uma conta? Cadastre-se e comece agora
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Planos */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Overlay clicável para fechar */}
          <div className="absolute inset-0" onClick={() => setShowPlansModal(false)} />
          
          {/* Conteúdo do Modal */}
          <div className="relative w-full max-w-4xl bg-[#0a0a0f] border border-[rgba(139,69,212,0.3)] rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[95vh] z-10 space-y-6">
            
            {/* Botão de Fechar */}
            <button
              onClick={() => setShowPlansModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-950/20 text-purple-400 text-[10px] font-extrabold uppercase tracking-widest">
                <Zap className="w-3 h-3 fill-purple-400/20" />
                <span>Planos de Assinatura</span>
              </div>
              <h2 className="text-xl md:text-3xl font-extrabold text-white">
                Escolha o plano ideal para as suas vendas
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Selecione o plano abaixo. Você será redirecionado para concluir o pagamento seguro na Ticto e seu acesso será liberado imediatamente.
              </p>
            </div>

            {/* Grid de Planos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Plano Starter */}
              <div className="bg-[#050508] border border-purple-950/30 rounded-xl p-5 flex flex-col justify-between hover:border-purple-900/30 transition-all duration-300">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider bg-purple-950/30 px-2 py-0.5 rounded">Starter</span>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-extrabold text-white">R$ 197</span>
                      <span className="text-xs text-gray-500 ml-1">/mês</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400 border-t border-purple-950/20 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>500 leads por mês</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Palavra-chave e cidade</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>CRM Kanban integrado</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Disparador WhatsApp</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="https://checkout.ticto.app/OB52C3D66"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-6 py-2.5 bg-purple-950/40 hover:bg-purple-900/30 border border-purple-800/30 hover:border-purple-600/40 rounded-lg text-xs font-bold uppercase tracking-wider text-white text-center block transition-all"
                >
                  Assinar Starter
                </a>
              </div>

              {/* Plano Pro */}
              <div className="bg-gradient-to-b from-[#120727] to-[#050508] border-2 border-purple-500/30 rounded-xl p-5 flex flex-col justify-between shadow-lg relative transform md:-translate-y-2 hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-[#050508] text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                  ✦ Mais Popular
                </div>
                <div className="space-y-4 pt-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider bg-purple-950/40 px-2 py-0.5 rounded">Pro</span>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-extrabold text-white">R$ 247</span>
                      <span className="text-xs text-gray-500 ml-1">/mês</span>
                    </div>
                    <p className="text-[10px] text-purple-300/80 font-semibold mt-1">4x mais leads que o Starter</p>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-300 border-t border-purple-900/20 pt-4">
                    <li className="flex items-center space-x-2 font-medium text-white">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>2.000 leads por mês</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Tudo do plano Starter</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Múltiplas pesquisas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Fluxos avançados</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Suporte Prioritário</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="https://checkout.ticto.app/O8CFC5574"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider text-white text-center block transition-all shadow-md shadow-purple-900/20"
                >
                  Assinar Pro
                </a>
              </div>

              {/* Plano Ultra */}
              <div className="bg-[#050508] border border-purple-950/30 rounded-xl p-5 flex flex-col justify-between hover:border-purple-900/30 transition-all duration-300">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider bg-purple-950/30 px-2 py-0.5 rounded">Ultra</span>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-extrabold text-white">R$ 397</span>
                      <span className="text-xs text-gray-500 ml-1">/mês</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400 border-t border-purple-950/20 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>10.000 leads por mês</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Tudo do plano Pro</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>API Oficial WhatsApp</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>Conta Chatwoot inclusa</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="https://checkout.ticto.app/O3BE3401E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-6 py-2.5 bg-purple-950/40 hover:bg-purple-900/30 border border-purple-800/30 hover:border-purple-600/40 rounded-lg text-xs font-bold uppercase tracking-wider text-white text-center block transition-all"
                >
                  Assinar Ultra
                </a>
              </div>

            </div>

            {/* Garantias rodapé modal */}
            <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-[9px] font-bold uppercase tracking-wider text-gray-500 border-t border-purple-950/20">
              <span>🔒 Faturamento Seguro</span>
              <span>✓ Cancelamento sem multas</span>
              <span>⚡ Liberação rápida</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
