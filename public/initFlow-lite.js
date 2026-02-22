/**
 * ✅ initFlow-lite.js — UX Verbetering
 * Beheert de progressiebalk met vinkjes en einddoel.
 */
(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  const progressMessages = {
    lander: "Start je aanvraag",
    shortform: "Jouw gegevens",
    coreg: "Exclusieve deals",
    longform: "Adrescontrole",
    ivr: "Laatste check",
    sovendus: "Gefeliciteerd! 🎁"
  };

  async function initFlow() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').filter(Boolean).pop() || "home";
    
    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();
      const config = result.data;

      if (config) {
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

        flowOrder = (config.flow && config.flow.length > 0) ? config.flow : ["lander", "shortform", "coreg", "sovendus"];

        // Initialiseer bolletjes + Einddoel
        document.querySelectorAll(".progress-steps").forEach(container => {
            container.innerHTML = "";
            flowOrder.forEach((step, idx) => {
                const dot = document.createElement("div");
                dot.className = "step-dot";
                container.appendChild(dot);
            });
            
            // Voeg het "cadeau" icoon toe aan het einde
            const goal = document.createElement("div");
            goal.className = "progress-goal";
            goal.innerHTML = "🎁";
            container.appendChild(goal);
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
        // Berekening: we willen dat de bar de actieve stap "raakt"
        const percentage = ((index) / (flowOrder.length)) * 100;
        // Kleine tweak: als we bij de laatste stap zijn, moet hij 100% zijn
        const finalPercentage = (index === flowOrder.length - 1) ? 100 : percentage + (100 / flowOrder.length / 2);
        activeBar.style.width = `${finalPercentage}%`;
      }
      
      if (activeText) activeText.innerText = progressMessages[stepName] || "Even geduld...";
      
      // Update bolletjes (vinkjes komen via CSS .completed)
      dots.forEach((dot, i) => {
        dot.classList.remove("completed", "active");
        if (i < index) dot.classList.add("completed");
        if (i === index) dot.classList.add("active");
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

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
