/**
 * ✅ cosponsors.js — Delegeert renderen naar FunnelUI
 */
(function () {
  let cachedHtml = null;

  async function loadSponsors() {
    if (cachedHtml) return cachedHtml;

    try {
      const res = await fetch("https://globalcoregflow-nl.vercel.app/api/cosponsors.js");
      const { data } = await res.json();

      if (!data || !data.length) return "<p>Geen partners gevonden.</p>";

      let html = `<h2>Onze partners</h2><div class="cosponsor-list" style="display:flex; flex-direction:column; gap:20px; margin-top:20px;">`;
      data.forEach(s => {
        html += `
          <div class="cosponsor-item" style="display:flex; gap:16px; border-bottom:1px solid #f1f5f9; padding-bottom:15px;">
            ${s.logo ? `<img src="https://cms.core.909play.com/assets/${s.logo}" style="width:80px; height:auto; align-self:flex-start;">` : ""}
            <div>
              <strong style="display:block; margin-bottom:4px; color:#0f172a;">${s.title}</strong>
              <p style="font-size:14px; margin-bottom:8px;">${s.description}</p>
              <a href="${s.privacy_url}" target="_blank" style="color:#14B670; font-weight:600; text-decoration:none;">Privacybeleid &raquo;</a>
            </div>
          </div>`;
      });
      html += `</div>`;
      cachedHtml = html;
      return html;
    } catch (err) {
      return "<p>Fout bij laden partners.</p>";
    }
  }

  document.addEventListener("click", async (e) => {
    const trigger = e.target.closest("#open-sponsor-popup") || e.target.closest(".slideup-partner-link");
    if (trigger) {
      e.preventDefault();
      FunnelUI.openModal("<div>Laden...</div>");
      const content = await loadSponsors();
      FunnelUI.openModal(content); // Update met echte content
    }
  });
})();
