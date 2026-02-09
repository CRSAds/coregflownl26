/**
 * ✅ initFlow-lite.js — Headless Flow Engine V4
 * Inclusief Visit Tracking & Click Logging
 */
(function () {
  let flowOrder = []; 
  let currentStepIndex = 0;
  let sovendusVisible = false; // Status voor click tracking

  async function initFlow() {
    const slug = window.CAMPAIGN_SLUG || "home";
    
    // 📊 1. Registreer bezoek direct (Sync met swipe-body.js logica)
    registerVisitOnce();

    try {
      const res = await fetch(`/api/campaignVisuals.js?slug=${slug}`);
      const result = await res.json();
      if (!result?.data) throw new Error("Geen campagne data gevonden");
      
      const config = result.data;
      document.body.setAttribute("data-theme", config.theme || "light");
      
      flowOrder = (config.flow && config.flow.length > 0) 
        ? config.flow 
        : ["lander", "shortform", "coreg", "sovendus"];

      renderStep(0);
    } catch (err) {
      console.error("❌ Kritieke flow error:", err);
      flowOrder = ["lander", "shortform", "coreg", "sovendus"];
      renderStep(0);
    }
  }

  /**
   * 📊 Visit tracking — 1x per sessie naar Supabase (REST insert)
   * Gekopieerd van de stabiele live-versie
   */
  function registerVisitOnce() {
    try {
      if (sessionStorage.getItem("visitRegistered") === "true") return;

      const params = new URLSearchParams(window.location.search);
      const payload = {
        t_id: sessionStorage.getItem("t_id") || params.get("t_id") || crypto.randomUUID(),
        offer_id: sessionStorage.getItem("offer_id") || params.get("offer_id"),
        aff_id: sessionStorage.getItem("aff_id") || params.get("aff_id"),
        sub_id: sessionStorage.getItem("sub_id") || params.get("sub_id"),
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      sessionStorage.setItem("visitRegistered", "true");
      sessionStorage.setItem("t_id", payload.t_id);

      fetch("/api/visit.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  }

  /**
   * 🖱️ Sovendus Click Tracking (Approximate)
   * Logt een klik als de pagina wordt verborgen terwijl Sovendus actief is
   */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && sovendusVisible) {
      const t_id = sessionStorage.getItem("t_id");
      if (!t_id) return;
      
      fetch("/api/sovendus-impression.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          t_id, 
          event: "click", 
          source: "flow",
          offer_id: sessionStorage.getItem("offer_id") 
        }),
        keepalive: true
      }).catch(() => {});
    }
  });

  function renderStep(index) {
    if (index >= flowOrder.length) return;

    const stepName = flowOrder[index];
    const targetId = `step-${stepName}`;
    
    // Update tracking status
    sovendusVisible = (stepName === "sovendus");

    document.querySelectorAll(".flow-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(targetId);
    
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      if (stepName === "coreg") window.initCoregFlow?.();
      if (stepName === "sovendus") window.setupSovendus?.();
    } else {
      nextStep();
    }
  }

  function nextStep() {
    currentStepIndex++;
    if (currentStepIndex < flowOrder.length) {
      renderStep(currentStepIndex);
    }
  }

  document.addEventListener("shortFormSubmitted", nextStep);
  document.addEventListener("coregFinished", nextStep);
  document.addEventListener("DOMContentLoaded", initFlow);

  // Globale delegatie voor knoppen
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-next-step]")) {
      if (e.target.closest("form")) return; 
      e.preventDefault();
      nextStep();
    }
  });
})();
