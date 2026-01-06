const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

exports.generateIrregularPDF = async ({
  formData,
  checkboxes,
  signatures,
  outputPath,
}) => {

  const templatePath = path.join(__dirname,"../assets/784708725.pdf");
  const fontPath = path.join(__dirname, "../assets/NotoSans-Regular.ttf"); 

  const pdfBytes = fs.readFileSync(templatePath);
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  
  const font = await pdfDoc.embedFont(fontBytes, { subset: false });

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  console.log(width, height); 
    const fontSize = 15;
      const safeText = (v) =>
    typeof v === "string" ? v : v != null ? String(v) : "";
    
// page.drawText("Tiếng Việt: Đặng Văn Khoa - thử nghiệm", {
//   x: 50,
//   y: height - 50,
//   size: 40,
//   font
// });


  //   page.drawText(safeText(formData.location), { x: 120, y: height - 226, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.time), { x: 90, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.day), { x: 225, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.month), { x: 305, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.year), { x: 380, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });

  //   page.drawText(safeText(formData.name1), { x: 90, y: height - 300, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.name2), { x: 90, y: height - 330, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.dept1), { x: 440, y: height - 300, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.dept2), { x: 440, y: height - 330, size: fontSize, font, color: rgb(0,0,0) });

  //   page.drawText(safeText(formData.info), { x: 210, y: height - 370, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.tag), { x: 92, y: height - 401, size: fontSize, font, color: rgb(0,0,0) });

  //   page.drawText(safeText(formData.location), { x: 145, y: height - 434, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.from), { x: 280, y: height - 434, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.to), { x: 420, y: height - 434, size: fontSize, font, color: rgb(0,0,0) });

  //   page.drawText(safeText(formData.info), { x: 90, y: height - 467, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.cause), { x: 100, y: height - 500, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.resolve), { x: 180, y: height - 535, size: fontSize, font, color: rgb(0,0,0) });

  //   page.drawText(safeText(formData.rep), { x: 228, y: height - 602, size: fontSize, font, color: rgb(0,0,0) });

  //   page.drawText(safeText(formData.dept1), { x: 280, y: height - 682, size: fontSize, font, color: rgb(0,0,0) });
  //   page.drawText(safeText(formData.dept2), { x: 450, y: height - 682, size: fontSize, font, color: rgb(0,0,0) });
    

  // // checkbox
  // if (checkboxes.damaged)
  //   page.drawText(safeText("X"), { x: 178, y: height - 114, size: 14, font, color: rgb(0,0,0) });
  // if (checkboxes.wet)
  //   page.drawText(safeText("X"), { x: 294, y: height - 114, size: 14, font, color: rgb(0,0,0) });
  // if (checkboxes.leaking)
  //   page.drawText(safeText("X"), { x: 420, y: height - 114, size: 14, font, color: rgb(0,0,0) });
  // if (checkboxes.other)
  //   page.drawText(safeText("X"), { x: 526, y: height - 114, size: 14, font, color: rgb(0,0,0) });

  // ==== DRAW TEXT FIELDS ====
  const textFields = [
    { key: "location", x: 120, y: height - 226 },
    { key: "time", x: 90, y: height - 166 },
    { key: "day", x: 225, y: height - 166 },
    { key: "month", x: 305, y: height - 166 },
    { key: "year", x: 380, y: height - 166 },
    { key: "name1", x: 90, y: height - 300 },
    { key: "name2", x: 90, y: height - 330 },
    { key: "dept1", x: 440, y: height - 300 },
    { key: "dept2", x: 440, y: height - 330 },
    { key: "info", x: 210, y: height - 370 },
    { key: "tag", x: 92, y: height - 401 },
    { key: "from", x: 280, y: height - 434 },
    { key: "to", x: 420, y: height - 434 },
    { key: "cause", x: 100, y: height - 500 },
    { key: "resolve", x: 180, y: height - 535 },
    { key: "rep", x: 228, y: height - 602 },
  ];

  for (const field of textFields) {
    const val = safeText(formData[field.key]);
    if (val) {
      page.drawText(val, {
        x: field.x,
        y: field.y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        maxWidth: 400, // tránh tràn chữ
      });
    }
  }

  // ==== CHECKBOXES ====
  const checkboxMap = {
    damaged: { x: 178, y: height - 114 },
    wet: { x: 294, y: height - 114 },
    leaking: { x: 420, y: height - 114 },
    other: { x: 526, y: height - 114 },
  };
  Object.keys(checkboxMap).forEach(key => {
    if (checkboxes[key]) {
      const { x, y } = checkboxMap[key];
      page.drawText("X", { x, y, size: 14, font, color: rgb(0,0,0) });
    }
  });

  // signatures
  if (signatures.sig1) {
    const img = await pdfDoc.embedPng(fs.readFileSync(signatures.sig1.tmpPath));
    page.drawImage(img, { x: 230, y: -8, width: img.width * 0.07, height: img.height * 0.07 });
  }
  if (signatures.sig2) {
    const img = await pdfDoc.embedPng(fs.readFileSync(signatures.sig2.tmpPath));
    page.drawImage(img, { x: 390, y: -8, width: img.width * 0.07, height: img.height * 0.07 });
  }

  const form = pdfDoc.getForm();
  form.flatten();

  const out = await pdfDoc.save();
  fs.writeFileSync(outputPath, out);
};
