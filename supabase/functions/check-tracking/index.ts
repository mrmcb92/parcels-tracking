import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { awb, courier } = await req.json();

    if (!awb || !courier) {
      return new Response(JSON.stringify({ error: "Missing awb or courier" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `You are a parcel tracking assistant for Romania. Search the web for the current status of the given AWB number.
Return ONLY a valid JSON object (no markdown, no code, no explanations) with:
- status: exactly one of: "Comandat","In procesare","In tranzit","La livrare","Livrat","Retur"
- lastEvent: last tracking event in Romanian, max 80 chars
- lastLocation: city/location or empty string
If no tracking info found: {"status":"unknown","lastEvent":"Nu s-au găsit informații de tracking","lastLocation":""}`,
        messages: [{ role: "user", content: `Track AWB: ${awb}, courier: ${courier}, Romania. JSON only.` }],
      }),
    });

    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
