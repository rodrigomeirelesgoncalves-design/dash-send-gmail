import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface SheetMetrics {
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  failed: number;
  optOut: number;
}

interface LeadData {
  email: string;
  empresa: string;
  nome?: string;
  site?: string;
  cidade?: string;
  status?: string;
  replied?: boolean;
  leadTag?: string;
  leadResponseText?: string;
  gptResponseText?: string;
}

// Generate JWT for Google API authentication
async function generateJWT(credentials: ServiceAccountCredentials): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = credentials.private_key.replace(/\\n/g, "\n");
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${encodedSignature}`;
}

async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const jwt = await generateJWT(credentials);
  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchSheetData(sheetId: string, accessToken: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error(`Failed to fetch sheet ${sheetId} range ${range}`);
    return [];
  }

  const data = await response.json();
  return data.values || [];
}

function parseMetrics(data: string[][]): SheetMetrics {
  const metrics: SheetMetrics = { sent: 0, opened: 0, replied: 0, bounced: 0, failed: 0, optOut: 0 };
  if (data.length === 0) return metrics;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    for (const cell of row) {
      if (!cell) continue;
      const cellLower = cell.toLowerCase().trim();
      if (cellLower === "sent" || cellLower === "enviado") metrics.sent++;
      else if (cellLower === "opened" || cellLower === "aberto") metrics.opened++;
      else if (cellLower === "replied" || cellLower === "respondido") metrics.replied++;
      else if (cellLower === "bounced" || cellLower === "devolvido") metrics.bounced++;
      else if (cellLower === "failed" || cellLower === "erro" || cellLower === "error") metrics.failed++;
      else if (cellLower === "optout" || cellLower === "opt-out" || cellLower === "unsubscribed") metrics.optOut++;
    }
  }

  if (metrics.sent === 0 && data.length > 1) {
    metrics.sent = data.length - 1;
  }

  return metrics;
}

function parseLeads(data: string[][]): LeadData[] {
  const leads: LeadData[] = [];
  if (data.length <= 1) return leads;

  const headers = data[0]?.map((h) => h?.toLowerCase()?.trim() || "") || [];
  
  const findCol = (names: string[]) => headers.findIndex(h => names.some(n => h.includes(n)));
  
  const emailIdx = findCol(["email"]);
  const empresaIdx = findCol(["empresa", "company"]);
  const nomeIdx = findCol(["nome", "name"]);
  const siteIdx = findCol(["site", "website", "url"]);
  const cidadeIdx = findCol(["cidade", "city"]);
  const statusIdx = findCol(["status"]);
  const repliedIdx = findCol(["replied"]);
  const leadTagIdx = findCol(["lead_tag"]);
  const leadResponseIdx = findCol(["lead_response_text"]);
  const gptResponseIdx = findCol(["gpt_response_text"]);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    const email = row[emailIdx] || row[0] || "";
    if (!email || !email.includes("@")) continue;

    leads.push({
      email: email.trim(),
      empresa: (row[empresaIdx] || row[1] || "").trim(),
      nome: nomeIdx >= 0 ? row[nomeIdx]?.trim() : undefined,
      site: siteIdx >= 0 ? row[siteIdx]?.trim() : undefined,
      cidade: cidadeIdx >= 0 ? row[cidadeIdx]?.trim() : undefined,
      status: statusIdx >= 0 ? row[statusIdx]?.trim() : undefined,
      replied: repliedIdx >= 0 ? row[repliedIdx]?.toUpperCase() === "YES" : false,
      leadTag: leadTagIdx >= 0 ? row[leadTagIdx]?.trim() : undefined,
      leadResponseText: leadResponseIdx >= 0 ? row[leadResponseIdx]?.trim() : undefined,
      gptResponseText: gptResponseIdx >= 0 ? row[gptResponseIdx]?.trim() : undefined,
    });
  }

  return leads;
}

async function classifyWithAI(responseText: string, empresa: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return "INDEFINIDO";

  const prompt = `Você é um especialista em análise de respostas de prospecção B2B.

RESPOSTA DO LEAD:
"${responseText.slice(0, 1000)}"

EMPRESA: ${empresa}

TAREFA:
Classifique esta resposta em UMA das seguintes categorias:
1. INTERESSE - Lead demonstra interesse claro, quer mais informações, agenda reunião, pede proposta
2. DESINTERESSE - Lead recusa claramente, não tem interesse, não é o momento
3. CURIOSO - Lead faz perguntas, quer entender melhor, mas não demonstrou interesse claro ainda
4. DÚVIDA - Lead tem objeções, preocupações ou perguntas técnicas/comerciais
5. OPT_OUT - Lead pede para remover da lista, descadastrar, parar de enviar emails
6. REDIRECIONAMENTO - Lead indica outra pessoa/departamento responsável
7. FORA_DO_ESCRITÓRIO - Mensagem automática de férias/ausência

Responda APENAS com a tag correspondente (ex: INTERESSE, DESINTERESSE, etc).`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 50,
      }),
    });

    if (!response.ok) return "INDEFINIDO";
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim()?.toUpperCase() || "INDEFINIDO";
  } catch (e) {
    console.error("AI classification error:", e);
    return "INDEFINIDO";
  }
}

async function generateAIResponse(leadMessage: string, empresa: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;

  const prompt = `Você é Rodrigo Meireles, especialista em Google Meu Negócio.

