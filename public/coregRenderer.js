/**
 * ✅ coregRenderer.js — Headless NL Fix
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
  
  const sectionsContainer = document.getElementById("coreg-sections") || container;
  sectionsContainer.innerHTML = "";

  campaigns.forEach((camp, idx) => {
    sectionsContainer.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  // 🖱️ Central Event Listener
  sectionsContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;

    const section = btn.closest(".coreg-section");
    const nextStep = section.nextElementSibling;
    
    // Antwoord opslaan (als het geen skip is)
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

  // ⬇️ 4. Dropdown direct antwoorden bij selectie
  sectionsContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("coreg-dropdown")) {
      const select = e.target;
      if (!select.value) return;

      const section = select.closest(".coreg-section");
      const campId = select.dataset.campaign;
      
      // Opslaan
      sessionStorage.setItem(`f_2575_coreg_answer_dropdown_${campId}`, select.value);
      
      // Direct door naar volgende
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
    : "https://via.placeholder.com/600x300";

  const isDropdown = campaign.ui_style === "dropdown";
  const answers = campaign.coreg_answers || [];

  let interactiveHtml = "";

  if (isDropdown) {
    // ⬇️ 4. Geen extra button nodig bij dropdown
    interactiveHtml = `
      <select class="coreg-dropdown" data-campaign="${campaign.id}">
        <option value="">Maak een keuze...</option>
        ${answers.map(a => `<option value="${a.answer_value}">${a.label}</option>`).join("")}
      </select>
    `;
  } else {
    // 🟢 1. Spacing wordt door CSS gap geregeld
    interactiveHtml = `
      <div class="coreg-answers">
        ${answers.map(a => `
          <button type="button" class="btn-answer" data-campaign="${campaign.id}" data-answer="${a.answer_value}">${a.label}</button>
        `).join("")}
      </div>
    `;
  }

  // ⚪ 3. Nee button altijd toevoegen, ook bij dropdown
  const skipButton = `<button type="button" class="btn-skip" data-campaign="${campaign.id}" data-answer="no">Nee, bedankt</button>`;

  return `
    <div class="coreg-section" id="campaign-${campaign.id}" style="display: ${isFirst ? 'block' : 'none'}">
      <img src="${imageUrl}" class="coreg-image" alt="${campaign.title}">
      <h3 class="coreg-title">${campaign.title}</h3>
      <p class="coreg-description">${campaign.description || ""}</p>
      ${interactiveHtml}
      ${skipButton}
    </div>`;
}

window.initCoregFlow = initCoregFlow;
