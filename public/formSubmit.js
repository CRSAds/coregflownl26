/**
 * ✅ formSubmit.js — Volledige Versie
 */
(function() {
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

    // Injecteer slide-up
    if (form.dataset.sponsorSlideup === "true") {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }

    // Submit handler
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const slideup = document.getElementById("sponsor-slideup");
      if (slideup) {
        slideup.classList.add("is-visible");
        
        document.getElementById("slideup-confirm").onclick = () => finalize();
        document.getElementById("slideup-deny").onclick = () => finalize();
      } else {
        finalize();
      }
    });

    async function finalize() {
      try {
        // Velden opslaan
        const genderEl = document.querySelector("input[name='gender']:checked");
        sessionStorage.setItem("gender", genderEl ? genderEl.value : "");
        sessionStorage.setItem("firstname", document.getElementById("firstname").value);
        sessionStorage.setItem("lastname", document.getElementById("lastname").value);
        sessionStorage.setItem("dob", document.getElementById("dob").value);
        sessionStorage.setItem("email", document.getElementById("email").value);
        sessionStorage.setItem("shortFormCompleted", "true");

        // Event naar flow engine
        document.dispatchEvent(new Event("shortFormSubmitted"));

      } catch (err) {
        console.error("Fout bij opslaan:", err);
        document.dispatchEvent(new Event("shortFormSubmitted"));
      }
    }

    // Pop-up Trigger Logica (Click delegation)
    document.addEventListener("click", (e) => {
      // Actievoorwaarden link & Partner link in slide-up
      if (e.target.id === "open-actievoorwaarden-inline" || e.target.id === "trigger-partner-popup") {
        e.preventDefault();
        e.stopPropagation();

        // Direct de popup van cosponsors-loader.js aanroepen
        const popup = document.getElementById("cosponsor-popup");
        const openTrigger = document.getElementById("open-sponsor-popup");

        if (openTrigger) {
          openTrigger.click();
        } else if (popup) {
          // Handmatige fallback als de trigger button niet in de DOM staat
          popup.style.display = "flex";
          document.documentElement.classList.add("modal-open");
          document.body.classList.add("modal-open");
        }
      }
    });
  });
})();
