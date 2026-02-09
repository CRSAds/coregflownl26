import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  try {
    const { slug } = req.query;
    
    // We halen de data op uit campaign_layouts inclusief flow en theme
    const url = `${process.env.DIRECTUS_URL}/items/campaign_layouts` +
      `?filter[slug][_eq]=${slug || 'home'}` +
      `&filter[is_live][_eq]=true` +
      `&fields=slug,title,paragraph,hero_image.id,horizontal_hero_image.id,background_image.id,ivr_image.id,flow_steps,theme`;

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    if (!json.data || json.data.length === 0) {
      return res.status(404).json({ error: "Geen campagne data gevonden" });
    }

    const v = json.data[0];
    
    // Zet de flow_steps string om naar een array voor de Flow Engine
    const flowArray = v.flow_steps ? v.flow_steps.split(",").map(s => s.trim()) : [];

    return res.status(200).json({
      data: {
        slug: v.slug || "",
        title: v.title || "",
        paragraph: v.paragraph || "",
        theme: v.theme || "light",
        flow: flowArray,
        hero_image: v.hero_image?.id ? `https://cms.core.909play.com/assets/${v.hero_image.id}` : null,
        horizontal_hero_image: v.horizontal_hero_image?.id ? `https://cms.core.909play.com/assets/${v.horizontal_hero_image.id}` : null,
        background_image: v.background_image?.id ? `https://cms.core.909play.com/assets/${v.background_image.id}` : null,
        ivr_image: v.ivr_image?.id ? `https://cms.core.909play.com/assets/${v.ivr_image.id}` : null
      }
    });

  } catch (err) {
    console.error("❌ Fout bij ophalen visuals:", err);
    return res.status(500).json({ error: err.message });
  }
}
