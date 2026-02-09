/**
 * ✅ initFlow-lite.js — De Centrale Flow Engine
 * Beheert dynamische volgorde, thema's en conditionele stappen via Directus.
 */

(function () {
  // Centrale staat van de flow
  let flowOrder = []; 
  let currentStepIndex = 0;

  /**
   * Initialiseert de funnel door de configuratie op te halen
   */
  async function initFlow() {
    const slug = window.CAMPAIGN_SLUG || "home";
    console.log(`🚀 Flow Engine gestart voor slug: ${slug} op domein: ${window.location.hostname}`);

    try {
      // 1. Haal visuals, flow en thema op via de gecombineerde API
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();

      if (!result.data) throw new Error("Geen campagne data gevonden");
      
      const config = result.data;

      // 2. Stel het thema in (light/dark) op basis van Directus instelling
      document.body.setAttribute("data-theme", config.theme || "light");

      // 3. Zet de flow volgorde (fallback naar standaard als flow leeg is)
      flowOrder = (config.flow && config.flow.length > 0) 
        ? config.flow 
        : ["lander", "shortform", "coreg", "sovendus"];

      console.log("📈 Geactiveerde flow:", flowOrder);

      // 4. Start de eerste stap
      renderStep(0);

    } catch (err) {
      console.error("❌ Kritieke fout bij laden flow:", err);
      // Fallback volgorde bij API-fouten om de funnel draaiende te houden
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  /**
   * Toont de gevraagde sectie en verbergt de rest
   * @param {number} index - De index in de flowOrder array
   */
  function renderStep(index) {
    if (index >= flowOrder.length) {
      console.log("🏁 Einde van de flow bereikt.");
      return;
    }

    const stepName = flowOrder[index];
    const targetId = `step-${stepName}`;

    // Verberg alle secties door de 'active' class te verwijderen
    document.querySelectorAll(".flow-section").forEach(sec => {
      sec.classList.remove("active");
    });

    // Toon de doel-sectie
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add("active");
      
      // Natuurlijke scroll naar boven (vervangt agressieve forceScrollTop)
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      console.log(`📍 Nu bij stap: ${stepName} (${index + 1}/${flowOrder.length})`);
      
      // Activeer specifieke logica behorend bij de stap
      triggerStepLogic(stepName);
    } else {
      console.warn(`⚠️ Sectie ${targetId} niet gevonden. Overslaan naar volgende...`);
      nextStep();
    }
  }

  /**
   * Bereken en navigeer naar de volgende logische stap
   */
  function nextStep() {
    currentStepIndex++;
    
    if (currentStepIndex >= flowOrder.length) return;

    const nextStepName = flowOrder[currentStepIndex];

    // --- Conditionele Logica ---

    // 1. Overslaan van Longform als dit niet expliciet gemarkeerd is als nodig
    if (nextStepName === "longform") {
      const needsLF = sessionStorage.getItem("requiresLongForm") === "true";
      if (!needsLF) {
        console.log("⏭️ Longform niet nodig o.b.v. coreg antwoorden, overslaan...");
        return nextStep();
      }
    }

    // 2. Overslaan van IVR als de URL status 'online' bevat
    if (nextStepName === "ivr") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "online") {
        console.log("⏭️ Status is 'online', IVR stap overslaan...");
        return nextStep();
      }
    }

    renderStep(currentStepIndex);
  }

  /**
   * Koppelt specifieke JavaScript-modules aan de actieve stap
   */
  function triggerStepLogic(stepName) {
    // Start de coreg-renderer alleen als we op de coreg stap zijn
    if (stepName === "coreg" && typeof window.initCoregFlow === "function") {
      window.initCoregFlow();
    }
    
    // Start Sovendus iframe setup
    if (stepName === "sovendus" && typeof window.setupSovendus === "function") {
      window.setupSovendus();
    }
  }

  // --- Event Listeners voor Navigatie ---

  // Luister naar custom events van de formulier-scripts
  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("longFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);

  // Globale delegatie voor knoppen met 'data-next-step' of '.flow-next'
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-next-step]") || e.target.closest(".flow-next")) {
      // Voorkom dubbele navigatie bij form submits die al via events gaan
      if (e.target.closest("form")) return; 
      
      e.preventDefault();
      nextStep();
    }
  });

  // Start de engine zodra de DOM klaar is
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFlow);
  } else {
    initFlow();
  }

})();
