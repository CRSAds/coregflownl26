import { fetchWithRetry } from "./utils/fetchDirectus.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { slug } = req.query; // De slug die door initFlow-lite wordt meegestuurd
    
    // We halen nu ook flow_steps en theme op uit dezelfde collectie
    const url = `${process.env.DIRECTUS_URL}/items/campaign_layouts` +
      `?filter[slug][_eq]=${slug}` +
      `&filter[is_live][_eq]=true` +
      `&fields=slug,title,paragraph,hero_image.id,horizontal_hero_image.id,background_image.id,ivr_image.id,flow_steps,theme`;

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    if (!json.data || json.data.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const v = json.data[0];
    
    // Normaliseer de stappen naar een array
    const stepsArray = v.flow_steps ? v.flow_steps.split(",").map(s => s.trim()) : ["lander", "shortform", "coreg", "sovendus"];

    return res.status(200).json({
      data: {
        slug: v.slug || "",
        title: v.title || "",
        paragraph: v.paragraph || "",
        hero_image: v.hero_image?.id ? `https://cms.core.909play.com/assets/${v.hero_image.id}` : null,
        flow: stepsArray,
        theme: v.theme || "light"
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
