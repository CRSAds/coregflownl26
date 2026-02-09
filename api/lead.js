/**
 * ✅ /api/lead.js — Lead verzending + Automatische Cap-detectie
 */
import { fetchWithRetry } from "./utils/fetchDirectus.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const payload = req.body;
    
    // 1. Schiet lead in bij Databowl
    const dbResp = await fetch("https://crsadvertising.databowl.com/api/v1/lead", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload).toString()
    });

    const dbResult = await dbResp.json();

    // 2. 🕐 Check op Cap-limiet (Overgenomen van live-versie)
    if (dbResult?.error?.msg === "TOTAL_CAP_REACHED") {
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);

      // Update Directus collecties om kosten te besparen
      const collections = ["coreg_campaigns", "co_sponsors"];
      for (const col of collections) {
        // Zoek ID op basis van CID/SID
        const searchUrl = `${process.env.DIRECTUS_URL}/items/${col}?filter[cid][_eq]=${payload.cid}&fields=id`;
        const searchResp = await fetch(searchUrl, {
          headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` }
        });
        const searchData = await searchResp.json();
        const itemId = searchData.data?.[0]?.id;

        if (itemId) {
          // Zet campagne op 'pauze' in Directus
          await fetch(`${process.env.DIRECTUS_URL}/items/${col}/${itemId}`, {
            method: "PATCH",
            headers: { 
              "Authorization": `Bearer ${process.env.DIRECTUS_TOKEN}`,
              "Content-Type": "application/json" 
            },
            body: JSON.stringify({ is_live: false, paused_until: tomorrow.toISOString() })
          });
        }
      }

      return res.status(200).json({ success: false, message: "Campaign paused: Cap reached" });
    }

    return res.status(200).json({ success: true, data: dbResult });

  } catch (err) {
    console.error("💥 Lead API fout:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
