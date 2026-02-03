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

// ================= NORMALIZE =================
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

  // --- RAW TIMES ---
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

  // --- BAY ---
  const bayText = String(formData.bay || "").trim();     // giữ nguyên 103A
  const bayNumber = parseInt(bayText, 10);               // dùng để tính

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

  // ===== PREBDT / BDT BY BAY =====
  let LIMIT_PREBDT = aonbt + 15;
  let LIMIT_BDT_ABS = aonbt + 20;

  if (!isNaN(bayNumber)) {
    if (bayNumber >= 94 && bayNumber <= 102) {
      LIMIT_PREBDT = aonbt + 15;
    }
    // else if (bayNumber >= 71 && bayNumber <= 93) {
    //   LIMIT_PREBDT = aonbt + 9;
    // }
    else if (bayNumber >= 1 && bayNumber <= 93) {
      LIMIT_PREBDT = aonbt + 5;
    }
  }

  // ===== WAIT FHT =====
  if (!fht) return { status: "CALCULATING", reasons: [], requireReason: false };

  // ===== PASS FAST =====
  if (fht <= LIMIT_FHT) {
    return { status: "PASS", reasons: [], requireReason: false };
  }

  // ===== FAIL ANALYSIS =====
  const reasons = [];
  let hasOtherViolation = false;

  function checkDuration(start, end, limit, label) {
    if (start == null || end == null) {
      reasons.push(`Chưa nhập ${label}`);
      hasOtherViolation = true;
      return;
    }
    const dur = end - start;
    if (dur > limit) {
      reasons.push(`${label} trễ ${dur - limit} phút`);
      hasOtherViolation = true;
    }
  }

  checkDuration(paxStart, paxEnd, LIMIT_PAX, "Pax xuống");
  checkDuration(dvvsStart, dvvsEnd, LIMIT_DVVS, "DVVS");
  checkDuration(cuvtStart, cuvtEnd, LIMIT_CUVT, "CUVT");
  checkDuration(fuelStart, fuelEnd, LIMIT_FUEL, "Nạp dầu");
  checkDuration(catStart, catEnd, LIMIT_CAT, "Catering");
  // checkDuration(bdtStart, bdtEnd, LIMIT_BDT, "Boarding Pax lên tàu");

  if (prebdt == null) {
    reasons.push("Chưa nhập PreBDT");
    hasOtherViolation = true;
  } 
  else if (prebdt > LIMIT_PREBDT) {
    const late = prebdt - LIMIT_PREBDT;
    reasons.push(`PreBDT trễ ${late} phút (Bãi ${bayText || "?"})`);
    hasOtherViolation = true;
  }

  if (bdtStart == null) {
    reasons.push("Chưa nhập Boarding bắt đầu");
    hasOtherViolation = true;
  } 
  else if (bdtStart > LIMIT_BDT_ABS) {
    const late = bdtStart - LIMIT_BDT_ABS;
    reasons.push(`Boarding trễ ${late} phút`);
    hasOtherViolation = true;
  }

  if (bdtStart != null && bdtEnd != null) {
    const dur = bdtEnd - bdtStart;
    if (dur > LIMIT_BDT) {
      reasons.push(`Boarding Pax trễ kéo dài ${dur - LIMIT_BDT} phút`);
      hasOtherViolation = true;
    }
  } 

  // ===== FHT ONLY WHEN OTHERS OK =====
  if (!hasOtherViolation && fht > LIMIT_FHT) {
    reasons.push(`FHT trễ ${fht - LIMIT_FHT} phút`);
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
