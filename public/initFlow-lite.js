/**
 * ✅ initFlow-lite.js — Met Visit Tracking & Click Logging
 */
(function () {
  let flowOrder = []; 
  let currentStepIndex = 0;
  let sovendusVisible = false; // Voor click tracking

  async function initFlow() {
    const slug = window.CAMPAIGN_SLUG || "home";
    registerVisitOnce(); // 📊 Log bezoek direct bij start

    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();
      if (!result?.data) throw new Error("Geen data");
      
      const config = result.data;
      document.body.setAttribute("data-theme", config.theme || "light");
      flowOrder = config.flow.length > 0 ? config.flow : ["lander", "shortform", "coreg", "sovendus"];

      renderStep(0);
    } catch (err) {
      console.error("❌ Flow error:", err);
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  // 📊 Visit tracking — 1x per sessie naar Supabase
  function registerVisitOnce() {
    if (sessionStorage.getItem("visitRegistered") === "true") return;
    const payload = {
      t_id: sessionStorage.getItem("t_id") || crypto.randomUUID(),
      offer_id: sessionStorage.getItem("offer_id"),
      page_url: window.location.href,
      user_agent: navigator.userAgent
    };
    sessionStorage.setItem("visitRegistered", "true");
    sessionStorage.setItem("t_id", payload.t_id);
    fetch("/api/visit.js", { method: "POST", body: JSON.stringify(payload) }).catch(() => {});
  }

  // 🖱️ Sovendus Click Tracking (Approximate)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && sovendusVisible) {
      const t_id = sessionStorage.getItem("t_id");
      if (!t_id) return;
      fetch("/api/sovendus-impression.js", {
        method: "POST",
        body: JSON.stringify({ t_id, event: "click", source: "flow" }),
        keepalive: true
      }).catch(() => {});
    }
  });

  function renderStep(index) {
    const stepName = flowOrder[index];
    sovendusVisible = (stepName === "sovendus"); // Activeer tracking als stap actief is
    
    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`step-${stepName}`);
    if (target) {
      target.classList.add("active");
      window.scrollTo(0, 0);
      if (stepName === "coreg") window.initCoregFlow?.();
      if (stepName === "sovendus") window.setupSovendus?.();
    }
  }

  function nextStep() {
    currentStepIndex++;
    if (currentStepIndex < flowOrder.length) renderStep(currentStepIndex);
  }

  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);
  document.addEventListener("DOMContentLoaded", initFlow);
})();
