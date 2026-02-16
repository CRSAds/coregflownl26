/**
 * ✅ initFlow-lite.js — Herziene Flow Engine
 * Beheert de flow-volgorde en deelt de globale configuratie.
 */
(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  const progressMessages = {
    lander: "Ontdek je voordeel",
    shortform: "Jouw gegevens",
    coreg: "Speciaal voor jou",
    longform: "Adrescontrole",
    ivr: "Verificatie",
    sovendus: "Klaar! 🎁"
  };

  async function initFlow() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').filter(Boolean).pop() || "home";
    
    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();
      const config = result.data;

      if (config) {
        // ✅ Maak configuratie globaal beschikbaar voor andere modules (zoals de slide-up)
        window.currentCampaignConfig = config;

        // UI vullen
        const titleEl = document.getElementById("campaign-title");
        const paraEl = document.getElementById("campaign-paragraph");
        if(titleEl) titleEl.innerHTML = config.title;
        if(paraEl) paraEl.innerHTML = config.paragraph;
        
        const hero = document.getElementById("campaign-hero-image");
        if (hero && config.hero_image) {
            hero.src = config.hero_image;
            hero.style.display = 'block';
        }

        // Bepaal flow volgorde
        flowOrder = (config.flow && config.flow.length > 0) ? config.flow : ["lander", "shortform", "coreg", "sovendus"];

        // Initialiseer bolletjes in ELKE sectie
        document.querySelectorAll(".progress-steps").forEach(container => {
            container.innerHTML = "";
            flowOrder.forEach(() => {
                const dot = document.createElement("div");
                dot.className = "step-dot";
                container.appendChild(dot);
            });
        });

        renderStep(0);
      }
    } catch (err) {
      console.error("❌ Flow error:", err);
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  function renderStep(index) {
    currentStepIndex = index;
    const stepName = flowOrder[index];
    
    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    
    const target = document.getElementById(`step-${stepName}`);
    if (target) {
      target.classList.add("active");
      
      const activeBar = target.querySelector(".progress-bar");
      const activeText = target.querySelector(".progress-text");
      const dots = target.querySelectorAll(".step-dot");
      
      if (activeBar) {
        const percentage = ((index + 1) / flowOrder.length) * 100;
        activeBar.style.width = `${percentage}%`;
      }
      
      if (activeText) activeText.innerText = progressMessages[stepName] || "Even geduld...";
      
      dots.forEach((dot, i) => {
        dot.classList.remove("completed", "active");
        if (i < index) dot.classList.add("completed");
        if (i === index) dot.classList.add("active");
      });

      window.scrollTo(0, 0);

      // Speciale triggers
      if (stepName === "coreg" && window.initCoregFlow) window.initCoregFlow();
      if (stepName === "sovendus" && window.setupSovendus) window.setupSovendus();
    }
  }

  function nextStep() {
    currentStepIndex++;
    if (currentStepIndex < flowOrder.length) {
        renderStep(currentStepIndex);
    }
  }

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
