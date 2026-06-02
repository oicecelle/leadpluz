"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Database,
  Columns,
  Send,
  Calendar,
  Settings,
  LogOut,
  User,
  AlertTriangle,
  Zap,
  HelpCircle,
  Shield
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [actualAdminProfile, setActualAdminProfile] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: actualProf, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle() as any;

    if (error) {
      console.error("Erro ao carregar perfil:", error.message);
      setLoading(false);
      return;
    }

    if (actualProf) {
      setActualAdminProfile(actualProf);
      
      // Impersonation check
      if (actualProf.is_admin) {
        const impId = localStorage.getItem("impersonated_user_id");
        if (impId && impId !== session.user.id) {
          const { data: impProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", impId)
            .maybeSingle();
          if (impProf) {
            setProfile(impProf);
            setIsImpersonating(true);
            setLoading(false);
            return;
          }
        }
      }

      setProfile(actualProf);
      setIsImpersonating(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [router, pathname]);

  const handleLogout = async () => {
    localStorage.removeItem("impersonated_user_id");
    localStorage.removeItem("impersonated_user_name");
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "plan-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "is-admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const handleStopImpersonating = () => {
    localStorage.removeItem("impersonated_user_id");
    localStorage.removeItem("impersonated_user_name");
    setIsImpersonating(false);
    loadProfile().then(() => {
      router.push("/admin");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-purple-500 border-r-purple-900/30 border-b-purple-900/30 border-l-purple-900/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  const limit = profile?.leads_limit || 500;
  const used = profile?.leads_used_this_cycle || 0;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  const isAdminMode = pathname?.startsWith("/admin");

  const navItemsPrincipal = [
    { name: "Busca de Leads", href: "/dashboard/leads", icon: Search },
    { name: "CRM", href: "/dashboard/crm", icon: Database },
    { name: "Kanban", href: "/dashboard/kanban", icon: Columns },
  ];

  const navItemsComunicacao = [
    { name: "Disparos", href: "/dashboard/disparos", icon: Send },
    { name: "Agendamentos", href: "/dashboard/agendamentos", icon: Calendar },
  ];

  const getPageTitle = () => {
    if (isAdminMode) return "Painel de Administração";
    const allItems = [...navItemsPrincipal, ...navItemsComunicacao];
    const found = allItems.find((n) => n.href === pathname);
    if (found) return found.name;
    if (pathname?.startsWith("/dashboard/config")) return "Configurações";
    return "Dashboard";
  };

  return (
    <div className="h-screen bg-[#050508] flex flex-col relative overflow-hidden">
      
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div 
          onClick={handleStopImpersonating}
          className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black text-xs font-bold text-center py-2.5 px-4 cursor-pointer transition-colors flex items-center justify-center space-x-2 z-50 flex-shrink-0"
        >
          <Shield className="w-4 h-4 text-black stroke-[2.5px]" />
          <span>⚠️ Você está visualizando como <strong className="font-extrabold">{profile?.name} ({profile?.email})</strong>. Clique aqui para voltar ao Painel Admin.</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - fixed left side, non-scrolling */}
        <aside className="w-[220px] h-full bg-[#0a0a0f] border-r border-[rgba(139,69,212,0.12)] flex flex-col justify-between flex-shrink-0 z-30 select-none">
          <div>
            {/* Logo + Zap Icon */}
            <div className="p-5 flex items-center justify-between relative">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
                <span className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">
                  LEAD<span className="text-purple-400">PLUZ</span>
                </span>
                {isAdminMode && (
                  <span className="text-[9px] bg-[#fbbf24] text-black px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase ml-1 animate-pulse">
                    ADMIN
                  </span>
                )}
              </div>
              {actualAdminProfile?.is_admin && !isAdminMode && (
                <Link
                  href="/admin"
                  className="text-[9px] border border-yellow-500/30 text-[#fbbf24] bg-yellow-950/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider hover:bg-yellow-950/50 hover:border-yellow-500 transition-all duration-150"
                >
                  Admin
                </Link>
              )}
              {actualAdminProfile?.is_admin && isAdminMode && (
                <Link
                  href="/dashboard/leads"
                  className="text-[9px] border border-purple-500/30 text-purple-300 bg-purple-950/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider hover:bg-purple-950/50 hover:border-purple-500 transition-all duration-150"
                >
                  Voltar
                </Link>
              )}
            </div>
            {/* logo gradient divider */}
            <div className="h-[1px] w-full bg-gradient-to-r from-[#6b2fb5] to-transparent"></div>

            {/* Quota Leads Cycle - clickable */}
            <Link
              href="/dashboard/config"
              className="m-3 p-3 rounded-lg bg-[#0f0f1a]/60 border border-[rgba(139,69,212,0.08)] hover:border-[rgba(139,69,212,0.22)] transition-all duration-150 flex flex-col space-y-1.5 group cursor-pointer block"
            >
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-gray-500 group-hover:text-gray-400">
                <span>Leads este ciclo</span>
                <span className="text-gray-300 group-hover:text-white font-mono">
                  {used}/{limit}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-[3px] bg-[#141426] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    pct >= 95
                      ? "bg-[#f87171]"
                      : pct >= 80
                        ? "bg-[#fbbf24]"
                        : "bg-gradient-to-r from-[#6b2fb5] to-[#a855f7]"
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>

              {pct >= 95 ? (
                <span className="text-[9px] text-[#f87171] font-bold block pt-0.5 animate-pulse text-center">
                  🔴 Limite atingido! Upgrade
                </span>
              ) : pct >= 80 ? (
                <span className="text-[9px] text-[#fbbf24] font-bold block pt-0.5 text-center">
                  ⚠️ Cota próxima do limite
                </span>
              ) : null}
            </Link>

            {/* Nav Section PRINCIPAL */}
            <div className="px-2">
              <span className="px-3.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 block">
                Principal
              </span>
              <div className="space-y-0.5">
                {navItemsPrincipal.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 group ${
                        active
                          ? "bg-[rgba(139,69,212,0.12)] border-l-2 border-[#8b45d4] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#1a1a30]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-all duration-150 ${
                          active
                            ? "text-[#a855f7] drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                            : "text-gray-500 group-hover:text-[#a855f7]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Nav Section COMUNICAÇÃO */}
            <div className="px-2 mt-4">
              <span className="px-3.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 block">
                Comunicação
              </span>
              <div className="space-y-0.5">
                {navItemsComunicacao.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 group ${
                        active
                          ? "bg-[rgba(139,69,212,0.12)] border-l-2 border-[#8b45d4] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#1a1a30]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-all duration-150 ${
                          active
                            ? "text-[#a855f7] drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                            : "text-gray-500 group-hover:text-[#a855f7]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Area & Logout */}
          <div className="p-3 border-t border-[rgba(139,69,212,0.12)] space-y-1.5">
            {/* Configurações */}
            <Link
              href="/dashboard/config"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 group ${
                pathname === "/dashboard/config"
                  ? "bg-[rgba(139,69,212,0.12)] border-l-2 border-[#8b45d4] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a30]"
              }`}
            >
              <Settings className="w-4 h-4 text-gray-500 group-hover:text-[#a855f7] transition-all" />
              <span>Configurações</span>
            </Link>

            {/* Suporte */}
            <Link
              href="/dashboard/config#suporte"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:text-white hover:bg-[#1a1a30] transition-all duration-150 group"
            >
              <HelpCircle className="w-4 h-4 text-gray-500 group-hover:text-[#a855f7]" />
              <span>Suporte</span>
            </Link>

            {/* Sair */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-400 hover:text-white hover:bg-red-950/25 transition-all duration-150 group text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-[#f87171]" />
              <span className="group-hover:text-[#f87171]">Sair da conta</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          
          {/* Topbar - 56px, blur backdrop */}
          <header
            className={`h-[56px] sticky top-0 z-20 flex items-center justify-between px-8 border-b transition-colors duration-200 select-none ${
              isAdminMode
                ? "bg-[#0a0a0f]/85 border-b-[rgba(251,191,36,0.2)] bg-gradient-to-r from-[rgba(251,191,36,0.03)] to-transparent"
                : "bg-[#0a0a0f]/85 border-b-[rgba(139,69,212,0.12)]"
            } backdrop-blur-md`}
          >
            <div className="flex items-center space-x-3">
              {isAdminMode && <Shield className="w-4 h-4 text-[#fbbf24] animate-pulse" />}
              <h2 className="text-[14px] font-semibold tracking-wide text-white uppercase font-sans">
                {getPageTitle()}
              </h2>
            </div>

            {/* User Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6b2fb5] to-[#a855f7] p-[1.5px] cursor-pointer hover:shadow-glow-sm hover:scale-105 transition-all duration-150 overflow-hidden outline-none flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full bg-[#050508] overflow-hidden flex items-center justify-center text-[11px] font-extrabold text-white">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.substring(0, 1).toUpperCase() || <User className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-[#0f0f1a] border border-[rgba(139,69,212,0.22)] rounded-lg shadow-glow-sm p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-[rgba(139,69,212,0.1)] text-xs">
                      <p className="font-semibold text-white truncate">{profile?.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">
                        Plano {profile?.plan}
                      </p>
                    </div>
                    
                    <Link
                      href="/dashboard/config"
                      onClick={() => setShowDropdown(false)}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a1a30] rounded-md transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Meu perfil</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/config"
                      onClick={() => setShowDropdown(false)}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a1a30] rounded-md transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configurações</span>
                    </Link>

                    <div className="h-[1px] bg-[rgba(139,69,212,0.1)] my-1"></div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da conta</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Content Area - Scrollable */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
