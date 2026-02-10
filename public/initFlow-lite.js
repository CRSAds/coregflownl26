(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  async function initFlow() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').filter(Boolean).pop() || "home";
    
    console.log(`🚀 Flow Engine gestart voor slug: ${slug}`);

    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const result = await res.json();
      const config = result.data;

      // 1. Vul Visuals in
      if (config.title) document.getElementById("campaign-title").innerHTML = config.title;
      if (config.paragraph) document.getElementById("campaign-paragraph").innerHTML = config.paragraph;
      
      const heroImg = document.getElementById("campaign-hero-image");
      if (heroImg && config.hero_image) {
        heroImg.src = config.hero_image;
        heroImg.style.display = 'block';
      }

      // 2. Thema & Achtergrond
      document.body.setAttribute("data-theme", config.theme || "light");
      if (config.background_image) {
        document.body.style.backgroundImage = `url('${config.background_image}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
      }

      // 3. Flow Volgorde
      flowOrder = (config.flow && config.flow.length > 0) ? config.flow : ["lander", "shortform", "coreg", "sovendus"];
      console.log("📈 Volgorde:", flowOrder);

      renderStep(0);
    } catch (err) {
      console.error("❌ Fout:", err.message);
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  function renderStep(index) {
    currentStepIndex = index;
    const stepName = flowOrder[index];
    
    // 1. Update de Progressiebalk
    const progressBar = document.getElementById("main-progress-bar");
    if (progressBar) {
      // We berekenen het percentage: (huidige stap + 1) / totaal aantal stappen
      const progressPercentage = ((index + 1) / flowOrder.length) * 100;
      progressBar.style.width = `${progressPercentage}%`;
    }
  
    // 2. Toon de juiste sectie
    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`step-${stepName}`);
    
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Initialiseer specifieke secties
      if (stepName === "coreg") window.initCoregFlow?.();
      if (stepName === "sovendus") window.setupSovendus?.();
    }
  }

  function nextStep() {
    if (currentStepIndex < flowOrder.length - 1) {
      renderStep(currentStepIndex + 1);
    }
  }

  // Event Listeners
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-next-step]")) {
      e.preventDefault();
      nextStep();
    }
  });

  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);
  document.addEventListener("DOMContentLoaded", initFlow);
})();
