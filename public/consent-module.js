/**
 * ✅ consent-module.js — Modulaire Versie
 * Beheert sponsor-consent en opent actievoorwaarden via FunnelUI.
 */
(function () {

  /**
   * 1. Sponsor consent status bijhouden in sessionStorage
   */
  function initSponsorConsent() {
    const checkbox = document.getElementById("consent-sponsors");
    if (!checkbox) return;

    // Default status
    sessionStorage.setItem("sponsorsAccepted", "false");

    checkbox.addEventListener("change", () => {
      sessionStorage.setItem(
        "sponsorsAccepted",
        checkbox.checked ? "true" : "false"
      );
    });
  }

  /**
   * 2. Click handlers voor voorwaarden
   */
  function initClickHandlers() {
    document.addEventListener("click", (e) => {
      
      // 🎯 Actievoorwaarden trigger (meestal in de checkbox-tekst)
      if (e.target.closest("#open-actievoorwaarden-inline")) {
        e.preventDefault();
        
        // Gebruik data uit de globale config (gezet door initFlow-lite.js)
        const config = window.currentCampaignConfig;
        const content = config?.actievoorwaarden || "Geen actievoorwaarden beschikbaar op dit moment.";
        
        window.FunnelUI.openModal(`
          <h2>Actievoorwaarden</h2>
          <div class="terms-scroll-area">${content}</div>
        `);
      }
    });
  }

  /**
   * Start de module
   */
  function init() {
    initSponsorConsent();
    initClickHandlers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
