// generateReport35PDF.js — WORD MODE PATCH for pdf-lib (NO layout overlap, cursor engine, auto wrap)
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

exports.generateReport35PDF = async ({ formData, rows, outputPath }) => {
  const templatePath = path.join(__dirname, "../assets/7838025.pdf");
  const fontPath = path.join(__dirname, "../assets/NotoSans-Regular.ttf");
  const fontBoldPath = path.join(__dirname, "../assets/NotoSans-Bold.ttf");

  const pdfBytes = fs.readFileSync(templatePath);
  const fontBytes = fs.readFileSync(fontPath);
  const fontBoldBytes = fs.readFileSync(fontBoldPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const font = await pdfDoc.embedFont(fontBytes, { subset: false });
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: false });
  
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const FONT_SIZE = 15;
  const LINE_HEIGHT = 22; // Word-like spacing
  const COLOR = rgb(0, 0, 0);

  const safeText = (v) => (typeof v === "string" ? v : v != null ? String(v) : "");

const parseTime = (t) => {
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
};

const normalizeAfterAONBT = (time, aonbt) => {
  if (time == null || aonbt == null) return time;
  if (time < aonbt) return time + 1440;
  return time;
};

const getBaySLA = (aonbt, bayRaw) => {
  // bayRaw = "94", "B94", "Gate 102", "Bãi 35", ...
  const bayNum = parseInt(String(bayRaw).replace(/\D/g, ""));

  let T_PAX, T_PREBDT, T_BDT, T_FHT;

  // Ống lồng 94–102
  if (bayNum >= 94 && bayNum <= 102) {
    T_PAX = aonbt + 9;
    T_PREBDT = aonbt + 15;
    T_BDT = aonbt + 20;
    T_FHT = aonbt + 35;
  }

  // Bãi ngoài 71–93
  else if (bayNum >= 71 && bayNum <= 93) {
    T_PAX = aonbt + 9;
    T_PREBDT = aonbt + 9;
    T_BDT = null; // không KPI boarding
    T_FHT = aonbt + 35;
  }

  // Bãi xa 01–54
  else if (bayNum >= 1 && bayNum <= 54) {
    T_PAX = aonbt + 9;
    T_PREBDT = aonbt + 2;
    T_BDT = null;
    T_FHT = aonbt + 35;
  }

  // fallback default jet bridge
  else {
    T_PAX = aonbt + 9;
    T_PREBDT = aonbt + 15;
    T_BDT = aonbt + 20;
    T_FHT = aonbt + 35;
  }

  return { T_PAX, T_PREBDT, T_BDT, T_FHT };
};

