/**
 * ✅ formSubmit.js — Volledige Versie
 * Inclusief Slide-up Logica, Partner Popup & Data Opslag
 */
(function() {
  // 1. Template voor de Slide-up (Partners)
  const SLIDEUP_TEMPLATE = `
    <div class="sponsor-slideup" id="sponsor-slideup">
      <div class="slideup-header">
        <h3 class="slideup-title">Bijna klaar!</h3>
      </div>
      <p class="slideup-text">
        Vind je het goed dat onze <button type="button" class="slideup-partner-link" id="trigger-partner-popup">partners</button> 
        je vrijblijvend informeren over interessante aanbiedingen?
      </p>
      <div class="slideup-actions">
        <button type="button" id="slideup-confirm" class="cta-primary">Ja, ga verder</button>
        <button type="button" id="slideup-deny" class="slideup-deny">Nee, liever niet</button>
      </div>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;

    // Injecteer de slide-up HTML in het formulier
    if (form.dataset.sponsorSlideup === "true") {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }

    // Event listener voor de hoofd-submit van het formulier
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // HTML5 Validatie check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Toon de slide-up (als deze bestaat)
      const slideup = document.getElementById("sponsor-slideup");
      if (slideup) {
        slideup.classList.add("is-visible");
        
        // Luister naar de keuzes in de slide-up
        document.getElementById("slideup-confirm").onclick = () => finalize();
        document.getElementById("slideup-deny").onclick = () => finalize();
      } else {
        finalize();
      }
    });

    /**
     * Slaat alle gegevens op en geeft een seintje aan de Flow Engine
     */
    async function finalize() {
      try {
        // Verzamel alle gegevens uit de index.html
        const genderEl = document.querySelector("input[name='gender']:checked");
        
        sessionStorage.setItem("gender", genderEl ? genderEl.value : "");
        sessionStorage.setItem("firstname", document.getElementById("firstname").value);
        sessionStorage.setItem("lastname", document.getElementById("lastname").value);
        sessionStorage.setItem("dob", document.getElementById("dob").value);
        sessionStorage.setItem("email", document.getElementById("email").value);
        sessionStorage.setItem("shortFormCompleted", "true");

        console.log("📝 Gegevens opgeslagen in sessie. Start vervolgstap...");

        // Verberg de slide-up (optioneel voor visuele rust)
        const slideup = document.getElementById("sponsor-slideup");
        if (slideup) slideup.classList.remove("is-visible");

        // Stuur event naar initFlow-lite.js om naar de volgende sectie te gaan
        document.dispatchEvent(new Event("shortFormSubmitted"));

        // Achtergrond: Verstuur de lead alvast naar de API (optioneel)
        if (typeof window.buildPayload === "function") {
          const payload = await window.buildPayload({ is_shortform: true });
          fetch("/api/lead.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch(err => console.error("Lead API error:", err));
        }

      } catch (err) {
        console.error("Fout bij afronden formulier:", err);
        // Zorg dat de flow niet stopt bij een kleine fout
        document.dispatchEvent(new Event("shortFormSubmitted"));
      }
    }

    // 2. Klik-delegatie voor clickable tekst (links die eruit zagen als buttons)
    document.addEventListener("click", (e) => {
      // Actievoorwaarden link in de checkbox
      if (e.target.id === "open-actievoorwaarden-inline") {
        e.preventDefault();
        const mainPopupBtn = document.getElementById("open-sponsor-popup");
        if (mainPopupBtn) mainPopupBtn.click();
      }

      // Partner link in de slide-up
      if (e.target.id === "trigger-partner-popup") {
        e.preventDefault();
        const mainPopupBtn = document.getElementById("open-sponsor-popup");
        if (mainPopupBtn) mainPopupBtn.click();
      }
    });
  });
})();
