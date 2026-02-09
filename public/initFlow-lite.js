/**
 * ✅ initFlow-lite.js — Herstelde Flow Engine
 */
(function () {
  let flowOrder = []; 
  let currentStepIndex = 0;

  async function initFlow() {
    const slug = window.CAMPAIGN_SLUG || "home";
    console.log(`🚀 Flow Engine gestart voor slug: ${slug}`);

    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();

      if (!result || !result.data) {
        throw new Error("Geen campagne data gevonden");
      }
      
      const config = result.data;

      // Thema toepassen op de body
      document.body.setAttribute("data-theme", config.theme || "light");

      // Flow volgorde instellen (met fallback)
      flowOrder = (config.flow && config.flow.length > 0) 
        ? config.flow 
        : ["lander", "shortform", "coreg", "sovendus"];

      renderStep(0);
    } catch (err) {
      console.error("❌ Kritieke flow error:", err.message);
      // Nood-fallback om de pagina niet leeg te laten
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  function renderStep(index) {
    if (index >= flowOrder.length) return;

    const stepName = flowOrder[index];
    const targetId = `step-${stepName}`;

    // Verberg alle secties
    document.querySelectorAll(".flow-section").forEach(sec => sec.classList.remove("active"));

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Activeer stap-specifieke logica
      if (stepName === "coreg" && typeof window.initCoregFlow === "function") window.initCoregFlow();
      if (stepName === "sovendus" && typeof window.setupSovendus === "function") window.setupSovendus();
    } else {
      console.warn(`⚠️ Sectie ${targetId} niet gevonden. Overslaan...`);
      nextStep();
    }
  }

  function nextStep() {
    currentStepIndex++;
    if (currentStepIndex < flowOrder.length) {
      renderStep(currentStepIndex);
    }
  }

  // Luister naar custom events van formulieren
  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);
  
  // Start engine
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFlow);
  } else {
    initFlow();
  }
})();
