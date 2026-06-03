"use client";

import { useEffect } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const { data: profile } = await (supabase.from("profiles") as any)
            .select("plan_status, is_admin")
            .eq("id", session.user.id)
            .maybeSingle();
            
          const planStatus = profile?.plan_status || "inactive";
          const isAdmin = profile?.is_admin ? "true" : "false";
          
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `plan-status=${planStatus}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `is-admin=${isAdmin}; path=/; max-age=86400; SameSite=Lax`;
        } catch (err) {
          console.error("Erro ao sincronizar cookies na raiz:", err);
        }
        // Logged in, send to dashboard
        router.push("/dashboard/leads");
      } else {
        // Not logged in, send to login
        router.push("/login");
      }
    };
    handleRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border border-t-white border-r-[#222] border-b-[#222] border-l-[#222] rounded-full animate-spin"></div>
    </div>
  );
}
