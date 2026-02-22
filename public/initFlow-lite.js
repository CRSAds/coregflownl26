/**
 * ✅ initFlow-lite.js — UX Verbetering
 * Beheert de progressiebalk met vinkjes, einddoel en vloeiende transities.
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

        document.querySelectorAll(".progress-steps").forEach(container => {
            container.innerHTML = "";
            flowOrder.forEach(() => {
                const dot = document.createElement("div");
                dot.className = "step-dot";
                container.appendChild(dot);
            });
            
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
    const oldStep = document.querySelector(".flow-section.active");
    currentStepIndex = index;
    const stepName = flowOrder[index];
    const target = document.getElementById(`step-${stepName}`);

    // Update Progress Bar
    const progressBar = document.querySelector(".progress-bar");
    const progressText = document.querySelector(".progress-text");
    const dots = document.querySelectorAll(".step-dot");

    if (progressBar) {
      const percentage = (index / (flowOrder.length - 1)) * 100;
      progressBar.style.width = `${percentage}%`;
    }
    if (progressText) progressText.innerText = progressMessages[stepName] || "Even geduld...";
    
    dots.forEach((dot, i) => {
      dot.classList.toggle("completed", i < index);
      dot.classList.toggle("active", i === index);
    });

    // Vloeiende transitie tussen secties
    if (oldStep) {
      oldStep.style.opacity = "0";
      oldStep.style.transform = "translateY(-10px)";
      setTimeout(() => {
        oldStep.classList.remove("active");
        showNewStep(target, stepName);
      }, 400);
    } else {
      showNewStep(target, stepName);
    }
  }

  function showNewStep(target, stepName) {
    if (!target) return;
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (stepName === "coreg" && window.initCoregFlow) window.initCoregFlow();
    if (stepName === "sovendus" && window.setupSovendus) window.setupSovendus();
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
