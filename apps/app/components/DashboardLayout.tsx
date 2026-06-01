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
  AlertTriangle
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar perfil:", error.message);
      } else if (prof) {
        setProfile(prof);
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Delete cookies
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "plan-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "is-admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-t-white border-r-[#222] border-b-[#222] border-l-[#222] rounded-full animate-spin"></div>
      </div>
    );
  }

  const limit = profile?.leads_limit || 500;
  const used = profile?.leads_used_this_cycle || 0;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  const navItems = [
    { name: "Busca de Leads", href: "/dashboard/leads", icon: Search },
    { name: "CRM", href: "/dashboard/crm", icon: Database },
    { name: "Kanban", href: "/dashboard/kanban", icon: Columns },
    { name: "Disparos", href: "/dashboard/disparos", icon: Send },
    { name: "Agendamentos", href: "/dashboard/agendamentos", icon: Calendar },
    { name: "Configurações", href: "/dashboard/config", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#111] border-r border-[#222] flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <span className="text-sm font-bold tracking-widest text-white">LEADPLUZ</span>
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase tracking-wider hover:opacity-90"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Usage Quota */}
          <div className="p-4 border-b border-[#222] flex flex-col space-y-2">
            <div className="flex justify-between text-[11px] font-medium text-gray-400">
              <span>Leads Usados</span>
              <span className="text-white font-semibold">
                {used} / {limit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-300" style={{ width: `${pct}%` }}></div>
            </div>
            {pct >= 80 && (
              <div className="flex items-center space-x-1 text-yellow-500 text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Próximo do limite de leads!</span>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? "bg-white text-black font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-[#222] space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-white border border-[#333] overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-white font-medium truncate">{profile?.name}</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                Plano {profile?.plan}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-red-950/20 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[60px] bg-[#111] border-b border-[#222] flex items-center justify-between px-8">
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            {navItems.find((n) => n.href === pathname)?.name || "Dashboard"}
          </h2>
        </header>

        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
