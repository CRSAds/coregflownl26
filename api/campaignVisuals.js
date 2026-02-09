import { fetchWithRetry } from "./utils/fetchDirectus.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { slug } = req.query; // Pakt 'centerparcsenmeer' uit de URL
    
    const url = new URL(`${process.env.DIRECTUS_URL}/items/campaign_layouts`);
    url.searchParams.append("filter[slug][_eq]", slug || 'home');
    url.searchParams.append("filter[is_live][_eq]", "true");
    url.searchParams.append("fields", "slug,title,paragraph,hero_image.id,flow_steps,theme");

    const json = await fetchWithRetry(url.href, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    if (!json.data || json.data.length === 0) {
      return res.status(404).json({ error: "Campagne niet gevonden" });
    }

    const v = json.data[0];
    return res.status(200).json({
      data: {
        title: v.title || "",
        paragraph: v.paragraph || "",
        theme: v.theme || "light",
        flow: v.flow_steps ? v.flow_steps.split(",").map(s => s.trim()) : ["lander", "shortform", "coreg", "sovendus"],
        hero_image: v.hero_image?.id ? `https://cms.core.909play.com/assets/${v.hero_image.id}` : null
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
