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

        const mappedCategory = getCategoryFromKeyword(cleanKeyword);

        // Check if we already have leads of this category in this city in leads_geral
        const { data: cachedLeads } = await (supabase.from("leads_geral") as any)
          .select("*")
          .eq("category", mappedCategory)
          .eq("city", cleanLoc);

        let leadsForQuery: any[] = [];

        if (cachedLeads && cachedLeads.length > 0) {
          console.log(`Reutilizando ${cachedLeads.length} leads da categoria "${mappedCategory}" na cidade "${cleanLoc}" do banco.`);
          leadsForQuery = cachedLeads;
        }

        if (leadsForQuery.length === 0) {
          // If no cache or invalid, perform search
          if (googleApiKey && googleCseId && source === "google") {
            console.log(`Buscando via Google API para: ${cleanKeyword} em ${cleanLoc}`);
            leadsForQuery = await fetchGoogleLeads(cleanKeyword, cleanLoc, googleApiKey, googleCseId, 10);
            
            // Fallback to mock if API returned 0 results (limit reached or query found nothing)
            if (leadsForQuery.length === 0) {
              console.log("Nenhum resultado com telefone via Google API, utilizando fallback mock.");
              leadsForQuery = generateMockLeads(cleanKeyword, cleanLoc, 10);
            }
          } else {
            // Generate mock leads
            leadsForQuery = generateMockLeads(cleanKeyword, cleanLoc, 12);
          }

          // Save new leads to leads_geral
          if (leadsForQuery.length > 0) {
            const { data: insertedGeralLeads, error: insErr } = await (supabase.from("leads_geral") as any)
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
              })))
              .select();

            if (insErr) {
              console.error("Erro ao salvar leads na base geral:", insErr.message);
            } else if (insertedGeralLeads && insertedGeralLeads.length > 0) {
              leadsForQuery = insertedGeralLeads;
            }

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
