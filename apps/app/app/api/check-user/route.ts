import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgqwvycmxmlofwepstcd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client to bypass RLS policies safely on the server side
const adminClient = createClient(supabaseUrl, supabaseServiceKey || "");

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // Query profiles table for matching email
    const { data, error } = await adminClient
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
