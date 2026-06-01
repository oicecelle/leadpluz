"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in, redirect accordingly
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
          // Set access token cookie
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;

          // Fetch user profile to get subscription status and admin flag
          const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
            .select("plan_status, is_admin")
            .eq("id", data.session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          const planStatus = profile?.plan_status || "inactive";
          const isAdmin = profile?.is_admin ? "true" : "false";

          // Set cookies for middleware
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white mb-2">LEADPLUZ</h1>
          <p className="text-xs text-gray-400">
            {isSignUp ? "Crie sua conta para começar" : "Entrar na plataforma"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Nome completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Marcelle Profissional"
                className="premium-input"
              />
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="premium-input"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="premium-input"
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-950/20 border border-red-500/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          {message && (
            <div className="text-xs text-green-500 bg-green-950/20 border border-green-500/30 rounded px-3 py-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button-primary mt-2"
          >
            {loading ? "Processando..." : isSignUp ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isSignUp
              ? "Já possui uma conta? Faça login"
              : "Não tem uma conta? Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
}
