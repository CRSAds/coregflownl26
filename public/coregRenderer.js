/**
 * ✅ coregRenderer.js — Hersteld voor Dynamische Opties & Flow
 */
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
  const container = document.getElementById("coreg-container");
  if (!container) return;

  const campaigns = await fetchCampaigns();
  if (!campaigns.length) {
    document.dispatchEvent(new Event("coregFinished"));
    return;
  }
  
  container.innerHTML = `<div id="coreg-sections"></div>`;
  const sectionsContainer = container.querySelector("#coreg-sections");

  campaigns.forEach((camp, idx) => {
    sectionsContainer.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  container.onclick = async (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip, .coreg-dropdown");
    if (!btn || e.target.tagName === 'SELECT') return;

    const section = btn.closest(".coreg-section");
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

  // Check voor dropdown stijl of buttons
  const isDropdown = campaign.ui_style === "dropdown";
  const answers = campaign.coreg_answers || [];

  let interactiveHtml = "";

  if (isDropdown) {
    interactiveHtml = `
      <select class="coreg-dropdown" data-campaign="${campaign.id}">
        <option value="">Maak een keuze...</option>
        ${answers.map(a => `<option value="${a.answer_value}">${a.label}</option>`).join("")}
      </select>
      <button class="cta-primary btn-answer mt-10" data-answer="dropdown-val">Verstuur</button>
    `;
  } else {
    interactiveHtml = `
      <div class="coreg-answers">
        ${answers.map(a => `
          <button class="cta-primary btn-answer" data-answer="${a.answer_value}">${a.label}</button>
        `).join("")}
        <button class="btn-skip" data-answer="no">Nee, bedankt</button>
      </div>
    `;
  }

  return `
    <div class="coreg-section" data-cid="${campaign.cid}" style="display: ${isFirst ? 'block' : 'none'}">
      <img src="${imageUrl}" class="coreg-image" alt="${campaign.title}">
      <h3>${campaign.title}</h3>
      <p>${campaign.description || ""}</p>
      ${interactiveHtml}
    </div>`;
}

window.initCoregFlow = initCoregFlow;
