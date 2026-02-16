/**
 * ✅ cosponsors.js — Data-bridge naar FunnelUI
 * Haalt partnerdata op en delegeert het renderen naar de centrale UI module.
 */
(function () {
  let cachedHtml = null;

  /**
   * Haalt de partners op en bouwt de HTML string.
   */
  async function loadSponsors() {
    if (cachedHtml) return cachedHtml;

    try {
      const res = await fetch("https://globalcoregflow-nl.vercel.app/api/cosponsors.js", { cache: "no-store" });
      const { data } = await res.json();

      if (!data || !data.length) return "<p>Geen actieve partners gevonden.</p>";

      let html = `
        <h2 style="margin-bottom:20px;">Onze partners</h2>
        <div class="cosponsor-list" style="display:flex; flex-direction:column; gap:20px;">
      `;

      data.forEach(s => {
        html += `
          <div class="cosponsor-item" style="display:flex; gap:16px; border-bottom:1px solid #e2e8f0; padding-bottom:16px;">
            ${s.logo ? `<img src="https://cms.core.909play.com/assets/${s.logo}" alt="${s.title}" style="width:80px; height:auto; flex-shrink:0; align-self:flex-start;">` : ""}
            <div style="flex:1;">
              <strong style="display:block; font-size:16px; color:#0f172a; margin-bottom:4px;">${s.title}</strong>
              <p style="font-size:14px; color:#64748b; margin-bottom:8px; line-height:1.5;">${s.description || ""}</p>
              ${s.address ? `<small style="display:block; color:#94a3b8; margin-bottom:8px;">${s.address.replace(/\n/g, "<br>")}</small>` : ""}
              <a href="${s.privacy_url}" target="_blank" rel="noopener" style="color:#14B670; font-weight:600; text-decoration:none; font-size:13px;">Privacybeleid &raquo;</a>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      cachedHtml = html;
      return html;
    } catch (err) {
      console.error("❌ Cosponsors laden mislukt:", err);
      return "<p>Er ging iets mis bij het laden van de partnerlijst. Probeer het later opnieuw.</p>";
    }
  }

  /**
   * Luistert naar kliks op elementen die de partner-lijst moeten openen.
   */
  document.addEventListener("click", async (e) => {
    const trigger = e.target.closest("#open-sponsor-popup") || e.target.closest(".open-sponsor-popup");

    if (trigger) {
      e.preventDefault();
      // Toon direct een loader in de modal
      window.FunnelUI.openModal('<div style="text-align:center; padding:20px;">Partners laden...</div>');
      
      const content = await loadSponsors();
      window.FunnelUI.openModal(content);
    }
  });

  /**
   * Luistert naar het custom event vanuit de Slide-up (formSubmit.js).
   */
  document.addEventListener("openPartnerPopup", async () => {
    window.FunnelUI.openModal('<div style="text-align:center; padding:20px;">Partners laden...</div>');
    const content = await loadSponsors();
    window.FunnelUI.openModal(content);
  });

})();
