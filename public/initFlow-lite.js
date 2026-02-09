(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  async function initFlow() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').filter(Boolean).pop();
    
    console.log(`🚀 Flow Engine gestart voor slug: ${slug}`);

    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();

      if (!result.data) throw new Error("Campagne data niet gevonden");
      
      const config = result.data;

      // 1. Direct visuals invullen (Vervangt visuals-loader.js)
      document.title = config.title;
      const titleEl = document.getElementById("campaign-title");
      if (titleEl) titleEl.innerHTML = config.title;
      
      const paraEl = document.getElementById("campaign-paragraph");
      if (paraEl) paraEl.innerHTML = config.paragraph;

      const heroImg = document.getElementById("campaign-hero-image");
      if (heroImg && config.hero_image) {
        heroImg.src = config.hero_image;
        heroImg.style.display = 'block';
      }

      // 2. Thema & Flow
      document.body.setAttribute("data-theme", config.theme || "light");
      flowOrder = config.flow;

      renderStep(0);
    } catch (err) {
      console.error("❌ Kritieke flow error:", err.message);
      // Fallback
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  function renderStep(index) {
    const stepName = flowOrder[index];
    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`step-${stepName}`);
    if (target) {
      target.classList.add("active");
      if (stepName === "coreg") window.initCoregFlow?.();
    }
  }

  document.addEventListener("DOMContentLoaded", initFlow);
})();
