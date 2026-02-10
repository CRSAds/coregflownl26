(function () {
  let flowOrder = [];
  let currentStepIndex = 0;

  const progressMessages = {
    lander: "Ontdek je voordeel...",
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
        document.getElementById("campaign-title").innerHTML = config.title;
        document.getElementById("campaign-paragraph").innerHTML = config.paragraph;
        
        const hero = document.getElementById("campaign-hero-image");
        if (hero && config.hero_image) {
            hero.src = config.hero_image;
            hero.style.display = 'block';
        }

        flowOrder = (config.flow && config.flow.length > 0) ? config.flow : ["lander", "shortform", "coreg", "sovendus"];

        document.querySelectorAll(".progress-steps").forEach(container => {
            container.innerHTML = "";
            flowOrder.forEach((step, index) => {
                const dot = document.createElement("div");
                dot.className = "step-dot";
                dot.innerHTML = (index === flowOrder.length - 1) ? "🎁" : "✓";
                container.appendChild(dot);
            });
        });

        renderStep(0);
      }
    } catch (err) {
      console.error("❌ Flow error:", err);
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
      
      if (activeText) activeText.innerText = progressMessages[stepName] || "";
      
      dots.forEach((dot, i) => {
        dot.classList.toggle("completed", i < index);
        dot.classList.toggle("active", i === index);
      });

      window.scrollTo(0, 0);
      if (stepName === "coreg") window.initCoregFlow?.();
    }
  }

  function nextStep() {
    currentStepIndex++;
    if (currentStepIndex < flowOrder.length) renderStep(currentStepIndex);
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
