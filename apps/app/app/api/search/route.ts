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

function getCategoryFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase().trim();
  
  if (
    kw.includes("dentista") || 
    kw.includes("odont") || 
    kw.includes("dental") || 
    kw.includes("dente") || 
    kw.includes("ortodontia")
  ) {
    return "Clínica Odontológica";
  }
  
  if (
    kw.includes("salão") || 
    kw.includes("salao") || 
    kw.includes("beleza") || 
    kw.includes("estética") || 
    kw.includes("estetica") || 
    kw.includes("cabeleireiro") || 
    kw.includes("manicure") || 
    kw.includes("barbearia") ||
    kw.includes("barber")
  ) {
    return "Salão de Beleza";
  }
  
  if (
    kw.includes("academia") || 
    kw.includes("gym") || 
    kw.includes("fit") || 
    kw.includes("fitness") || 
    kw.includes("crossfit") || 
    kw.includes("treino")
  ) {
    return "Academia";
  }
  
  if (
    kw.includes("pet") || 
    kw.includes("veterin") || 
    kw.includes("banho e tosa") || 
    kw.includes("clinicão") || 
    kw.includes("cão") || 
    kw.includes("gato")
  ) {
    return "Pet Shop";
  }
  
  if (
    kw.includes("imobili") || 
    kw.includes("corretor") || 
    kw.includes("imóveis") || 
    kw.includes("apartamento") || 
    kw.includes("aluguel")
  ) {
    return "Imobiliária";
  }
  
  if (
    kw.includes("restaurante") || 
    kw.includes("pizzaria") || 
    kw.includes("hamburg") || 
    kw.includes("sushi") || 
    kw.includes("comida") || 
    kw.includes("lanchonete") || 
    kw.includes("bar") || 
    kw.includes("gastronomia")
  ) {
    return "Restaurante";
  }
  
  return "Comércio local";
}

