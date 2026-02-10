/**
 * ✅ coregRenderer.js — Headless NL Fix (Full Width Skip)
 */

async function fetchCampaigns() {
  try {
    const res = await fetch("/api/coreg.js", { cache: "no-store" });
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
  
  // Zorg dat we in een schone container werken
  container.innerHTML = '<div id="coreg-sections"></div>';
  const sectionsContainer = document.getElementById("coreg-sections");

  campaigns.forEach((camp, idx) => {
    sectionsContainer.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  // Central Click Listener
  sectionsContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;

    const section = btn.closest(".coreg-section");
    const nextStep = section.nextElementSibling;
    
    // Opslaan van antwoord
    if (btn.classList.contains("btn-answer")) {
      const campId = btn.dataset.campaign;
      const val = btn.dataset.answer;
      sessionStorage.setItem(`f_2014_coreg_answer_${campId}`, val);
    }

    if (nextStep) {
      section.style.display = "none";
      nextStep.style.display = "block";
      window.scrollTo(0, 0);
    } else {
      document.dispatchEvent(new Event("coregFinished"));
    }
  });

  // Dropdown Listener
  sectionsContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("coreg-dropdown")) {
      const select = e.target;
      if (!select.value) return;

      const section = select.closest(".coreg-section");
      sessionStorage.setItem(`f_2575_coreg_answer_dropdown_${select.dataset.campaign}`, select.value);
      
      const nextStep = section.nextElementSibling;
      if (nextStep) {
        section.style.display = "none";
        nextStep.style.display = "block";
        window.scrollTo(0, 0);
      } else {
        document.dispatchEvent(new Event("coregFinished"));
      }
    }
  });
}

function renderCampaignBlock(campaign, isFirst) {
  const imageUrl = campaign.image?.id 
    ? `https://cms.core.909play.com/assets/${campaign.image.id}` 
    : "https://via.placeholder.com/700x200";

  const isDropdown = campaign.ui_style === "dropdown";
  const answers = campaign.coreg_answers || [];

  let interactiveHtml = "";

  if (isDropdown) {
    interactiveHtml = `
      <div class="coreg-answers">
        <select class="coreg-dropdown" data-campaign="${campaign.id}">
          <option value="">Maak een keuze...</option>
          ${answers.map(a => `<option value="${a.answer_value}">${a.label}</option>`).join("")}
        </select>
        <button type="button" class="btn-skip" data-campaign="${campaign.id}" data-answer="no">Nee, bedankt</button>
      </div>
    `;
  } else {
    interactiveHtml = `
      <div class="coreg-answers">
        ${answers.map(a => `
          <button type="button" class="btn-answer" data-campaign="${campaign.id}" data-answer="${a.answer_value}">${a.label}</button>
        `).join("")}
        <button type="button" class="btn-skip" data-campaign="${campaign.id}" data-answer="no">Nee, bedankt</button>
      </div>
    `;
  }

  return `
    <div class="coreg-section" id="campaign-${campaign.id}" style="display: ${isFirst ? 'block' : 'none'}">
      <img src="${imageUrl}" class="coreg-image" alt="${campaign.title}">
      <h3 class="coreg-title">${campaign.title}</h3>
      <p class="coreg-description">${campaign.description || ""}</p>
      ${interactiveHtml}
    </div>`;
}

window.initCoregFlow = initCoregFlow;