const calcGT35 = (formData) => {
  const aonbt = parseTime(formData.time1);
  const fhtRaw = parseTime(formData.time19);
  const paxdown = parseTime(formData.time3);
  const prebdt = parseTime(formData.time14);
  const bdt = parseTime(formData.time17);
  const bay = formData.bay;

if (aonbt == null || fhtRaw == null) {
  return { status: "NO_DATA", reasons: [] };
}

  const fht = normalizeAfterAONBT(fhtRaw, aonbt);

  const { T_PAX, T_PREBDT, T_BDT, T_FHT } = getBaySLA(aonbt, bay);

  // PASS
  if (fht <= T_FHT) {
    return { status: "PASS", reasons: [] };
  }

  const reasons = ["FHT trễ"];

  if (!paxdown || paxdown > T_PAX) reasons.push("Pax xuống trễ");
  if (!prebdt || prebdt > T_PREBDT) reasons.push("PreBDT trễ");

  // chỉ check boarding nếu có SLA
  if (T_BDT && (!bdt || bdt > T_BDT)) reasons.push("Boarding trễ");

  return { status: "FAIL", reasons };
};

  // ================= WORD CURSOR ENGINE =================
  let cursorY = height - 140; // starting Y like Word top margin

  const drawLine = (text, x = 60) => {
    page.drawText(safeText(text), {
      x,
      y: cursorY,
      size: FONT_SIZE,
      font,
      color: COLOR,
    });
    cursorY -= LINE_HEIGHT;
  };

  // const drawParagraph = (text, x = 60, maxWidth = 480) => {
  //   const words = safeText(text).split(" ");
  //   let line = "";

  //   for (const word of words) {
  //     const test = line + word + " ";
  //     const width = font.widthOfTextAtSize(test, FONT_SIZE);

  //     if (width > maxWidth) {
  //       drawLine(line, x);
  //       line = word + " ";
  //     } else {
  //       line = test;
  //     }
  //   }
  //   if (line) drawLine(line, x);
  // };

  const drawLabelValue = (label, value) => {
    drawLine(`${label}: ${safeText(value)}`);
  };

  const drawCenteredText = (text, y, size = 16) => {
  const textWidth = fontBold.widthOfTextAtSize(text, size);
  const x = (width - textWidth) / 2;

  page.drawText(text, {
    x,
    y,
    size,
    font: fontBold,
    color: COLOR,
  });
};

  // ================= HEADER =================
  drawCenteredText("BÁO CÁO CHUYẾN BAY GROUND TIME 35 PHÚT", height - 80, 16);

  cursorY = height - 130;

  drawLabelValue("Số hiệu chuyến bay", `${formData.location1}/${formData.location2}`);
  drawLabelValue("Ngày,Tháng,Năm", `${formData.day}/${formData.month}/${formData.year}`);
  drawLabelValue("Số Hiệu Tàu Bay", formData.reg);
  drawLabelValue("Bãi Đỗ Tàu Bay", formData.bay);
  drawLabelValue("Thời gian STD/ETD", formData.time);

  cursorY -= LINE_HEIGHT;

  // ================= OPERATIONS TIMELINE =================
  drawLabelValue("Chèn", formData.time1);
  drawLabelValue("Khách xuống tàu", `${formData.time2} - ${formData.time3}`);
  drawLabelValue("Dở Hành Lý + Cargo", `${formData.time4} - ${formData.time5}`);
  // drawLabelValue("Tiếp viên", `${formData.crew1} - ${formData.crew2}`);
  // drawLabelValue("Tổ lái", `${formData.pilot1} - ${formData.pilot2}`);
  const crewText = formData.crewContinue
  ? "Đi tiếp"
  : `${formData.crew1 || ""} - ${formData.crew2 || ""}`;
  drawLabelValue("Tiếp viên", crewText);

  const pilotText = formData.pilotContinue
  ? "Đi tiếp"
  : `${formData.pilot1 || ""} - ${formData.pilot2 || ""}`;
  drawLabelValue("Tổ lái", pilotText);

  drawLabelValue("Dịch Vụ Vệ Sinh", `${formData.time6} - ${formData.time7}`);
  drawLabelValue("Cung Ứng Vật Tư", `${formData.time8} - ${formData.time9}`);
  drawLabelValue("Nạp dầu", `${formData.time10} - ${formData.time11}`);
  drawLabelValue("Suất Ăn", `${formData.time12} - ${formData.time13}`);
  drawLabelValue("PreBDT", formData.time14);
  drawLabelValue("Chất xếp", `${formData.time15} - ${formData.time16}`);
  drawLabelValue("Boarding", `${formData.time17} - ${formData.time18}`);
  drawLabelValue("FHT", formData.time19);

  cursorY -= LINE_HEIGHT;

  const gt = calcGT35(formData);

if (gt.status === "PASS") {
  drawLabelValue("=> Chuyến bay GT35", "ĐẠT");
}

if (gt.status === "FAIL") {
  drawLabelValue("=> Chuyến bay GT35 Trễ do");
}

if (gt.status === "NO_DATA") {
  drawLabelValue("=> Chuyến bay GT35", "Thiếu dữ liệu tính toán");
}

const isEmpty = (v) => !v || String(v).trim() === "";

const drawTripleValue = (label, v1, v2) => {
   if (isEmpty(v1) && isEmpty(v2)) return;

  let text = label + ": ";
  if (!isEmpty(v1)) text += safeText(v1);
  if (!isEmpty(v1) && !isEmpty(v2)) text += " - ";
  if (!isEmpty(v2)) text += safeText(v2);

  drawLine(text);
};

if (rows && rows.length > 0) {
  for (const row of rows) {
    if (cursorY < 60) break; // prevent overflow page bottom

    drawTripleValue(
      row.addinfo,
      row.timeX1,
      row.timeX2
    );
  }
} else {
  drawLine("Không có thông tin bổ sung");
}

//   cursorY -= LINE_HEIGHT;

  // ================= FLATTEN & SAVE =================
  const form = pdfDoc.getForm();
  form.flatten();

  const out = await pdfDoc.save();
  fs.writeFileSync(outputPath, out);
  console.log("PDF generated:", outputPath);
  return outputPath;
};
