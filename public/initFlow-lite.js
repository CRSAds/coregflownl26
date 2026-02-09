(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  async function initFlow() {
    // Dynamisch de slug bepalen uit de URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').filter(Boolean).pop() || "home";
    
    console.log(`🚀 Flow Engine gestart voor slug: ${slug}`);

    try {
      // API aanroepen MET slug parameter
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const result = await res.json();
      if (!result.data) throw new Error("Geen campagne data gevonden");
      
      const config = result.data;

      // 1. Visuele elementen direct invullen
      document.title = config.title || "Campagne";
      const titleEl = document.getElementById("campaign-title");
      if (titleEl) {
        titleEl.innerHTML = config.title;
        titleEl.style.color = "inherit"; // Zorg dat tekst zichtbaar is
      }
      
      const paraEl = document.getElementById("campaign-paragraph");
      if (paraEl) {
        paraEl.innerHTML = config.paragraph;
        paraEl.style.color = "inherit";
      }

      const heroImg = document.getElementById("campaign-hero-image");
      if (heroImg && config.hero_image) {
          heroImg.src = config.hero_image;
          heroImg.style.display = 'block'; // Forceer zichtbaarheid
          heroImg.style.opacity = '1';     // Voor het geval er CSS transities zijn
          console.log("🖼️ Hero image gezet naar:", config.hero_image);
      } else {
          console.warn("⚠️ Geen hero_image gevonden in config of element ontbreekt");
      }

      // Achtergrond instellen als deze aanwezig is
      if (config.background_image) {
        document.body.style.backgroundImage = `url('${config.background_image}')`;
        document.body.style.backgroundSize = "cover";
      }

      // 2. Thema & Flow volgorde instellen
      document.body.setAttribute("data-theme", config.theme || "light");
      flowOrder = (config.flow && config.flow.length > 0) 
        ? config.flow 
        : ["lander", "shortform", "coreg", "sovendus"];

      console.log("📈 Geactiveerde flow:", flowOrder);
      renderStep(0);
      
    } catch (err) {
      console.error("❌ Kritieke flow error:", err.message);
      // Fallback flow bij fouten
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  function renderStep(index) {
    if (index >= flowOrder.length) return;
    const stepName = flowOrder[index];
    const targetId = `step-${stepName}`;

    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(targetId);
    
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      if (stepName === "coreg" && typeof window.initCoregFlow === "function") window.initCoregFlow();
      if (stepName === "sovendus" && typeof window.setupSovendus === "function") window.setupSovendus();
    } else {
      console.warn(`⚠️ Sectie ${targetId} niet gevonden. Overslaan...`);
      nextStep();
    }
  }

  function nextStep() {
    currentStepIndex++;
    renderStep(currentStepIndex);
  }

  // Luister naar kliks op knoppen met [data-next-step]
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-next-step]") || e.target.closest(".flow-next")) {
      e.preventDefault();
      nextStep();
    }
  });

  // Events van andere scripts
  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);

  document.addEventListener("DOMContentLoaded", initFlow);
})();
