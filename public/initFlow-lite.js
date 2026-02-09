/**
 * ✅ Flow Engine V4 — De Centrale Controller
 */
(function () {
  let flowOrder = ["lander", "shortform", "coreg", "longform", "ivr", "sovendus"];
  let currentStepIndex = 0;

  async function initFlow() {
    console.log("🌐 Domein identificatie:", window.CURRENT_DOMAIN);
    
    // Event listeners voor navigatie vanuit andere scripts
    document.addEventListener("shortFormSubmitted", nextStep);
    document.addEventListener("longFormSubmitted", nextStep);
    document.addEventListener("coregFinished", nextStep);

    // Initialiseer eerste stap
    renderStep(0);
  }

  function renderStep(index) {
    const stepName = flowOrder[index];
    console.log(`📍 Stap activatie: ${stepName}`);

    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`step-${stepName}`);
    
    if (target) {
      target.classList.add("active");
      window.scrollTo(0, 0);
      
      // Specifieke script activatie
      if (stepName === "coreg") window.initCoregFlow();
      if (stepName === "sovendus") window.setupSovendus();
    }
  }

  function nextStep() {
    currentStepIndex++;
    if (currentStepIndex >= flowOrder.length) {
      console.log("🏁 Einde van de flow bereikt.");
      return;
    }

    const nextStepName = flowOrder[currentStepIndex];

    // Logica voor conditionele stappen
    if (nextStepName === "longform" && sessionStorage.getItem("requiresLongForm") !== "true") {
      return nextStep();
    }

    renderStep(currentStepIndex);
  }

  // Delegatie voor "Ga verder" knoppen die geen formulier zijn
  document.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-next-step")) {
      nextStep();
    }
  });

  document.addEventListener("DOMContentLoaded", initFlow);
})();
