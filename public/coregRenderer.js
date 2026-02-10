async function initCoregFlow() {
  const container = document.getElementById("coreg-container");
  if (!container) return;

  const campaigns = await fetchCampaigns();
  if (!campaigns.length) {
    document.dispatchEvent(new Event("coregFinished"));
    return;
  }
  
  container.innerHTML = '<div id="coreg-sections"></div>';
  const sectionsContainer = document.getElementById("coreg-sections");

  campaigns.forEach((camp, idx) => {
    sectionsContainer.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  sectionsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;

    const section = btn.closest(".coreg-section");
    const next = section.nextElementSibling;
    
    if (next) {
      section.style.display = "none";
      next.style.display = "block";
      window.scrollTo(0, 0);
    } else {
      document.dispatchEvent(new Event("coregFinished"));
    }
  });

  sectionsContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("coreg-dropdown")) {
      const section = e.target.closest(".coreg-section");
      const next = section.nextElementSibling;
      if (next) {
        section.style.display = "none";
        next.style.display = "block";
      } else {
        document.dispatchEvent(new Event("coregFinished"));
      }
    }
  });
}

async function fetchCampaigns() {
  try {
    const res = await fetch("/api/coreg.js", { cache: "no-store" });
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

function renderCampaignBlock(campaign, isFirst) {
  const isDropdown = campaign.ui_style === "dropdown";
  const answers = campaign.coreg_answers || [];
  
  let interactiveHtml = "";
  if (isDropdown) {
    interactiveHtml = `
      <select class="coreg-dropdown" data-campaign="${campaign.id}">
        <option value="">Maak een keuze...</option>
        ${answers.map(a => `<option value="${a.answer_value}">${a.label}</option>`).join("")}
      </select>`;
  } else {
    interactiveHtml = `
      <div class="coreg-answers">
        ${answers.map(a => `<button class="btn-answer" data-answer="${a.answer_value}">${a.label}</button>`).join("")}
      </div>`;
  }

  return `
    <div class="coreg-section" style="display: ${isFirst ? 'block' : 'none'}">
      <img src="https://cms.core.909play.com/assets/${campaign.image?.id}" class="coreg-image">
      <h3 class="coreg-title">${campaign.title}</h3>
      <p class="coreg-description">${campaign.description || ""}</p>
      ${interactiveHtml}
      <button class="btn-skip">Nee, bedankt</button>
    </div>`;
}

window.initCoregFlow = initCoregFlow;
