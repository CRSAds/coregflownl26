import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Edge caching (1 uur)
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  try {
    const { slug } = req.query;
    
    // AANGEPAST: We halen nu specifiek flow_steps en theme op uit de Campaign Layouts collectie
    const url = `${process.env.DIRECTUS_URL}/items/campaign_layouts` +
      `?filter[slug][_eq]=${slug || 'home'}` +
      `&filter[is_live][_eq]=true` +
      `&fields=slug,title,paragraph,hero_image.id,horizontal_hero_image.id,background_image.id,ivr_image.id,flow_steps,theme`;

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    if (!json.data || json.data.length === 0) {
      return res.status(404).json({ error: "Geen campagne data gevonden voor deze slug" });
    }

    const v = json.data[0];
    
    // Normaliseer flow_steps naar een array voor de Flow Engine
    const flowArray = v.flow_steps ? v.flow_steps.split(",").map(s => s.trim()) : [];

    const result = {
      slug: v.slug || "",
      title: v.title || "",
      paragraph: v.paragraph || "",
      theme: v.theme || "light",
      flow: flowArray,
      hero_image: v.hero_image?.id ? `https://cms.core.909play.com/assets/${v.hero_image.id}` : null,
      horizontal_hero_image: v.horizontal_hero_image?.id ? `https://cms.core.909play.com/assets/${v.horizontal_hero_image.id}` : null,
      background_image: v.background_image?.id ? `https://cms.core.909play.com/assets/${v.background_image.id}` : null,
      ivr_image: v.ivr_image?.id ? `https://cms.core.909play.com/assets/${v.ivr_image.id}` : null,
    };

    return res.status(200).json({ data: result });

  } catch (err) {
    console.error("❌ Fout bij ophalen visuals/flow:", err);
    return res.status(500).json({ error: err.message });
  }
}
