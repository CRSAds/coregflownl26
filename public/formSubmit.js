/**
 * ✅ formSubmit.js — Met IP-lookup en volledige payload
 */
async function getIpOnce() {
  let ip = sessionStorage.getItem("user_ip");
  if (ip) return ip;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ip = data.ip || "0.0.0.0";
  } catch { ip = "0.0.0.0"; }
  sessionStorage.setItem("user_ip", ip);
  return ip;
}

async function buildPayload(campaign = {}) {
  const ip = await getIpOnce(); // 🔍 IP ophalen voor anti-fraude
  const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();

  // Datum formaat correctie naar ISO
  const dobValue = sessionStorage.getItem("dob");
  let dob = "";
  if (dobValue?.includes("/")) {
    const [dd, mm, yyyy] = dobValue.split("/");
    dob = `${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;
  }

  return {
    cid: campaign.cid || null,
    sid: campaign.sid || null,
    firstname: sessionStorage.getItem("firstname"),
    lastname: sessionStorage.getItem("lastname"),
    email: sessionStorage.getItem("email"),
    gender: sessionStorage.getItem("gender"),
    dob: dob,
    t_id: t_id,
    ip_address: ip,
    optin_date: new Date().toISOString().split(".")[0] + "+0000", // Databowl formaat
    aff_id: sessionStorage.getItem("aff_id") || "unknown",
    is_shortform: campaign.is_shortform || false
  };
}
