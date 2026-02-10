/**
 * ✅ formSubmit.js — Hersteld voor Slide-up & Partner Popup
 */
(function() {
  const SLIDEUP_TEMPLATE = `
    <div class="sponsor-slideup" id="sponsor-slideup">
      <h3 class="slideup-title">Bijna klaar!</h3>
      <p class="slideup-text">
        Vind je het goed dat onze <button type="button" class="slideup-partner-link open-sponsor-popup">partners</button> 
        je vrijblijvend informeren?
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

    // Injecteer slide-up als de data-attribute aan staat
    if (form.dataset.sponsorSlideup === "true") {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const useSlideUp = form.dataset.sponsorSlideup === "true";
      const slideup = document.getElementById("sponsor-slideup");

      if (useSlideUp && slideup) {
        slideup.classList.add("is-visible");
        
        document.getElementById("slideup-confirm").onclick = () => finalize();
        document.getElementById("slideup-deny").onclick = () => finalize();
      } else {
        finalize();
      }
    });

    async function finalize() {
      // Sla data op in sessionStorage
      sessionStorage.setItem("firstname", document.getElementById("firstname").value);
      
      // Overige velden uit de HTML
      sessionStorage.setItem("lastname", document.getElementById("lastname").value);
      sessionStorage.setItem("dob", document.getElementById("dob").value);
      sessionStorage.setItem("email", document.getElementById("email").value);
      
      // Geslacht (Radio buttons)
      const genderEl = document.querySelector("input[name='gender']:checked");
      if (genderEl) {
        sessionStorage.setItem("gender", genderEl.value);
      }
      
      // Markeer als voltooid en stuur event naar de Flow Engine
      sessionStorage.setItem("shortFormCompleted", "true");
      document.dispatchEvent(new Event("shortFormSubmitted"));
    }

    // Fix voor de actievoorwaarden popup link
    document.addEventListener("click", (e) => {
      if (e.target.id === "open-actievoorwaarden-inline") {
        e.preventDefault();
        // Trigger de bestaande cosponsors-loader popup
        document.getElementById("open-sponsor-popup")?.click(); 
      }
    });
  });
})();
