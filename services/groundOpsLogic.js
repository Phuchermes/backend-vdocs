// ================= ENGINE META =================
const ENGINE_VERSION = "2.0.0";

// ================= TIME PARSER =================
function parseTime(t) {
  if (!t || typeof t !== "string") return null;
  t = t.trim();

  let hh, mm;
  if (t.includes(":")) {
    const parts = t.split(":");
    if (parts.length !== 2) return null;
    hh = parseInt(parts[0]);
    mm = parseInt(parts[1]);
  } 
  else if (t.length === 4) {
    hh = parseInt(t.slice(0, 2));
    mm = parseInt(t.slice(2));
  } 
  else return null;

  if (isNaN(hh) || isNaN(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  return hh * 60 + mm;
}

function normalizeAfterAONBT_VN(time, aonbt) {
  if (time == null || aonbt == null) return time;

  const MIDNIGHT_START = 22 * 60;
  const MIDNIGHT_END = 4 * 60;

  if (time >= aonbt) return time;

  if (aonbt >= MIDNIGHT_START && time <= MIDNIGHT_END) {
    return time + 1440;
  }

  return null;
}

// ================= KPI ENGINE =================
function getGroundOpsResult(formData) {

  // --- RAW ---
  const aonbtRaw = parseTime(formData.time1);
  const paxStartRaw = parseTime(formData.time2);
  const paxEndRaw = parseTime(formData.time3);

  const dvvsStartRaw = parseTime(formData.time6);
  const dvvsEndRaw = parseTime(formData.time7);

  const cuvtStartRaw = parseTime(formData.time8);
  const cuvtEndRaw = parseTime(formData.time9);

  const fuelStartRaw = parseTime(formData.time10);
  const fuelEndRaw = parseTime(formData.time11);

  const catStartRaw = parseTime(formData.time12);
  const catEndRaw = parseTime(formData.time13);

  const prebdtRaw = parseTime(formData.time14);
  const bdtStartRaw = parseTime(formData.time17);
  const bdtEndRaw = parseTime(formData.time18);

  const fhtRaw = parseTime(formData.time19);
  const bayRaw = parseInt(formData.bayRaw || formData.bay || "");

  if (!aonbtRaw) return { status: "AONBT", reasons: [], requireReason: false };

  const aonbt = aonbtRaw;

  const paxStart = normalizeAfterAONBT_VN(paxStartRaw, aonbt);
  const paxEnd = normalizeAfterAONBT_VN(paxEndRaw, aonbt);

  const dvvsStart = normalizeAfterAONBT_VN(dvvsStartRaw, aonbt);
  const dvvsEnd = normalizeAfterAONBT_VN(dvvsEndRaw, aonbt);

  const cuvtStart = normalizeAfterAONBT_VN(cuvtStartRaw, aonbt);
  const cuvtEnd = normalizeAfterAONBT_VN(cuvtEndRaw, aonbt);

  const fuelStart = normalizeAfterAONBT_VN(fuelStartRaw, aonbt);
  const fuelEnd = normalizeAfterAONBT_VN(fuelEndRaw, aonbt);

  const catStart = normalizeAfterAONBT_VN(catStartRaw, aonbt);
  const catEnd = normalizeAfterAONBT_VN(catEndRaw, aonbt);

  const prebdt = normalizeAfterAONBT_VN(prebdtRaw, aonbt);
  const bdtStart = normalizeAfterAONBT_VN(bdtStartRaw, aonbt);
  const bdtEnd = normalizeAfterAONBT_VN(bdtEndRaw, aonbt);

  const fht = normalizeAfterAONBT_VN(fhtRaw, aonbt);

  // ===== KPI TARGETS =====
  const LIMIT_PAX = 6;
  const LIMIT_DVVS = 8;
  const LIMIT_CUVT = 8;
  const LIMIT_FUEL = 11;
  const LIMIT_CAT = 14;
  const LIMIT_BDT = 13;
  const LIMIT_FHT = aonbt + 35;

  // ===== PREBDT LIMIT BY BAY =====
let LIMIT_PREBDT = aonbt + 15;
let LIMIT_BDT_ABS = aonbt + 20; // default fallback

if (!isNaN(bayRaw)) {
  if (bayRaw >= 94 && bayRaw <= 102) { 
    LIMIT_PREBDT = aonbt + 15;
    LIMIT_BDT_ABS = aonbt + 20; // +5
  }
  else if (bayRaw >= 71 && bayRaw <= 93) { 
    LIMIT_PREBDT = aonbt + 9;
    LIMIT_BDT_ABS = aonbt + 20; // +11
  }
  else if (bayRaw >= 1 && bayRaw <= 54) { 
    LIMIT_PREBDT = aonbt + 5;
    LIMIT_BDT_ABS = aonbt + 20; // +15
  }
}

  if (!isNaN(bayRaw)) {
    if (bayRaw >= 71 && bayRaw <= 93) LIMIT_PREBDT = aonbt + 9;
    if (bayRaw >= 1 && bayRaw <= 54) LIMIT_PREBDT = aonbt + 5;
  }

  // ===== WAIT FHT =====
  if (!fht) return { status: "CALCULATING", reasons: [], requireReason: false };

  // ===== PASS FAST PATH =====
  if (fht <= LIMIT_FHT) {
    return { status: "PASS", reasons: [], requireReason: false };
  }

  // ===== FAIL ANALYSIS =====
// ===== FAIL ANALYSIS =====
const reasons = [];

// Helper
function checkDuration(start, end, limit, label) {
  if (start == null || end == null) {
    reasons.push(`Chưa nhập ${label}`);
    return;
  }
  const dur = end - start;
  if (dur > limit) reasons.push(`${label} lố ${dur - limit} phút`);
}

// Pax
checkDuration(paxStart, paxEnd, LIMIT_PAX, "Pax xuống");

// DVVS
checkDuration(dvvsStart, dvvsEnd, LIMIT_DVVS, "DVVS");

// CUVT
checkDuration(cuvtStart, cuvtEnd, LIMIT_CUVT, "CUVT");

// Fuel
checkDuration(fuelStart, fuelEnd, LIMIT_FUEL, "Dầu");

// Catering
checkDuration(catStart, catEnd, LIMIT_CAT, "Catering");

// Boarding duration
checkDuration(bdtStart, bdtEnd, LIMIT_BDT, "Boarding Pax");

// PreBDT absolute
if (prebdt == null) reasons.push("Chưa nhập PreBDT");
else if (prebdt > LIMIT_PREBDT)
  reasons.push(`PreBDT trễ (Bãi ${bayRaw || "?"})`);

// BDT absolute rule
if (bdtStart == null) {
  reasons.push("Chưa nhập Boarding bắt đầu");
} 
else if (bdtStart > LIMIT_BDT_ABS) {
  reasons.push(`Boarding trễ`);
}
  return {
    status: "FAIL",
    reasons,
    requireReason: true,
  };
}

// ================= EXPORT =================
module.exports = {
  ENGINE_VERSION,
  parseTime,
  normalizeAfterAONBT_VN,
  getGroundOpsResult
};
