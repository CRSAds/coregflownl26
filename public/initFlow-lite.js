/**
 * ✅ initFlow-lite.js — Flow Engine
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
      // Directus aanroep
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();
      const config = result.data;

      if (config) {
        // Content vullen
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

        // Initialiseer bolletjes in ELKE sectie voor visuele consistentie
        document.querySelectorAll(".progress-steps").forEach(container => {
            container.innerHTML = "";
            flowOrder.forEach((step, index) => {
                const dot = document.createElement("div");
                dot.className = "step-dot";
                // Laatste stap krijgt een kadootje, rest een vinkje
                // dot.innerHTML = (index === flowOrder.length - 1) ? "🎁" : ""; 
                container.appendChild(dot);
            });
        });

        // Start eerste stap
        renderStep(0);
      }
    } catch (err) {
      console.error("❌ Flow error:", err);
      // Fallback flow als API faalt
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  function renderStep(index) {
    currentStepIndex = index;
    const stepName = flowOrder[index];
    
    // Verberg alles
    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    
    // Toon huidige
    const target = document.getElementById(`step-${stepName}`);
    
    if (target) {
      target.classList.add("active");
      
      // Update interne progressiebalk van deze kaart
      const activeBar = target.querySelector(".progress-bar");
      const activeText = target.querySelector(".progress-text");
      const dots = target.querySelectorAll(".step-dot");
      
      if (activeBar) {
        // Percentage berekening: (Huidige stap + 1) / Totaal
        const percentage = ((index + 1) / flowOrder.length) * 100;
        activeBar.style.width = `${percentage}%`;
      }
      
      if (activeText) activeText.innerText = progressMessages[stepName] || "Even geduld...";
      
      // Update bolletjes status
      dots.forEach((dot, i) => {
        dot.classList.remove("completed", "active");
        if (i < index) dot.classList.add("completed");
        if (i === index) dot.classList.add("active");
      });

      // Scroll naar boven
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
    } else {
        console.log("Flow voltooid");
    }
  }

  // Event Listeners voor navigatie
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-next-step]")) {
      e.preventDefault();
      nextStep();
    }
  });

  // Custom events vanuit andere scripts
  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);

  // Start bij laden
  document.addEventListener("DOMContentLoaded", initFlow);
})();
