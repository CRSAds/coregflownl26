/**
 * ✅ coregRenderer.js — Vloeiende transities tussen vragen
 */
async function initCoregFlow() {
  const container = document.getElementById("coreg-container");
  if (!container || container.hasChildNodes()) return;

  const campaigns = await fetchCampaigns();
  if (!campaigns.length) {
    document.dispatchEvent(new Event("coregFinished"));
    return;
  }
  
  container.innerHTML = '<div id="coreg-sections-wrapper"></div>';
  const wrapper = document.getElementById("coreg-sections-wrapper");

  campaigns.forEach((camp, idx) => {
    wrapper.innerHTML += renderCampaignBlock(camp, idx === 0);
  });

  wrapper.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-answer, .btn-skip");
    if (!btn) return;
    handleAnswer(btn.closest(".coreg-section"), btn.dataset.campaign, btn.dataset.answer);
  });

  wrapper.addEventListener("change", (e) => {
    if (e.target.classList.contains("coreg-dropdown") && e.target.value) {
      handleAnswer(e.target.closest(".coreg-section"), e.target.dataset.campaign, e.target.value);
    }
  });
}

function handleAnswer(currentSection, campaignId, value) {
  sessionStorage.setItem(`coreg_answer_${campaignId}`, value || "no");

  const next = currentSection.nextElementSibling;
  
  if (next) {
    // Vloeiende overgang tussen coreg vragen
    currentSection.style.opacity = "0";
    currentSection.style.transform = "translateX(-20px)";
    
    setTimeout(() => {
      currentSection.style.display = "none";
      next.style.display = "block";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  } else {
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
  
  let interactiveHtml = isDropdown ? `
    <select class="coreg-dropdown" data-campaign="${campaign.id}">
      <option value="">Maak een keuze...</option>
      ${answers.map(a => `<option value="${a.answer_value}">${a.label}</option>`).join("")}
    </select>` : `
    <div class="coreg-answers">
      ${answers.map(a => `<button class="btn-answer" data-campaign="${campaign.id}" data-answer="${a.answer_value}">${a.label}</button>`).join("")}
    </div>`;

  const imgUrl = campaign.image?.id ? `https://cms.core.909play.com/assets/${campaign.image.id}` : '';

  return `
    <div class="coreg-section" style="display: ${isVisible ? 'block' : 'none'}; transition: all 0.3s ease;">
      ${imgUrl ? `<img src="${imgUrl}" class="coreg-image" loading="lazy">` : ''}
      <h3 class="coreg-title">${campaign.title}</h3>
      <p class="coreg-description">${campaign.description || ""}</p>
      ${interactiveHtml}
      <button class="btn-skip" data-campaign="${campaign.id}" data-answer="no">Nee, bedankt</button>
    </div>`;
}

window.initCoregFlow = initCoregFlow;
