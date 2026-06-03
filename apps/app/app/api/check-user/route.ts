import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

let adminClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (!adminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgqwvycmxmlofwepstcd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required but not defined.");
    }
    adminClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return adminClient;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // Query profiles table for matching email
    const { data, error } = await getAdminClient()
      .from("profiles")
      .select("id")
      .eq("email", cleanedEmail)
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar usuário existente:", error.message);
      return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
    }

    return NextResponse.json({ exists: !!data });
  } catch (err: any) {
    console.error("Erro na rota /api/check-user:", err);
    return NextResponse.json({ error: "Erro ao processar requisição." }, { status: 500 });
  }
}
