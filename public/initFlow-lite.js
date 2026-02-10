/**
 * ✅ initFlow-lite.js — Volledige Flow Engine met Stepper & Teksten
 */
(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  const progressMessages = {
    lander: "Ontdek je voordeel...",
    shortform: "Bijna klaar voor de volgende stap!",
    coreg: "Selecteer je favoriete extra's...",
    longform: "Nog één laatste check voor je gegevens!",
    ivr: "Verifieer je deelname...",
    sovendus: "Gefeliciteerd! Je bent er! 🎁"
  };

  async function initFlow() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || window.location.pathname.split('/').filter(Boolean).pop() || "home";
    
    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();
      const config = result.data;

      // Visuals vullen
      document.title = config.title;
      document.getElementById("campaign-title").innerHTML = config.title;
      document.getElementById("campaign-paragraph").innerHTML = config.paragraph;
      
      const heroImg = document.getElementById("campaign-hero-image");
      if (heroImg && config.hero_image) {
        heroImg.src = config.hero_image;
        heroImg.style.display = 'block';
      }

      // Thema & Flow instellen
      document.body.setAttribute("data-theme", config.theme || "light");
      flowOrder = (config.flow && config.flow.length > 0) ? config.flow : ["lander", "shortform", "coreg", "sovendus"];

      // ✅ Initialiseer de bolletjes op de balk
      setupProgressSteps();
      
      renderStep(0);
    } catch (err) {
      console.error("❌ Flow error:", err.message);
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      setupProgressSteps();
      renderStep(0);
    }
  }

  function setupProgressSteps() {
    const stepsContainer = document.getElementById("progress-steps");
    if (!stepsContainer) return;
    
    stepsContainer.innerHTML = "";
    flowOrder.forEach((step, index) => {
      const dot = document.createElement("div");
      dot.className = "step-dot";
      dot.id = `dot-${index}`;
      // Laatste icoon is een cadeautje, de rest een vinkje (vinkje pas zichtbaar na voltooiing)
      dot.innerHTML = (index === flowOrder.length - 1) ? "🎁" : "✓";
      stepsContainer.appendChild(dot);
    });
  }

  function renderStep(index) {
    currentStepIndex = index;
    const stepName = flowOrder[index];
    
    // 1. Update Tekst en Balk
    const progressText = document.getElementById("progress-text");
    if (progressText) progressText.innerText = progressMessages[stepName] || "Even geduld...";

    const progressBar = document.getElementById("main-progress-bar");
    if (progressBar) {
      const percentage = ((index + 1) / flowOrder.length) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // 2. Update de bolletjes (vinkjes animeren)
    flowOrder.forEach((_, i) => {
      const dot = document.getElementById(`dot-${i}`);
      if (dot) {
        dot.classList.toggle("completed", i < index);
        dot.classList.toggle("active", i === index);
      }
    });

    // 3. Toon de juiste sectie
    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`step-${stepName}`);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      if (stepName === "coreg") window.initCoregFlow?.();
      if (stepName === "sovendus") window.setupSovendus?.();
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
