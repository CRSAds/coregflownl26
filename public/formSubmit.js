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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const slideup = document.getElementById("sponsor-slideup");
      if (slideup) {
        // Maak de slide-up zichtbaar
        slideup.classList.add("is-visible");
        
        document.getElementById("slideup-confirm").onclick = () => finalize();
        document.getElementById("slideup-deny").onclick = () => finalize();
      } else {
        finalize();
      }
    });

    async function finalize() {
      // Data opslaan
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
