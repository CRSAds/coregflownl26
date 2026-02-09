import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  // 1. Probeer eerst ALLEEN de collectie info op te halen (zonder filters)
  // Dit checkt of de collectie 'campaign_layouts' überhaupt bestaat en toegankelijk is.
  const baseUrl = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;
  
  console.log("🔍 Testing Directus Connection...");
  console.log("👉 URL:", baseUrl);
  // (We loggen het token niet voor veiligheid, maar checken lengte)
  console.log("👉 Token length:", token ? token.length : "MISSING");

  try {
    // TEST 1: Haal 1 item op ZONDER filters (werkt dit?)
    const simpleUrl = `${baseUrl}/items/campaign_layouts?limit=1`;
    console.log("👉 Attempting Simple Fetch:", simpleUrl);
    
    const simpleRes = await fetch(simpleUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!simpleRes.ok) {
      const errText = await simpleRes.text();
      console.error("❌ Simple Fetch Failed:", simpleRes.status, errText);
      return res.status(500).json({ 
        error: "Simple fetch failed", 
        status: simpleRes.status, 
        details: errText 
      });
    }

    const simpleJson = await simpleRes.json();
    console.log("✅ Simple Fetch Success! Data keys:", Object.keys(simpleJson.data[0] || {}));

    // TEST 2: Als dat werkt, is het waarschijnlijk een veld-naam probleem.
    // Laten we de originele URL proberen en de foutmelding vangen.
    const fullUrl =
      `${baseUrl}/items/campaign_layouts` +
      `?filter[is_live][_eq]=true` +
      `&filter[_or][0][country][_null]=true` +
      `&filter[_or][1][country][_eq]=NL` +
      `&fields=slug,title,paragraph,hero_image.id,horizontal_hero_image.id,background_image.id,ivr_image.id`;

    console.log("👉 Attempting Full Fetch:", fullUrl);

    const fullRes = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!fullRes.ok) {
      const errText = await fullRes.text();
      console.error("❌ Full Fetch Failed (400 means field name error):", errText);
      return res.status(500).json({ 
        error: "Full fetch failed (probably wrong field name)", 
        status: fullRes.status, 
        details: errText 
      });
    }

    const json = await fullRes.json();
    return res.status(200).json(json);

  } catch (err) {
    console.error("💥 CRASH:", err);
    return res.status(500).json({ error: err.message });
  }
}
