/**
 * ✅ coregRenderer.js — Handelt dynamische vragen af
 */
async function initCoregFlow() {
  const container = document.getElementById("coreg-container");
  if (!container) return;

  // Voorkom dubbel laden
  if (container.hasChildNodes()) return;

  const campaigns = await fetchCampaigns();
  
  // Als er geen campagnes zijn, sla deze stap over
  if (!campaigns.length) {
    document.dispatchEvent(new Event("coregFinished"));
    return;
  }
  
  container.innerHTML = '<div id="coreg-sections-wrapper"></div>';
  const wrapper = document.getElementById("coreg-sections-wrapper");

  // Render alle vragen, maar toon alleen de eerste
  campaigns.forEach((camp, idx) => {
    wrapper.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  // Event Delegation voor antwoorden
  wrapper.addEventListener("click", (e) => {
    // 1. Button antwoord (Ja / Nee)
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;

    handleAnswer(btn.closest(".coreg-section"), btn.dataset.campaign, btn.dataset.answer);
  });

  // Event Delegation voor Dropdowns
  wrapper.addEventListener("change", (e) => {
    if (e.target.classList.contains("coreg-dropdown")) {
      const select = e.target;
      if (!select.value) return; // Niets gekozen
      
      handleAnswer(select.closest(".coreg-section"), select.dataset.campaign, select.value);
    }
  });
}

function handleAnswer(currentSection, campaignId, value) {
  // Opslaan
  sessionStorage.setItem(`coreg_answer_${campaignId}`, value || "no");

  // Volgende vraag tonen
  const next = currentSection.nextElementSibling;
  
  if (next) {
    currentSection.style.display = "none";
    next.style.display = "block";
    // Scroll resetten binnen de kaart indien nodig, of pagina
    window.scrollTo(0,0);
  } else {
    // Klaar met coreg -> naar volgende flow stap
    document.dispatchEvent(new Event("coregFinished"));
  }
}

async function fetchCampaigns() {
  try {
    const res = await fetch("/api/coreg.js", { cache: "no-store" });
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Coreg fetch failed", err);
    return [];
  }
}

function renderCampaignBlock(campaign, isVisible) {
  const isDropdown = campaign.ui_style === "dropdown";
  const answers = campaign.coreg_answers || [];
  
  let interactiveHtml = "";
  
  if (isDropdown) {
    // Custom dropdown structuur
    interactiveHtml = `
      <select class="coreg-dropdown" data-campaign="${campaign.id}">
        <option value="">Maak een keuze...</option>
        ${answers.map(a => `<option value="${a.answer_value}">${a.label}</option>`).join("")}
      </select>`;
  } else {
    // Buttons met 8px gap (geregeld in CSS .coreg-answers)
    interactiveHtml = `
      <div class="coreg-answers">
        ${answers.map(a => `<button class="btn-answer" data-campaign="${campaign.id}" data-answer="${a.answer_value}">${a.label}</button>`).join("")}
      </div>`;
  }

  // Image handling
  const imgUrl = campaign.image?.id 
    ? `https://cms.core.909play.com/assets/${campaign.image.id}` 
    : '';

  return `
    <div class="coreg-section" style="display: ${isVisible ? 'block' : 'none'}; animation: fadeIn 0.3s ease;">
      ${imgUrl ? `<img src="${imgUrl}" class="coreg-image" loading="lazy">` : ''}
      <h3 class="coreg-title">${campaign.title}</h3>
      <p class="coreg-description">${campaign.description || ""}</p>
      
      ${interactiveHtml}
      
      <button class="btn-skip" data-campaign="${campaign.id}" data-answer="no">Nee, bedankt</button>
    </div>`;
}

// Expose aan window voor initFlow-lite.js
window.initCoregFlow = initCoregFlow;
