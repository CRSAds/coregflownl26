/**
 * ✅ Dynamische Flow Engine (V4 - Headless Edition)
 * Beheert multitenancy, dynamische volgorde en conditionele stappen.
 */

(function () {
  let flowOrder = []; // Wordt gevuld vanuit Directus
  let currentStepIndex = 0;

  async function initFlow() {
    console.log("🚀 Flow Engine gestart voor domein:", window.CURRENT_DOMAIN);

    try {
      // 1. Haal de flow-configuratie op uit Directus (conceptueel)
      // In de praktijk vervang je dit door een API-call naar je Directus endpoint
      const flowConfig = await fetchFlowConfig(window.CURRENT_DOMAIN, window.CAMPAIGN_SLUG);
      flowOrder = flowConfig.steps; // bijv: ["lander", "shortform", "coreg", "sovendus"]

      // 2. Initialiseer de eerste stap
      renderStep(0);

      // 3. Event listeners voor navigatie (Global Delegation)
      document.addEventListener("click", handleNavigation);
    } catch (err) {
      console.error("❌ Flow initialisatie mislukt:", err);
      // Fallback naar een standaard volgorde bij fouten
      flowOrder = ["lander", "shortform", "coreg", "final"];
      renderStep(0);
    }
  }

  /**
   * Toont de juiste sectie op basis van de index in de flowOrder array
   */
  function renderStep(index) {
    if (index >= flowOrder.length) return;

    const stepName = flowOrder[index];
    const targetId = `step-${stepName}`;

    // Verberg alle secties
    document.querySelectorAll(".flow-section").forEach(sec => {
      sec.classList.remove("active");
    });

    // Toon de doel-sectie
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add("active");
      window.scrollTo(0, 0);
      console.log(`📍 Nu bij stap: ${stepName} (${index + 1}/${flowOrder.length})`);
      
      // Trigger specifieke loaders indien nodig (bijv. Sovendus of Coreg)
      triggerStepLogic(stepName);
    } else {
      console.warn(`⚠️ Sectie ${targetId} niet gevonden in HTML.`);
      nextStep(); // Sla over als de HTML mist
    }
  }

  function nextStep() {
    currentStepIndex++;
    
    // Check op conditionele oversprongen
    const nextStepName = flowOrder[currentStepIndex];

    // Overslaan van Longform als dit niet nodig is (sessionStorage check)
    if (nextStepName === "longform") {
      const needsLF = sessionStorage.getItem("requiresLongForm") === "true";
      if (!needsLF) {
        console.log("⏭️ Longform niet nodig, overslaan...");
        return nextStep();
      }
    }

    // Overslaan van IVR als status online is
    if (nextStepName === "ivr") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "online") {
        console.log("⏭️ Status is online, IVR overslaan...");
        return nextStep();
      }
    }

    renderStep(currentStepIndex);
  }

  function handleNavigation(e) {
    // Luister naar knoppen met [data-next-step] of specifieke form-submits
    if (e.target.closest("[data-next-step]") || e.target.closest(".flow-next")) {
      e.preventDefault();
      nextStep();
    }
  }

  /**
   * Activeert specifieke JS-logica per stap
   */
  function triggerStepLogic(stepName) {
    if (stepName === "coreg" && window.initCoregFlow) window.initCoregFlow();
    if (stepName === "sovendus" && window.setupSovendus) window.setupSovendus();
  }

  // Luister naar custom events van formulieren (vanuit formSubmit.js)
  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("longFormSubmitted", nextStep);

  // Start de engine
  document.addEventListener("DOMContentLoaded", initFlow);

  // Mock functie voor Directus call
  async function fetchFlowConfig(domain, slug) {
    // Hier zou je fetch(`${API_BASE}/api/flow-config?domain=${domain}&slug=${slug}`) doen.
    // Voor nu retourneren we de standaard volgorde:
    return { steps: ["lander", "shortform", "coreg", "longform", "ivr", "sovendus"] };
  }

})();
