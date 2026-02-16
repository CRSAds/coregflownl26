/**
 * ✅ footer-loader.js — Gebruikt FunnelUI voor voorwaarden en privacy
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "online";

  document.addEventListener("DOMContentLoaded", async () => {
    const footerName = status === "live" ? "Premium Advertising" : 
                       status === "energie" ? "Online Acties ism Trefzeker Energie Direct" : "Online Acties";

    let footerData = null;
    try {
      const res = await fetch("https://globalcoregflow-nl.vercel.app/api/footers.js");
      const { data } = await res.json();
      footerData = data.find(f => f.name === footerName) || data.find(f => f.coreg_path === "default");
      if (!footerData) return;
    } catch (err) {
      console.error("❌ Footer fetch error:", err);
      return;
    }

    const container = document.getElementById("dynamic-footer");
    if (!container) return;

    const logo = footerData.logo ? `<img src="${footerData.logo}" alt="Logo" style="height:40px;">` : "";

    container.innerHTML = `
      <div class="footer-inner" style="max-width:980px; margin:0 auto; padding:20px; font-size:13px; color:#64748b; border-top:1px solid #e2e8f0;">
        <div class="brand" style="margin-bottom:15px;">${logo}</div>
        <p style="margin-bottom:15px; line-height:1.6;">${footerData.text}</p>
        <div class="link-row" style="display:flex; gap:20px; font-weight:600;">
          <button id="open-terms" style="all:unset; cursor:pointer; color:#0f172a;">Algemene Voorwaarden</button>
          <button id="open-privacy" style="all:unset; cursor:pointer; color:#0f172a;">Privacybeleid</button>
        </div>
      </div>
    `;

    document.addEventListener("click", (e) => {
      if (e.target.id === "open-terms") {
        FunnelUI.openModal(`<h2>Algemene Voorwaarden</h2><div>${footerData.terms_content}</div>`);
      }
      if (e.target.id === "open-privacy") {
        FunnelUI.openModal(`<h2>Privacybeleid</h2><div>${footerData.privacy_content}</div>`);
      }
      // Inline actievoorwaarden trigger vanuit de shortform
      if (e.target.id === "open-actievoorwaarden-inline") {
        e.preventDefault();
        FunnelUI.openModal(`<h2>Actievoorwaarden</h2><div>${footerData.actievoorwaarden || 'Geen voorwaarden beschikbaar.'}</div>`);
      }
    });
  });
})();
