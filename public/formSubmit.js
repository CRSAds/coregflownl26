// =============================================================
// ✅ formSubmit.js — Geoptimaliseerd voor Headless Flow
// =============================================================

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();

  const SLIDEUP_TEMPLATE = `
    <div class="sponsor-slideup" id="sponsor-slideup">
      <h3 class="slideup-title">Bijna klaar!</h3>
      <p class="slideup-text">
        Vind je het goed dat onze <button type="button" class="slideup-partner-link open-sponsor-popup">partners</button> 
        je vrijblijvend informeren over hun acties?
      </p>
      <div class="slideup-actions">
        <button type="button" id="slideup-confirm" class="cta-primary">
          <span>Ja, ga verder</span>
          <div class="slideup-spinner"></div>
        </button>
        <button type="button" id="slideup-deny" class="slideup-deny">Nee, liever niet</button>
      </div>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });

    const form = document.getElementById("lead-form");
    if (form && form.dataset.sponsorSlideup === "true") {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }
  });

  async function buildPayload(campaign = {}) {
    const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();
    const payload = {
      gender: sessionStorage.getItem("gender") || "",
      firstname: sessionStorage.getItem("firstname") || "",
      lastname: sessionStorage.getItem("lastname") || "",
      email: sessionStorage.getItem("email") || "",
      dob: sessionStorage.getItem("dob") || "",
      t_id: t_id,
      aff_id: sessionStorage.getItem("aff_id") || "unknown",
      offer_id: sessionStorage.getItem("offer_id") || "unknown",
      sub_id: sessionStorage.getItem("sub_id") || "unknown",
      is_shortform: campaign.is_shortform || false,
    };
    return payload;
  }

  async function finalizeShortForm() {
    console.log("🚀 Shortform afronden...");
    sessionStorage.setItem("shortFormCompleted", "true");
    // Signaal naar Flow Engine
    document.dispatchEvent(new Event("shortFormSubmitted"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const genderEl = form.querySelector("input[name='gender']:checked");
      if (genderEl) sessionStorage.setItem("gender", genderEl.value);
      
      sessionStorage.setItem("firstname", document.getElementById("firstname").value);
      sessionStorage.setItem("lastname", document.getElementById("lastname").value);
      sessionStorage.setItem("email", document.getElementById("email").value);
      sessionStorage.setItem("dob", document.getElementById("dob").value);

      const useSlideUp = form.dataset.sponsorSlideup === "true";
      if (useSlideUp) {
        document.getElementById("sponsor-slideup").classList.add("is-visible");
      } else {
        await finalizeShortForm();
      }
    });

    document.addEventListener("click", async (e) => {
      if (e.target.id === "slideup-confirm") {
        sessionStorage.setItem("sponsorsAccepted", "true");
        await finalizeShortForm();
      }
      if (e.target.id === "slideup-deny") {
        sessionStorage.setItem("sponsorsAccepted", "false");
        await finalizeShortForm();
      }
    });
  });
}