async function fetchGoogleLeads(keyword: string, location: string, apiKey: string, cseId: string, limit: number = 10): Promise<any[]> {
  try {
    const query = `"${keyword}" "${location}" "whatsapp" OR "telefone" OR "contato"`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${limit}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      console.error("Google Custom Search API error response:", errText);
      return [];
    }
    
    const data = await res.json();
    const items = data.items || [];
    
    const leads: any[] = [];
    
    for (const item of items) {
      const title = item.title || "";
      const snippet = item.snippet || "";
      const link = item.link || "";
      
      let name = title
        .split(" - ")[0]
        .split(" | ")[0]
        .split(": ")[0]
        .trim();
      
      if (!name || name.length < 3) {
        name = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - ${location}`;
      }
      
      const phoneRegex = /(?:\+?55\s?)?(?:\(?([1-9][1-9])\)?\s?)(?:9\s?)?([0-9]{4})[-\s]?([0-9]{4})/g;
      let phone = null;
      let match;
      const combinedText = `${title} ${snippet} ${link}`;
      
      while ((match = phoneRegex.exec(combinedText)) !== null) {
        const ddd = match[1];
        const part1 = match[2];
        const part2 = match[3];
        if (ddd && part1 && part2) {
          const numDigits = part1.length + part2.length;
          if (numDigits === 8) {
            phone = `55${ddd}9${part1}${part2}`;
            break;
          } else if (numDigits === 9) {
            phone = `55${ddd}${part1}${part2}`;
            break;
          }
        }
      }
      
      if (!phone) {
        const simplePhoneRegex = /\b\(?[1-9][1-9]\)?\s?9?[0-9]{4}[-\s]?[0-9]{4}\b/;
        const simpleMatch = combinedText.match(simplePhoneRegex);
        if (simpleMatch) {
          phone = "55" + simpleMatch[0].replace(/\D/g, "");
          if (phone.length < 12) {
            if (phone.length === 11) {
              phone = phone.slice(0, 4) + "9" + phone.slice(4);
            }
          }
        }
      }
      
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailMatch = combinedText.match(emailRegex);
      const email = emailMatch ? emailMatch[0].toLowerCase() : null;
      
      let website = null;
      try {
        const urlObj = new URL(link);
        if (!urlObj.hostname.includes("instagram.com") && 
            !urlObj.hostname.includes("facebook.com") && 
            !urlObj.hostname.includes("youtube.com") &&
            !urlObj.hostname.includes("linkedin.com") &&
            !urlObj.hostname.includes("whatsapp.com")) {
          website = urlObj.origin;
        }
      } catch (e) {
      }
      
      let instagram = null;
      if (link.includes("instagram.com/")) {
        const parts = link.split("instagram.com/")[1]?.split("/");
        const handle = parts ? parts[0] : null;
        if (handle && handle !== "p" && handle !== "reels" && handle !== "explore") {
          instagram = `@${handle}`;
        }
      }
      if (!instagram) {
        const instaRegex = /@([a-zA-Z0-9_.]+)/;
        const instaMatch = combinedText.match(instaRegex);
        if (instaMatch) {
          instagram = instaMatch[0];
        }
      }
      
      if (phone) {
        leads.push({
          name: name,
          category: getCategoryFromKeyword(keyword),
          city: (location.split(',')[0] || location || "Desconhecido").trim(),
          state: location.split(',')[1]?.trim() || "SP",
          phone: phone,
          email: email,
          website: website,
          instagram: instagram,
          tiktok: null,
          source: "google",
          search_keyword: keyword.toLowerCase().trim()
        });
      }
    }
    
    return leads;
  } catch (error) {
    console.error("Error in fetchGoogleLeads:", error);
    return [];
  }
}

// Mock lead generator if API keys are missing or return no data
function generateMockLeads(keyword: string, location: string, count: number = 10) {
  const selectedCategory = getCategoryFromKeyword(keyword);
  
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
      search_keyword: keyword.toLowerCase().trim()
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
    const { keywords, locations, source, filters, maxLeadsRequested } = body;
    const targetLimit = typeof maxLeadsRequested === "number" && maxLeadsRequested > 0 ? maxLeadsRequested : 50;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: "Faltam parâmetros obrigatórios." }, { status: 400 });
    }

    // 2. Get user profile and check leads limit
    const { data: profile, error: profErr } = await (supabase.from("profiles") as any)
      .select("leads_used_this_cycle, leads_limit, google_api_key, google_cse_id")
      .eq("id", userId)
      .maybeSingle();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Perfil do usuário não encontrado." }, { status: 404 });
    }

    const balance = profile.leads_limit - profile.leads_used_this_cycle;
    if (balance <= 0) {
      return NextResponse.json({ error: "Saldo esgotado", code: "BALANCE_EXHAUSTED" });
    }

    // 3. Get leads the user already has to avoid duplicates
    const { data: existingUserLeads } = await (supabase.from("user_leads") as any)
      .select("phone, email")
      .eq("user_id", userId);

    const existingPhones = new Set((existingUserLeads || []).map((l: any) => l.phone).filter(Boolean));
    const existingEmails = new Set((existingUserLeads || []).map((l: any) => l.email).filter(Boolean));

    const allFoundLeads: any[] = [];
    const googleApiKey = profile?.google_api_key || process.env.GOOGLE_API_KEY;
    const googleCseId = profile?.google_cse_id || process.env.GOOGLE_CSE_ID;

    for (const keyword of keywords) {
      const locList = source === "google" ? (locations && locations.length > 0 ? locations : ["Brasil"]) : ["Social Search"];
      
      for (const loc of locList) {
        const cleanKeyword = keyword.trim().toLowerCase();
        const cleanLoc = loc.trim().toLowerCase();

        let leadsForQuery: any[] = [];
        const cityPart = cleanLoc.split(",")[0].trim();

        // STEP 1-4 collapsed: Use accent-insensitive RPC function that searches
        // across category, name, and search_keyword simultaneously
        const { data: rpcLeads, error: rpcErr } = await (supabase.rpc as any)(
          "search_leads_geral",
          { p_keyword: cleanKeyword, p_city: cityPart, p_limit: 50 }
        );

        if (rpcErr) {
          console.error("[RPC] Erro na busca:", rpcErr.message);
        } else if (rpcLeads && rpcLeads.length > 0) {
          console.log(`[RPC] ${rpcLeads.length} leads encontrados para "${cleanKeyword}" em "${cityPart}"`);
          leadsForQuery = rpcLeads;
        }

        // If no city-specific results, try nationwide
        if (leadsForQuery.length === 0) {
          const { data: rpcNational, error: rpcNatErr } = await (supabase.rpc as any)(
            "search_leads_geral",
            { p_keyword: cleanKeyword, p_city: "", p_limit: 50 }
          );

          if (!rpcNatErr && rpcNational && rpcNational.length > 0) {
            console.log(`[RPC-NATIONAL] ${rpcNational.length} leads encontrados para "${cleanKeyword}" (nacional)`);
            leadsForQuery = rpcNational;
          }
        }

        // STEP 5: Google Custom Search API (only if nothing found locally)
        if (leadsForQuery.length === 0) {
          if (googleApiKey && googleCseId && source === "google") {
            console.log(`[GOOGLE] Buscando: "${cleanKeyword}" em "${cleanLoc}"`);
            const googleLeads = await fetchGoogleLeads(cleanKeyword, cleanLoc, googleApiKey, googleCseId, 10);
            
            if (googleLeads.length > 0) {
              const { data: insertedGeralLeads, error: insErr } = await (supabase.from("leads_geral") as any)
                .insert(googleLeads.map((l: any) => ({
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
                })))
                .select();

              leadsForQuery = (!insErr && insertedGeralLeads && insertedGeralLeads.length > 0)
                ? insertedGeralLeads
                : googleLeads;

              await (supabase.from("search_cache") as any)
                .upsert({
                  keyword: cleanKeyword,
                  city: cleanLoc,
                  state: loc.split(",")[1]?.trim() || null,
                  result_count: leadsForQuery.length,
                  last_fetched_at: new Date().toISOString()
                }, { onConflict: "keyword,city,state" });
            } else {
              console.log(`[GOOGLE] Nenhum resultado com telefone para "${cleanKeyword}" em "${cleanLoc}"`);
            }
          } else {
            console.log(`[INFO] Sem resultados no banco e Google API não configurada para "${cleanKeyword}" em "${cleanLoc}".`);
          }
        }

        // STEP 4: Apply required filters
        if (source === "google") {
          if (filters?.phoneRequired) {
            leadsForQuery = leadsForQuery.filter((l: any) => l.phone);
          }
          if (filters?.emailRequired) {
            leadsForQuery = leadsForQuery.filter((l: any) => l.email);
          }
        }

        // STEP 5: Remove leads the user already has (dedup by phone and email)
        leadsForQuery = leadsForQuery.filter((l: any) => {
          if (l.phone && existingPhones.has(l.phone)) return false;
          if (l.email && existingEmails.has(l.email)) return false;
          return true;
        });

        allFoundLeads.push(...leadsForQuery);
      }
    }

    // 4. If no real leads found, return clear message (never return mock data)
    if (allFoundLeads.length === 0) {
      const hasGoogleApi = !!(googleApiKey && googleCseId);
      const msg = hasGoogleApi
        ? "Nenhum lead encontrado para essa busca. Tente palavras-chave ou cidades diferentes."
        : "Nenhum lead encontrado na base de dados para essa categoria/cidade. Configure a API do Google Custom Search para buscar novos leads.";
      return NextResponse.json({ leads: [], limitReached: false, message: msg });
    }

    // 5. Trim to requested target limit
    let deliveredLeads = allFoundLeads;
    if (allFoundLeads.length > targetLimit) {
      deliveredLeads = allFoundLeads.slice(0, targetLimit);
    }

    // 6. Insert into user_leads
    const userLeadsToInsert = deliveredLeads.map((l: any) => ({
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

    // 7. Debit balance
    const newUsed = profile.leads_used_this_cycle + deliveredLeads.length;
    const { error: updateErr } = await (supabase.from("profiles") as any)
      .update({ leads_used_this_cycle: newUsed })
      .eq("id", userId);

    if (updateErr) {
      console.error("Erro ao debitar créditos:", updateErr.message);
    }

    // 8. Write usage log
    const usageLogs = keywords.map((k: string) => ({
      user_id: userId,
      leads_count: Math.ceil(deliveredLeads.length / keywords.length),
      search_keyword: k,
      search_location: (locations || []).join(", "),
      source: source === "google" ? "google_api" : source === "instagram" ? "instagram" : "tiktok"
    }));
    await (supabase.from("lead_usage_log") as any).insert(usageLogs);

    // 9. Write api cost log for admin
    await (supabase.from("api_cost_log") as any).insert({
      user_id: userId,
      keyword: keywords.join(", "),
      city: (locations || []).join(", "),
      calls_made: 1,
      results_returned: deliveredLeads.length,
      estimated_cost_usd: googleApiKey && googleCseId ? 0.10 : 0.00
    });

    return NextResponse.json({
      leads: insertedUserLeads,
      limitReached: allFoundLeads.length > targetLimit,
      addedCount: deliveredLeads.length,
      totalFound: allFoundLeads.length
    });
  } catch (err: any) {
    console.error("Erro na busca de leads:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


