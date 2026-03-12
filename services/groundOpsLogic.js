const { GT_RULES } = require("./gtRules");
const { parseTime, normalizeAfterAONBT_VN } = require("./timeUtils");

function getGroundOpsResult(formData = {}) {

  const gt = Number(formData.gtType);
  const aircraft = String(formData.aircraftType || "").trim().toUpperCase();

  const rule = GT_RULES?.[gt]?.[aircraft];

  if (
  (formData.reportType === "D-3" && (
      formData.time2 || formData.time6 || formData.time8 ||
      formData.time10 || formData.time12 ||
      formData.time14 || formData.time17
  )) ||
  (formData.reportType === "D-0")
) {
  if (!rule) {
    return {
      status: "NIL",
      reasons: ["Không có dữ liệu để tính toán"],
      requireReason: false
    };
  }
}

  /* ===========================
     GT40+ → D-5 (DEPARTURE FIRST)
     =========================== */
if (formData.reportType === "D-5") {

  const stdRaw = parseTime(formData.time);
  if (!stdRaw) {
    return { status: "STD", reasons: [], requireReason: false };
  }

  const std = stdRaw;
  const fht = parseTime(formData.time19);

  if (!fht) {
    return { status: "CALCULATING", reasons: [], requireReason: false };
  }

  const LIMIT_D5 = std - 5;

  // Đạt D-5
  if (fht <= LIMIT_D5) {
    return {
      status: "PASS",
      reasons: [],
      requireReason: false
    };
  }

  // Quá STD → FAIL
  if (fht > std) {
    return {
      status: "FAIL",
      reasons: [`Chuyến bay trễ (${fht - std} phút)`],
      requireReason: true
    };
  }

  // STD-5 < FHT ≤ STD → Không đạt D-5
  return {
    status: "WARN",
    reasons: [`Không đạt D-5 (${fht - LIMIT_D5} phút)`],
    requireReason: true
  };
}

//D-3
if (formData.reportType === "D-3") {

  const std = parseTime(formData.time);
  const fhtRaw = parseTime(formData.time19);
  const aonbt = parseTime(formData.time1);

  // ===============================
  // DATA CHECK (00:00 SAFE)
  // ===============================
  console.log("std:", std);
  console.log("fhtRaw:", fhtRaw);


  if (std == null || fhtRaw == null) {
    return { status: "CALCULATING", reasons: [], requireReason: false };
  }

const hasServiceTime = !!(
  (parseTime(formData.time2) != null && parseTime(formData.time3) != null) ||
  (parseTime(formData.time6) != null && parseTime(formData.time7) != null) ||
  (parseTime(formData.time8) != null && parseTime(formData.time9) != null) ||
  (parseTime(formData.time10) != null && parseTime(formData.time11) != null) ||
  (parseTime(formData.time12) != null && parseTime(formData.time13) != null) ||
  (parseTime(formData.time17) != null && parseTime(formData.time18) != null)
);

console.log("hasServiceTime:", hasServiceTime);
  // =================================================
  // MODE 1 — Không có chèn → luôn STD-3
  // =================================================

if (!hasServiceTime) {

  let fht = fhtRaw;
  let stdTimeline = std;

console.log("fht after normalize:", fht);


  // Nếu FHT nhỏ hơn STD → coi là qua ngày
if (stdTimeline - fht > 720) {
  fht += 1440;
}

  const diff = fht - stdTimeline;

  // FAIL nếu trễ STD
  if (diff > 0) {
    return {
      status: "FAIL",
      reasons: [`Chuyến bay trễ STD (${diff} phút)`],
      requireReason: true
    };
  }

  // PASS nếu đạt D-3
  if (fht <= stdTimeline - 3) {
    return { status: "PASS", reasons: [], requireReason: false };
  }

  // WARN còn lại
  return {
    status: "WARN",
    reasons: [`Không đạt D-3 (${fht - (stdTimeline - 3)} phút)`],
    requireReason: true
  };
}


  // =================================================
  // LOAD RULE
  // =================================================
  const rule = GT_RULES[gt]?.[aircraft];
  const gtLimit = aonbt + gt;

  const SHOULD_USE_GT =
  hasServiceTime &&
  rule &&
  aonbt != null &&
  gtLimit >= std;


  function getServiceViolations(rule, aonbt, formData) {

    const reasons = [];

    const durationServices = [
      { start: "time2", end: "time3", limit: rule?.PAX, label: "PAX xuống" },
      { start: "time6", end: "time7", limit: rule?.DVVS, label: "DVVS" },
      { start: "time8", end: "time9", limit: rule?.CUVT, label: "CUVT" },
      { start: "time10", end: "time11", limit: rule?.FUEL, label: "Dầu" },
      { start: "time12", end: "time13", limit: rule?.CAT, label: "VACS" },
      { start: "time17", end: "time18", limit: rule?.BDT_DUR, label: "Boarding" }
    ];

    durationServices.forEach(s => {
      if (typeof s.limit !== "number") return;

      const start = parseTime(formData[s.start]);
      const end = parseTime(formData[s.end]);

      if (start == null || end == null) return;

      let duration = end - start;
      if (duration < 0) duration += 1440;

      if (duration > s.limit) {
        reasons.push(`${s.label} quá ${duration - s.limit} phút`);
      }
    });

    // PREBDT
    const preStartRaw = parseTime(formData.time14);

    if (preStartRaw != null && aonbt != null) {

      let preStart = preStartRaw;
      if (preStart < aonbt) preStart += 1440;

      let preOffset = null;

      if (formData.bayType === "PRE_BRIDGE") {
        preOffset = rule?.PRE_BRIDGE;
      }

      if (formData.bayType === "PRE_OUT") {
        preOffset = rule?.PRE_OUT;
      }

      if (typeof preOffset === "number") {

        const limit = aonbt + preOffset;

        if (preStart > limit) {
          reasons.push(`PreBDT trễ ${preStart - limit} phút`);
        }
      }
    }

    // BDT_OFFSET
    if (typeof rule?.BDT_OFFSET === "number" && aonbt != null) {

      const bdtStartRaw = parseTime(formData.time17);

      if (bdtStartRaw != null) {

        let actual = bdtStartRaw;
        if (actual < aonbt) actual += 1440;

        const limit = aonbt + rule.BDT_OFFSET;

        if (actual > limit) {
          reasons.push(`Boarding trễ ${actual - limit} phút`);
        }
      }
    }

    return reasons;
  }

// =================================================
// MODE 2 — Có chèn nhưng không rule (FIXED)
// =================================================
if (!SHOULD_USE_GT) {
  console.log({
  gt,
  rule,
  SHOULD_USE_GT
});

  let fht = fhtRaw;
  let stdNorm = std;

  // normalize qua ngày
  if (stdNorm - fht > 720) {
    fht += 1440;
  }

  if (fht - stdNorm > 720) {
    stdNorm += 1440;
  }

  const diff = fht - stdNorm;

  // ================= FAIL =================
  if (diff > 0) {
    return {
      status: "FAIL",
      reasons: [`Chuyến bay trễ STD (${diff} phút)`],
      requireReason: true
    };
  }

  // ================= PASS =================
  if (fht <= stdNorm - 3) {
    return { status: "PASS", reasons: [], requireReason: false };
  }

  // ================= WARN =================
  return {
    status: "WARN",
    reasons: [`Không đạt D-3 (${fht - (stdNorm - 3)} phút)`],
    requireReason: true
  };
}
// =================================================
// MODE 3 — GT STRICT (HARD PASS D-3)
// =================================================

let fht = fhtRaw;
let aonbtNorm = aonbt;

// ================= NORMALIZE =================

if (aonbtNorm - fht > 720) {
  fht += 1440;
}

const limitGT = aonbtNorm + gt;
const deadlineD3 = limitGT - 3;

const serviceReasons = getServiceViolations(rule, aonbtNorm, formData);

// ================= HARD PASS =================
// FHT = AONBT + GT - 3 → PASS tuyệt đối

if (fht === deadlineD3) {
  return {
    status: "PASS",
    reasons: [],
    requireReason: false
  };
}

// ================= FAIL =================

if (fht > limitGT) {
  return {
    status: "FAIL",
    reasons: [
      `Chuyến bay trễ GT (${fht - limitGT} phút)`,
      ...serviceReasons
    ],
    requireReason: true
  };
}

// ================= WARN (KHÔNG ĐẠT D-3) =================

if (fht > deadlineD3) {
  return {
    status: "WARN",
    reasons: [
      `Không đạt D-3 (${fht - deadlineD3} phút)`,
      ...serviceReasons
    ],
    requireReason: true
  };
}

// ================= PASS / SERVICE =================

if (serviceReasons.length > 0) {
  return {
    status: "WARN",
    reasons: serviceReasons,
    requireReason: true
  };
}

return {
  status: "PASS",
  reasons: [],
  requireReason: false
};
}

  /* ===========================
     GT35 → QUAY ĐẦU 
     =========================== */
if (gt === 35 && formData.reportType === "D-0") {

  // ===== 1. AONBT =====
  const aonbtRaw = parseTime(formData.time1);
  if (!aonbtRaw) {
    return { status: "NO DATA", reasons: [], requireReason: false };
  }
  const aonbt = aonbtRaw;

  // ===== 2. FHT =====
  const fhtRaw = parseTime(formData.time19);
  const fht = normalizeAfterAONBT_VN(fhtRaw, aonbt);
  if (fht == null) {
    return { status: "CALCULATING", reasons: [], requireReason: false };
  }

  const LIMIT_FHT = aonbt + 35;

  // ===== 3. STD =====
  const std = parseTime(formData.time);

  // ===== 4. LOAD FUNCTION =====
  function load(startKey, endKey) {
    const s = normalizeAfterAONBT_VN(parseTime(formData[startKey]), aonbt);
    const e = normalizeAfterAONBT_VN(parseTime(formData[endKey]), aonbt);
    return { start: s, end: e };
  }

  const pax = load("time2", "time3");
  const dvvs = load("time6", "time7");
  const cuvt = load("time8", "time9");
  const fuel = load("time10", "time11");
  const cat = load("time12", "time13");
  const bdt = load("time17", "time18");
  const prebdt = normalizeAfterAONBT_VN(parseTime(formData.time14), aonbt);

  let reasons = [];
  let hasViolation = false; //FIX BUG

  // ===== 5. CHECK SERVICE DURATION =====
  function checkDuration(obj, limit, label) {
    if (obj.start == null || obj.end == null) return;

    const dur = obj.end - obj.start;

    if (dur > limit) {
      reasons.push(`${label} trễ ${dur - limit} phút`);
      hasViolation = true;
    }
  }

  checkDuration(pax, rule.PAX, "Pax xuống");
  checkDuration(dvvs, rule.DVVS, "DVVS");
  checkDuration(cuvt, rule.CUVT, "CUVT");
  checkDuration(fuel, rule.FUEL, "Nạp dầu");
  checkDuration(cat, rule.CAT, "Catering");

  // ===== 6. PREBDT =====
  let PRE_LIMIT = null;

  if (formData.bayType === "PRE_BRIDGE") {
    PRE_LIMIT = rule.PRE_BRIDGE;
  }

  if (formData.bayType === "PRE_OUT") {
    PRE_LIMIT = rule.PRE_OUT;
  }

  if (typeof PRE_LIMIT === "number" && prebdt != null) {

    const LIMIT_PREBDT = aonbt + PRE_LIMIT;

    if (prebdt > LIMIT_PREBDT) {
      reasons.push(`PreBDT trễ ${prebdt - LIMIT_PREBDT} phút`);
      hasViolation = true;
    }
  }

  // ===== 7. BOARDING =====
  const LIMIT_BDT_ABS = aonbt + rule.BDT_OFFSET;

  if (bdt.start != null && bdt.start > LIMIT_BDT_ABS) {
    reasons.push(`Boarding trễ ${bdt.start - LIMIT_BDT_ABS} phút`);
    hasViolation = true;
  }

  if (bdt.start != null && bdt.end != null) {

    const dur = bdt.end - bdt.start;

    if (dur > rule.BDT_DUR) {
      reasons.push(`Boarding kéo dài ${dur - rule.BDT_DUR} phút`);
      hasViolation = true;
    }
  }

  // =====================================================
  // ===== 8. FINAL KPI LOGIC (GT35 ưu tiên) =====
  // =====================================================

  const stdNorm = normalizeAfterAONBT_VN(std, aonbt);

  // ===== TH2: FHT = STD nhưng vượt GT35 =====
  if (stdNorm != null && fht === stdNorm && fht > LIMIT_FHT) {
    return {
      status: "WARN",
      reasons: [
        `Không đạt GT35 (${fht - LIMIT_FHT} phút)`,
        ...reasons
      ],
      requireReason: true
    };
  }

  // ===== TH3: vượt GT35 =====
  if (fht > LIMIT_FHT) {
    return {
      status: "FAIL",
      reasons: [
        `Chuyến bay GT35 Trễ (${fht - LIMIT_FHT} phút)`,
        ...reasons
      ],
      requireReason: true
    };
  }

  // ===== TH1: trong GT35 =====
  if (fht <= LIMIT_FHT) {
    return {
      status: "PASS",
      reasons: [],
      requireReason: false
    };
  }
}
}

module.exports = { getGroundOpsResult };