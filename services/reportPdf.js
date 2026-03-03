const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const {getGroundOpsResult} = require("./groundOpsLogic"); // dùng engine chung

exports.generateReportPDF = async ({ formData, rows, outputPath }) => {
  // ================= LOAD TEMPLATE =================
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

  // ================= STYLE =================
  const FONT_SIZE = 15;
  const LINE_HEIGHT = 22;
  const COLOR = rgb(0, 0, 0);

  const safeText = (v) =>
    typeof v === "string" ? v : v != null ? String(v) : "";

  // ================= WORD CURSOR ENGINE =================
  let cursorY = height - 140;

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

  const isEmpty = (v) => !v || String(v).trim() === "";

  const drawTripleValue = (label, v1, v2) => {
    if (isEmpty(label)) return;

    let text = safeText(label);

    if (!isEmpty(v1) || !isEmpty(v2)) {
      text += ": ";
      if (!isEmpty(v1)) text += safeText(v1);
      if (!isEmpty(v1) && !isEmpty(v2)) text += " - ";
      if (!isEmpty(v2)) text += safeText(v2);
    }

    drawLine(text);
  };

  // ================= HEADER =================
  const typeMap = {
    "D-0": "GT35"
  };

  const displayType =
    typeMap[formData.reportType] || formData.reportType || "";

  drawCenteredText(
    `BÁO CÁO CHUYẾN BAY KHÔNG ĐẠT ${displayType}`,
    height - 80,
    16
  );

  cursorY = height - 130;

  // ================= BASIC INFO =================
  drawLabelValue(
    "Số hiệu chuyến bay",
    `${formData.location1}/${formData.location2}`
  );
  drawLabelValue(
    "Ngày,Tháng,Năm",
    `${formData.day}/${formData.month}/${formData.year}`
  );
  drawLabelValue("Số Hiệu Tàu Bay", formData.reg);
  drawLabelValue("Bãi Đỗ Tàu Bay", formData.bay);
  drawLabelValue("Thời gian STD/ETD", formData.time);

  cursorY -= LINE_HEIGHT;

  // ================= OPERATIONS =================
  if (!formData.aonbtContinue) {
    drawLabelValue("Chèn", formData.time1);
}
if (!formData.paxContinue) {
    drawLabelValue("Khách xuống tàu", `${formData.time2} - ${formData.time3}`);
}
  if (!formData.cargoContinue) {
  drawLabelValue("Dở Hành Lý + Cargo", `${formData.time4} - ${formData.time5}`);
}

  drawLabelValue(
    "Tiếp viên",
    formData.crewContinue
      ? "Đi tiếp"
      : `${formData.crew1 || ""} - ${formData.crew2 || ""}`
  );

  drawLabelValue(
    "Tổ lái",
    formData.pilotContinue
      ? "Đi tiếp"
      : `${formData.pilot1 || ""} - ${formData.pilot2 || ""}`
  );

if (!formData.dvvsContinue) {
    drawLabelValue("Dịch Vụ Vệ Sinh", `${formData.time6} - ${formData.time7}`);
}

if (!formData.cuvtContinue) {
    drawLabelValue("Cung Ứng Vật Tư", `${formData.time8} - ${formData.time9}`);
}
  
  drawLabelValue("Nạp dầu", formData.fuelContinue ? "Đã nạp" :  `${formData.time10} - ${formData.time11}`);
  drawLabelValue("Suất Ăn", formData.vacsContinue ? "Đã Cấp suất ăn" :  `${formData.time12} - ${formData.time13}`);
  drawLabelValue("PreBDT", formData.time14);
  drawLabelValue("Chất xếp", `${formData.time15} - ${formData.time16}`);
  drawLabelValue("Boarding", `${formData.time17} - ${formData.time18}`);
  drawLabelValue("FHT", formData.time19);

  cursorY -= LINE_HEIGHT;

  // ================= KPI RESULT (ENGINE) =================
  const result = getGroundOpsResult(formData);

  if (result.status === "PASS") {
    drawLabelValue("=> Chuyến bay", `ĐẠT ${displayType}`);
  }

  if (result.status === "FAIL") {
  if (displayType === "GT35") {
    drawLabelValue("=> Chuyến bay KHÔNG ĐẠT GT35 do", "");
  }
  else if (displayType === "GT45"){
    drawLabelValue("=> Chuyến bay KHÔNG ĐẠT GT45 do", "");
  } 
  else {
    drawLabelValue("=> Chuyến bay TRỄ do", "");
  }
}

    if (result.status === "WARN") {
    drawLabelValue("=> Chuyến bay", `KHÔNG ĐẠT ${formData.reportType || ""} do`);
  }

  if (result.status === "CALCULATING") {
    drawLabelValue("=> Chuyến bay", "Thiếu dữ liệu tính toán");
  }

  // ================= REASONS =================
  if (rows && rows.length > 0) {
    for (const row of rows) {
      if (cursorY < 60) break;
      drawTripleValue(row.addinfo, row.timeX1, row.timeX2);
    }
  } else {
    drawLine("Không có thông tin bổ sung");
  }

  // ================= SAVE =================
  pdfDoc.getForm().flatten();
  const out = await pdfDoc.save();
  fs.writeFileSync(outputPath, out);

  console.log("PDF generated:", outputPath);
  return outputPath;
};
