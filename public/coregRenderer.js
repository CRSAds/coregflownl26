// =============================================================
// ✅ coregRenderer.js — Headless Versie
// =============================================================

async function initCoregFlow() {
  console.log("🎯 Coreg Renderer gestart");
  const container = document.getElementById("coreg-container");
  if (!container) return;

  // Haal campagnes op (bestaande API call)
  const campaigns = await fetchCampaigns();
  
  // Progress bar logica is nu simpeler (Flow Engine regelt het totaal)
  container.innerHTML = `<div id="coreg-sections"></div>`;
  const sectionsContainer = container.querySelector("#coreg-sections");

  campaigns.forEach((camp, idx) => {
    sectionsContainer.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  // Event delegation voor antwoorden
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;

    const section = btn.closest(".coreg-section");
    const isNegative = btn.classList.contains("btn-skip") || btn.dataset.answer === "no";
    
    // Antwoord opslaan logic...
    console.log("✅ Antwoord geregistreerd:", btn.dataset.answer);

    // Navigatie naar volgende coreg of volgende stap
    const nextSection = section.nextElementSibling;
    if (nextSection) {
      section.style.display = "none";
      nextSection.style.display = "block";
      window.scrollTo(0, 0); // Natuurlijke scroll
    } else {
      console.log("🏁 Alle coregs beantwoord.");
      document.dispatchEvent(new Event("coregFinished"));
    }
  });
}

function renderCampaignBlock(campaign, isFirst) {
  return `
    <div class="coreg-section" data-cid="${campaign.cid}" style="display: ${isFirst ? 'block' : 'none'}">
      <img src="${campaign.image}" class="coreg-image">
      <h3>${campaign.title}</h3>
      <p>${campaign.description}</p>
      <div class="coreg-answers">
        <button class="btn-answer cta-primary" data-answer="yes" data-campaign="${campaign.id}">Ja</button>
        <button class="btn-skip" data-answer="no" data-campaign="${campaign.id}">Nee</button>
      </div>
    </div>`;
}

// Global hook voor Flow Engine
window.initCoregFlow = initCoregFlow;
