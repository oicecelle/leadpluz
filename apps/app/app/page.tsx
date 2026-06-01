"use client";

import { useEffect } from "react";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
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
