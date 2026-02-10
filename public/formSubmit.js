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

    if (form.dataset.sponsorSlideup === "true") {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }

    form.addEventListener("submit", (e) => {
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

    function finalize() {
      // Sla gegevens op
      const formData = {
        firstname: document.getElementById("firstname")?.value,
        lastname: document.getElementById("lastname")?.value,
        dob: document.getElementById("dob")?.value,
        email: document.getElementById("email")?.value,
        gender: document.querySelector("input[name='gender']:checked")?.value
      };

      Object.keys(formData).forEach(key => {
        if (formData[key]) sessionStorage.setItem(key, formData[key]);
      });

      // Ga naar volgende stap
      document.dispatchEvent(new Event("shortFormSubmitted"));
    }

    // Luister naar popup triggers voor partners
    document.addEventListener("click", (e) => {
        if (e.target.id === "trigger-partner-popup" || e.target.id === "open-actievoorwaarden-inline") {
            e.preventDefault();
            const popupTrigger = document.getElementById("open-sponsor-popup");
            if (popupTrigger) popupTrigger.click();
        }
    });
  });
})();
