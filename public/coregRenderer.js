// =============================================================
// ✅ coregRenderer.js — Herstelde Versie
// =============================================================

// Helper-functie om de coreg-campagnes op te halen bij de API
async function fetchCampaigns() {
  try {
    const res = await fetch("/api/coreg.js", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("❌ Coreg fetch error:", err);
    return [];
  }
}

async function initCoregFlow() {
  console.log("🎯 Coreg Renderer gestart");
  const container = document.getElementById("coreg-container");
  if (!container) return;

  const campaigns = await fetchCampaigns();
  if (!campaigns.length) {
    console.warn("⚠️ Geen coreg campagnes gevonden.");
    document.dispatchEvent(new Event("coregFinished"));
    return;
  }
  
  container.innerHTML = `<div id="coreg-sections"></div>`;
  const sectionsContainer = container.querySelector("#coreg-sections");

  campaigns.forEach((camp, idx) => {
    sectionsContainer.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  // Event delegation voor interactie
  container.onclick = async (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;

    const section = btn.closest(".coreg-section");
    
    // Logica voor antwoord opslaan (voorbeeld)
    console.log(`✅ Antwoord voor ${btn.dataset.campaign}: ${btn.dataset.answer}`);

    const nextSection = section.nextElementSibling;
    if (nextSection) {
      section.style.display = "none";
      nextSection.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.log("🏁 Coreg flow afgerond");
      document.dispatchEvent(new Event("coregFinished"));
    }
  };
}

function renderCampaignBlock(campaign, isFirst) {
  const imageUrl = campaign.image?.id 
    ? `https://cms.core.909play.com/assets/${campaign.image.id}` 
    : "https://via.placeholder.com/600x300";

  return `
    <div class="coreg-section" data-cid="${campaign.cid}" style="display: ${isFirst ? 'block' : 'none'}">
      <img src="${imageUrl}" class="coreg-image" alt="${campaign.title}">
      <h3>${campaign.title}</h3>
      <p>${campaign.description || ""}</p>
      <div class="coreg-answers">
        <button class="cta-primary btn-answer" data-answer="yes" data-campaign="${campaign.id}">Ja</button>
        <button class="btn-skip" data-answer="no" data-campaign="${campaign.id}">Nee</button>
      </div>
    </div>`;
}

window.initCoregFlow = initCoregFlow;
