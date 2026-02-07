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

async function generateJWT(credentials: ServiceAccountCredentials): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = credentials.private_key.replace(/\\n/g, "\n");
  const pemContents = privateKey.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
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

  if (!response.ok) throw new Error(`Failed to get access token`);
  const data = await response.json();
  return data.access_token;
}

async function triggerAppsScriptWebhook(webUrl: string, action: string): Promise<{ success: boolean; message: string }> {
  if (!webUrl) {
    return { success: false, message: "Web URL não configurada para este satélite" };
  }

  try {
    const url = `${webUrl}?action=${action}`;
    const response = await fetch(url, { method: "GET" });
    
    if (!response.ok) {
      return { success: false, message: `Erro ao acionar: ${response.status}` };
    }

    return { success: true, message: "Ação enviada com sucesso" };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, satelliteId, scheduledFor, maxEmails } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle scheduling
    if (action === "schedule") {
      const { error } = await supabase.from("scheduled_sends").insert({
        satellite_id: satelliteId,
        scheduled_for: scheduledFor,
        max_emails: maxEmails || 100,
        status: "PENDING",
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: "Envio programado com sucesso" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle force send
    if (action === "force_send") {
      const { data: satellite, error: satError } = await supabase
        .from("satellites")
        .select("*")
        .eq("id", satelliteId)
        .single();

      if (satError || !satellite) {
        throw new Error("Satélite não encontrado");
      }

      const result = await triggerAppsScriptWebhook(satellite.web_url, "runCampaignNow");

      // Log the action
      await supabase.from("scheduled_sends").insert({
        satellite_id: satelliteId,
        scheduled_for: new Date().toISOString(),
        max_emails: maxEmails || 100,
        status: result.success ? "EXECUTED" : "FAILED",
        executed_at: new Date().toISOString(),
        result: result,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle sync (fetch data from sheets)
    if (action === "sync") {
      const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
      if (!serviceAccountJson) {
        throw new Error("Service account not configured");
      }

      // Trigger the fetch-sheets-data function
      const fetchUrl = `${supabaseUrl}/functions/v1/fetch-sheets-data`;
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cancel scheduled send
    if (action === "cancel") {
      const { scheduleId } = await req.json();
      const { error } = await supabase
        .from("scheduled_sends")
        .update({ status: "CANCELLED" })
        .eq("id", scheduleId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: "Agendamento cancelado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