MENSAGEM DO LEAD (${empresa}):
"${leadMessage.slice(0, 1000)}"

CONTEXTO:
- Você enviou um email oferecendo ajuda com o perfil do Google Meu Negócio
- Sua abordagem é consultiva, não agressiva
- Foque em gerar valor e agendar uma conversa rápida

OBJETIVO:
Responda de forma natural, profissional e personalizada.

REGRAS:
1. Se o lead perguntar mais detalhes, explique brevemente o serviço
2. Se o lead indicar outra pessoa, agradeça e pergunte como contactar
3. Se o lead demonstrar interesse, tente agendar uma call de 15min
4. Se o lead pedir para sair da lista, peça desculpas e confirme a remoção
5. Seja conciso (máximo 5 linhas)
6. Use tom amigável mas profissional
7. NÃO use assinatura (será adicionada automaticamente)

Responda APENAS com o texto do email:`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("AI response generation error:", e);
    return null;
  }
}

async function sendTelegramAlert(message: string, chatId: string) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token || !chatId) {
    console.log("Telegram not configured");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("Telegram error:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      throw new Error("Service account credentials not configured");
    }

    const credentials: ServiceAccountCredentials = JSON.parse(serviceAccountJson);
    const accessToken = await getAccessToken(credentials);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: satellites, error: satellitesError } = await supabase
      .from("satellites")
      .select("*")
      .eq("is_active", true);

    if (satellitesError) {
      throw new Error(`Failed to fetch satellites: ${satellitesError.message}`);
    }

    const results = [];
    const telegramLeadsChatId = Deno.env.get("TELEGRAM_CHAT_ID_LEADS");
    const telegramGptChatId = Deno.env.get("TELEGRAM_CHAT_ID_GPT");

    for (const satellite of satellites || []) {
      try {
        // Fetch LEADS sheet
        const leadsData = await fetchSheetData(satellite.sheet_id, accessToken, "LEADS!A:Z");
        const metrics = parseMetrics(leadsData);
        const leads = parseLeads(leadsData);

        // Insert metrics
        await supabase.from("satellite_metrics").insert({
          satellite_id: satellite.id,
          sent: metrics.sent,
          opened: metrics.opened,
          replied: metrics.replied,
          bounced: metrics.bounced,
          failed: metrics.failed,
          opt_out: metrics.optOut,
        });

        // Process leads with replies
        for (const lead of leads) {
          if (!lead.replied || !lead.leadResponseText) continue;

          // Check if response already exists
          const { data: existingResponse } = await supabase
            .from("email_responses")
            .select("id")
            .eq("satellite_id", satellite.id)
            .eq("recipient_email", lead.email)
            .limit(1);

          if (existingResponse && existingResponse.length > 0) continue;

          // Classify with AI if no tag
          let tag = lead.leadTag;
          if (!tag || tag === "") {
            tag = await classifyWithAI(lead.leadResponseText, lead.empresa);
          }

          // Generate GPT response if none exists
          let gptResponse = lead.gptResponseText;
          if (!gptResponse && lead.leadResponseText) {
            gptResponse = await generateAIResponse(lead.leadResponseText, lead.empresa) || undefined;
          }

          // Insert response
          const { data: insertedResponse } = await supabase.from("email_responses").insert({
            satellite_id: satellite.id,
            sender_email: satellite.alias,
            recipient_email: lead.email,
            response_content: lead.leadResponseText,
            lead_name: lead.nome,
            lead_company: lead.empresa,
            lead_website: lead.site,
            lead_city: lead.cidade,
            lead_tag: tag,
            gpt_response: gptResponse,
            gpt_responded_at: gptResponse ? new Date().toISOString() : null,
          }).select().single();

          // Send Telegram alerts
          if (telegramLeadsChatId) {
            await sendTelegramAlert(
              `🔔 *NOVA RESPOSTA*\n🏢 *Empresa:* ${lead.empresa}\n📧 *Email:* ${lead.email}\n🏷 *Tag:* ${tag}\n📝 *Trecho:* _${lead.leadResponseText?.slice(0, 200)}..._`,
              telegramLeadsChatId
            );
          }

          if (gptResponse && telegramGptChatId) {
            await sendTelegramAlert(
              `🤖 *GPT RESPONDEU*\n🏢 *Empresa:* ${lead.empresa}\n📧 *Email:* ${lead.email}\n🏷 *Tag:* ${tag}\n💬 *Resposta:* _${gptResponse.slice(0, 250)}..._`,
              telegramGptChatId
            );
          }

          // Create dossiê request if INTERESSE
          if (tag === "INTERESSE" && insertedResponse) {
            await supabase.from("dossie_requests").insert({
              satellite_id: satellite.id,
              lead_email: lead.email,
              lead_name: lead.nome,
              lead_company: lead.empresa,
              lead_website: lead.site,
              lead_city: lead.cidade,
              response_id: insertedResponse.id,
              status: "PENDENTE",
            });
          }
        }

        results.push({ satellite: satellite.alias, metrics, leadsProcessed: leads.filter(l => l.replied).length, success: true });
      } catch (e) {
        console.error(`Error processing ${satellite.alias}:`, e);
        results.push({ satellite: satellite.alias, error: (e as Error).message, success: false });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
