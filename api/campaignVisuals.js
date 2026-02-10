import { fetchWithRetry } from "./utils/fetchDirectus.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { slug } = req.query;
    const url = `${process.env.DIRECTUS_URL}/items/campaign_layouts` +
                `?filter[slug][_eq]=${slug || 'home'}` +
                `&fields=slug,title,paragraph,hero_image.id,background_image.id,flow_steps,theme`;

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    if (!json.data?.length) return res.status(404).json({ error: "Niet gevonden" });

    const v = json.data[0];
    return res.status(200).json({
      data: {
        title: v.title,
        paragraph: v.paragraph,
        theme: v.theme || "light",
        flow: v.flow_steps ? v.flow_steps.split(",").map(s => s.trim()) : [],
        hero_image: v.hero_image ? `https://cms.core.909play.com/assets/${v.hero_image.id}` : null,
        background_image: v.background_image ? `https://cms.core.909play.com/assets/${v.background_image.id}` : null
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
