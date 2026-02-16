/**
 * ✅ formSubmit.js — Dynamische Slide-up & Lead Finalization
 */
(function() {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Check of slide-up geactiveerd moet worden
      const config = window.currentCampaignConfig;
      if (form.dataset.sponsorSlideup === "true" && config) {
        showSponsorSlideup(config);
      } else {
        finalize();
      }
    });

    function showSponsorSlideup(config) {
      // Verwijder bestaande als die er is
      const oldSlideup = document.getElementById("sponsor-slideup");
      if (oldSlideup) oldSlideup.remove();

      const html = `
        <div class="sponsor-slideup" id="sponsor-slideup">
          <div class="slideup-header">
            <h3 class="slideup-title">${config.slideup_title || 'Bijna klaar!'}</h3>
          </div>
          <p class="slideup-text">
            ${config.slideup_text || 'Vind je het goed dat onze'} 
            <button type="button" class="slideup-partner-link" id="trigger-partners">partners</button> 
            ${config.slideup_text_suffix || 'je informeren over aanbiedingen?'}
          </p>
          <div class="slideup-actions">
            <button type="button" id="slideup-confirm" class="cta-primary">Ja, ga verder</button>
            <button type="button" id="slideup-deny" class="slideup-deny">Nee, liever niet</button>
          </div>
        </div>
      `;

      form.insertAdjacentHTML('beforeend', html);
      
      const slideup = document.getElementById("sponsor-slideup");
      setTimeout(() => slideup.classList.add("is-visible"), 10);

      // Event Listeners
      document.getElementById("slideup-confirm").onclick = () => finalize();
      document.getElementById("slideup-deny").onclick = () => finalize();
      document.getElementById("trigger-partners").onclick = (e) => {
        e.preventDefault();
        // Trigger de globale partner popup vanuit cosponsors.js
        document.dispatchEvent(new CustomEvent("openPartnerPopup"));
      };
    }

    function finalize() {
      sessionStorage.setItem("firstname", document.getElementById("firstname").value);
      sessionStorage.setItem("lastname", document.getElementById("lastname").value);
      sessionStorage.setItem("dob", document.getElementById("dob").value);
      sessionStorage.setItem("email", document.getElementById("email").value);
      
      const genderEl = document.querySelector("input[name='gender']:checked");
      if (genderEl) sessionStorage.setItem("gender", genderEl.value);

      document.dispatchEvent(new Event("shortFormSubmitted"));
    }
  });
})();
