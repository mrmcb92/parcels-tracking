import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role bypasses RLS
const ANTHROPIC_KEY    = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAWB(pkg) {
  console.log(`Checking AWB ${pkg.awb} (${pkg.courier})...`);

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
      messages: [{ role: "user", content: `Track AWB: ${pkg.awb}, courier: ${pkg.courier}, Romania. JSON only.` }],
    }),
  });

  if (!res.ok) {
    console.error(`Anthropic API error: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");

  try {
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    return result;
  } catch (e) {
    console.error(`JSON parse error for AWB ${pkg.awb}:`, e.message);
    return null;
  }
}

async function main() {
  console.log("=== Parcel Tracking Cron ===");
  console.log(`Started at: ${new Date().toISOString()}`);

  // Fetch all active packages (not delivered or returned)
  const { data: packages, error } = await supabase
    .from("packages")
    .select("id, awb, courier, status")
    .not("status", "in", '("Livrat","Retur")');

  if (error) {
    console.error("Supabase fetch error:", error.message);
    process.exit(1);
  }

  console.log(`Found ${packages.length} active package(s) to check.`);

  let updated = 0;
  let failed  = 0;

  for (const pkg of packages) {
    try {
      const result = await checkAWB(pkg);

      if (!result) { failed++; continue; }

      const updates = {
        last_event:    result.lastEvent    || "",
        last_location: result.lastLocation || "",
        last_checked:  new Date().toISOString(),
        ...(result.status && result.status !== "unknown" ? { status: result.status } : {}),
      };

      const { error: updateError } = await supabase
        .from("packages")
        .update(updates)
        .eq("id", pkg.id);

      if (updateError) {
        console.error(`Update error for ${pkg.awb}:`, updateError.message);
        failed++;
      } else {
        console.log(`✓ ${pkg.awb} → ${result.status || "unchanged"} | ${result.lastEvent}`);
        updated++;
      }
    } catch (err) {
      console.error(`Unexpected error for ${pkg.awb}:`, err.message);
      failed++;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`\nDone. Updated: ${updated} | Failed: ${failed}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
