/**
 * ✅ formSubmit.js — Headless Versie met IP-lookup & Data-integriteit
 */
if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;

  // 🔹 IP ophalen (Cruciaal voor lead-validatie bij partners)
  async function getIpOnce() {
    let ip = sessionStorage.getItem("user_ip");
    if (ip) return ip;
    try {
      const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
      const data = await res.json();
      ip = data.ip || "0.0.0.0";
    } catch {
      ip = "0.0.0.0";
    }
    sessionStorage.setItem("user_ip", ip);
    return ip;
  }

  // 🔹 Payload opbouwen conform Databowl vereisten
  async function buildPayload(campaign = {}) {
    const ip = await getIpOnce();
    const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();

    // DOB conversie van dd / mm / jjjj naar YYYY-MM-DD
    const dobValue = sessionStorage.getItem("dob");
    let dob = "";
    if (dobValue?.includes("/")) {
      const parts = dobValue.split("/").map(p => p.trim());
      if (parts.length === 3) {
        dob = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }

    return {
      cid: campaign.cid || "925", // Standaard hoofd-ID
      sid: campaign.sid || "34",
      firstname: sessionStorage.getItem("firstname") || "",
      lastname: sessionStorage.getItem("lastname") || "",
      email: sessionStorage.getItem("email") || "",
      gender: sessionStorage.getItem("gender") || "",
      dob: dob,
      t_id: t_id,
      f_17_ipaddress: ip,
      f_55_optindate: new Date().toISOString().split(".")[0] + "+0000",
      aff_id: sessionStorage.getItem("aff_id") || "unknown",
      offer_id: sessionStorage.getItem("offer_id") || "unknown",
      is_shortform: campaign.is_shortform || false,
      f_1453_campagne_url: window.location.origin + window.location.pathname
    };
  }
  window.buildPayload = buildPayload;

  // Handler voor formulierverzending
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Sla velden op in sessie
      sessionStorage.setItem("firstname", document.getElementById("firstname").value);
      sessionStorage.setItem("lastname", document.getElementById("lastname").value);
      sessionStorage.setItem("email", document.getElementById("email").value);
      sessionStorage.setItem("dob", document.getElementById("dob").value);

      const genderEl = form.querySelector("input[name='gender']:checked");
      if (genderEl) sessionStorage.setItem("gender", genderEl.value);

      // Na opslaan: seintje naar Flow Engine
      document.dispatchEvent(new Event("shortFormSubmitted"));
      
      // Verstuur de hoofdlead op de achtergrond
      const payload = await buildPayload({ is_shortform: true });
      fetch("/api/lead.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    });
  });
}
