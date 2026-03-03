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
  } else if (t.length === 4) {
    hh = parseInt(t.slice(0, 2));
    mm = parseInt(t.slice(2));
  } else return null;

  if (isNaN(hh) || isNaN(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  return hh * 60 + mm;
}

// ================= MIDNIGHT FIX =================

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

module.exports = {
  parseTime,
  normalizeAfterAONBT_VN
};