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

interface EmailResponse {
  senderEmail: string;
  recipientEmail: string;
  responseContent: string;
  receivedAt: string;
}

// Generate JWT for Google API authentication
async function generateJWT(credentials: ServiceAccountCredentials): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

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

  // Import the private key
  const privateKey = credentials.private_key.replace(/\\n/g, "\n");
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
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

// Get access token from Google
async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const jwt = await generateJWT(credentials);

  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Fetch data from Google Sheets
async function fetchSheetData(sheetId: string, accessToken: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch sheet ${sheetId}: ${errorText}`);
    return [];
  }

  const data = await response.json();
  return data.values || [];
}

// Parse metrics from sheet data
function parseMetrics(data: string[][]): SheetMetrics {
  // Default metrics
  const metrics: SheetMetrics = {
    sent: 0,
    opened: 0,
    replied: 0,
    bounced: 0,
    failed: 0,
    optOut: 0,
  };

  if (data.length === 0) return metrics;

  // Try to find headers and parse data
  const headers = data[0]?.map((h) => h?.toLowerCase()?.trim() || "") || [];
  
  // Common column name variations
  const columnMappings: Record<keyof SheetMetrics, string[]> = {
    sent: ["sent", "enviados", "envio", "enviado", "email sent"],
    opened: ["opened", "abertos", "abertura", "aberto", "open", "opens"],
    replied: ["replied", "respondidos", "resposta", "respostas", "reply", "replies"],
    bounced: ["bounced", "bounce", "bounces", "devolvidos", "devolvido"],
    failed: ["failed", "erro", "erros", "error", "errors", "falha", "falhas"],
    optOut: ["optout", "opt-out", "opt out", "descadastro", "unsubscribe", "unsubscribed"],
  };

  // Count rows with specific status values
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    // Check each cell for status indicators
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

  // If no status found, count total rows as sent
  if (metrics.sent === 0 && data.length > 1) {
    metrics.sent = data.length - 1;
  }

  return metrics;
}

// Parse email responses from sheet
function parseResponses(data: string[][], satelliteAlias: string): EmailResponse[] {
  const responses: EmailResponse[] = [];
  
  if (data.length <= 1) return responses;

  const headers = data[0]?.map((h) => h?.toLowerCase()?.trim() || "") || [];
  
  // Find relevant columns
  const senderIdx = headers.findIndex(h => 
    h.includes("sender") || h.includes("remetente") || h.includes("from") || h.includes("de")
  );
  const recipientIdx = headers.findIndex(h => 
    h.includes("recipient") || h.includes("destinatario") || h.includes("to") || h.includes("para") || h.includes("email")
  );
  const contentIdx = headers.findIndex(h => 
    h.includes("response") || h.includes("resposta") || h.includes("content") || h.includes("conteudo") || h.includes("body")
  );
  const dateIdx = headers.findIndex(h => 
    h.includes("date") || h.includes("data") || h.includes("received") || h.includes("recebido")
  );

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    const response: EmailResponse = {
      senderEmail: row[senderIdx] || row[0] || "",
      recipientEmail: row[recipientIdx] || row[1] || "",
      responseContent: row[contentIdx] || row[2] || "",
      receivedAt: row[dateIdx] || new Date().toISOString(),
    };

    if (response.senderEmail && response.recipientEmail) {
      responses.push(response);
    }
  }

  return responses;
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

    // Get all active satellites
    const { data: satellites, error: satellitesError } = await supabase
      .from("satellites")
      .select("*")
      .eq("is_active", true);

    if (satellitesError) {
      throw new Error(`Failed to fetch satellites: ${satellitesError.message}`);
    }

    const results = [];

    for (const satellite of satellites || []) {
      try {
        // Fetch metrics from "Métricas" or main sheet
        const metricsData = await fetchSheetData(satellite.sheet_id, accessToken, "A:Z");
        const metrics = parseMetrics(metricsData);

        // Insert metrics record
        const { error: metricsError } = await supabase.from("satellite_metrics").insert({
          satellite_id: satellite.id,
          sent: metrics.sent,
          opened: metrics.opened,
          replied: metrics.replied,
          bounced: metrics.bounced,
          failed: metrics.failed,
          opt_out: metrics.optOut,
        });

        if (metricsError) {
          console.error(`Failed to insert metrics for ${satellite.alias}: ${metricsError.message}`);
        }

        // Try to fetch responses from "Respostas" sheet
        try {
          const responsesData = await fetchSheetData(satellite.sheet_id, accessToken, "Respostas!A:Z");
          const responses = parseResponses(responsesData, satellite.alias);

          for (const response of responses) {
            await supabase.from("email_responses").insert({
              satellite_id: satellite.id,
              sender_email: response.senderEmail,
              recipient_email: response.recipientEmail,
              response_content: response.responseContent,
              received_at: new Date(response.receivedAt).toISOString(),
            });
          }
        } catch (e) {
          console.log(`No responses sheet for ${satellite.alias}`);
        }

        results.push({
          satellite: satellite.alias,
          metrics,
          success: true,
        });
      } catch (e) {
        console.error(`Error processing ${satellite.alias}: ${e.message}`);
        results.push({
          satellite: satellite.alias,
          error: e.message,
          success: false,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
