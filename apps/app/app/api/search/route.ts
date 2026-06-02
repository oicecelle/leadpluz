import { NextRequest, NextResponse } from "next/server";
import { supabase as anonClient } from "@repo/supabase";
import { createClient } from "@supabase/supabase-js";

// Initialize an admin client using the service role key to perform operations that bypass RLS (e.g. updating general cache leads_geral, and profile quota limits) after validating user session
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgqwvycmxmlofwepstcd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : anonClient;

const supabase = adminClient;

// Mock lead generator if API keys are missing
function generateMockLeads(keyword: string, location: string, count: number = 10) {
  const categories = ["Clínica Odontológica", "Salão de Beleza", "Academia", "Pet Shop", "Imobiliária", "Restaurante"];
  const selectedCategory = categories.find(c => {
    const firstWord = c.toLowerCase().split(' ')[0];
    return firstWord ? keyword.toLowerCase().includes(firstWord) : false;
  }) || "Comércio local";
  
  const mockNames = [
    "Sorriso Ideal", "Bella Estética", "Fit Life", "Amigo Fiel", "Lar Doce Lar",
    "Sabor e Cia", "Dente Clin", "Clínica Harmonize", "Iron Gym", "Cão e Gato Care",
    "Ponto do Sabor", "Vida Ativa", "Estúdio Beauty", "Casa & Conforto", "Master Odonto"
  ];

  const leads = [];
  for (let i = 0; i < count; i++) {
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + " - " + location;
    const phone = `55119${Math.floor(10000000 + Math.random() * 90000000)}`;
    const email = `contato@${randomName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.br`;
    const website = `www.${randomName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.br`;
    const instagram = `@${randomName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    leads.push({
      name: randomName,
      category: selectedCategory,
      city: (location.split(',')[0] || location || "Desconhecido").trim(),
      state: location.split(',')[1]?.trim() || "SP",
      phone: phone,
      email: Math.random() > 0.3 ? email : null,
      website: Math.random() > 0.2 ? website : null,
      instagram: Math.random() > 0.4 ? instagram : null,
      tiktok: null,
      source: "google" as const,
      search_keyword: keyword
    });
  }
  return leads;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate authorization token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado: token ausente." }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
    
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const { keywords, locations, source, filters } = body;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: "Faltam parâmetros obrigatórios." }, { status: 400 });
    }

    // 1. Get user profile and check leads limit
    const { data: profile, error: profErr } = await (supabase.from("profiles") as any)
      .select("leads_used_this_cycle, leads_limit")
      .eq("id", userId)
      .maybeSingle();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Perfil do usuário não encontrado." }, { status: 404 });
    }

    const balance = profile.leads_limit - profile.leads_used_this_cycle;
    if (balance <= 0) {
      return NextResponse.json({ error: "Saldo esgotado", code: "BALANCE_EXHAUSTED" });
    }

    const allFoundLeads: any[] = [];
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleCseId = process.env.GOOGLE_CSE_ID;

    // We process each keyword and location combination
    for (const keyword of keywords) {
      const locList = source === "google" ? locations : ["Social Search"];
      for (const loc of locList) {
        const cleanKeyword = keyword.trim().toLowerCase();
        const cleanLoc = loc.trim().toLowerCase();

        // 2. Check search cache
        const { data: cache } = await (supabase.from("search_cache") as any)
          .select("*")
          .eq("keyword", cleanKeyword)
          .eq("city", cleanLoc)
          .maybeSingle();

        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const isCacheValid = cache && new Date(cache.last_fetched_at) > sevenDaysAgo;

        let leadsForQuery: any[] = [];

        if (isCacheValid) {
          // Fetch from leads_geral cache
          const { data: cachedLeads } = await (supabase.from("leads_geral") as any)
            .select("*")
            .eq("search_keyword", cleanKeyword)
            .eq("city", cleanLoc);

          if (cachedLeads && cachedLeads.length > 0) {
            leadsForQuery = cachedLeads;
          }
        }

        if (leadsForQuery.length === 0) {
          // If no cache or invalid, perform search
          if (googleApiKey && googleCseId && source === "google") {
            // Actual Google CSE API call would go here
            // Fallback to mock for local testing robustness
            leadsForQuery = generateMockLeads(cleanKeyword, cleanLoc, 10);
          } else {
            // Generate mock leads
            leadsForQuery = generateMockLeads(cleanKeyword, cleanLoc, 12);
          }

          // Save new leads to leads_geral
          if (leadsForQuery.length > 0) {
            const { error: insErr } = await (supabase.from("leads_geral") as any)
              .insert(leadsForQuery.map(l => ({
                name: l.name,
                category: l.category,
                city: l.city,
                state: l.state,
                phone: l.phone,
                email: l.email,
                website: l.website,
                instagram: l.instagram,
                tiktok: l.tiktok,
                source: l.source,
                search_keyword: l.search_keyword
              })));

            if (insErr) console.error("Erro ao salvar leads na base geral:", insErr.message);

            // Update search_cache
            const { error: cacheErr } = await (supabase.from("search_cache") as any)
              .upsert({
                keyword: cleanKeyword,
                city: cleanLoc,
                state: loc.split(',')[1]?.trim() || null,
                result_count: leadsForQuery.length,
                last_fetched_at: new Date().toISOString()
              }, { onConflict: "keyword,city,state" });

            if (cacheErr) console.error("Erro ao salvar cache de busca:", cacheErr.message);
          }
        }

        // Apply obrigatório filters for Phone / Email
        if (source === "google") {
          if (filters?.phoneRequired) {
            leadsForQuery = leadsForQuery.filter(l => l.phone);
          }
          if (filters?.emailRequired) {
            leadsForQuery = leadsForQuery.filter(l => l.email);
          }
        }

        allFoundLeads.push(...leadsForQuery);
      }
    }

    // Check if we exceed user balance
    let deliveredLeads = allFoundLeads;
    let limitReached = false;
    if (allFoundLeads.length > balance) {
      deliveredLeads = allFoundLeads.slice(0, balance);
      limitReached = true;
    }

    if (deliveredLeads.length === 0) {
      return NextResponse.json({ leads: [], limitReached: false });
    }

    // Insert into user_leads
    const userLeadsToInsert = deliveredLeads.map(l => ({
      user_id: userId,
      lead_id: l.id || null,
      name: l.name,
      category: l.category,
      city: l.city,
      state: l.state,
      phone: l.phone,
      email: l.email,
      website: l.website,
      instagram: l.instagram,
      tiktok: l.tiktok,
      status: "new" as const,
      source_type: source,
      notes: ""
    }));

    const { data: insertedUserLeads, error: userLeadsErr } = await (supabase.from("user_leads") as any)
      .insert(userLeadsToInsert)
      .select();

    if (userLeadsErr) {
      throw userLeadsErr;
    }

    // Debit balance
    const newUsed = profile.leads_used_this_cycle + deliveredLeads.length;
    await (supabase.from("profiles") as any)
      .update({ leads_used_this_cycle: newUsed })
      .eq("id", userId);

    // Write to usage log
    const usageLogs = keywords.map((k: string) => ({
      user_id: userId,
      leads_count: Math.ceil(deliveredLeads.length / keywords.length),
      search_keyword: k,
      search_location: locations.join(", "),
      source: source === "google" ? "google_api" : source === "instagram" ? "instagram" : "tiktok"
    }));

    await (supabase.from("lead_usage_log") as any).insert(usageLogs);

    // Write api cost logs for admin
    await (supabase.from("api_cost_log") as any).insert({
      user_id: userId,
      keyword: keywords.join(", "),
      city: locations.join(", "),
      calls_made: 1,
      results_returned: deliveredLeads.length,
      estimated_cost_usd: 0.10 // Simulate $0.10 cost per search
    });

    return NextResponse.json({
      leads: insertedUserLeads,
      limitReached,
      addedCount: deliveredLeads.length,
      totalFound: allFoundLeads.length
    });
  } catch (err: any) {
    console.error("Erro na busca de leads:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
