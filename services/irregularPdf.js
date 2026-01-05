const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

exports.generateIrregularPDF = async ({
  formData,
  checkboxes,
  signatures,
  outputPath,
}) => {
  const templatePath = path.join(
    __dirname,
    "../assets/784708725.pdf"
  );
  const fontPath = path.join(
    __dirname,
    "../assets/Noto-Sans-Regular.ttf"
  );

  const pdfBytes = fs.readFileSync(templatePath);
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  
  const font = await pdfDoc.embedFont(fontBytes, { subset: false });

  const form = pdfDoc.getForm();
  form.flatten();

  const page = pdfDoc.getPages()[0];
  const { height } = page.getSize();
    const fontSize = 15;
    const safeText = (v) => (v ? String(v) : "");
    
page.drawText("Tiếng Việt: Đặng Văn Khoa – thử nghiệm", {
  x: 50,
  y: height - 50,
  size: 40,
  font
});


    page.drawText(safeText(formData.location), { x: 120, y: height - 226, size: fontSize, font });
    page.drawText(safeText(formData.time), { x: 90, y: height - 166, size: fontSize, font });
    page.drawText(safeText(formData.day), { x: 225, y: height - 166, size: fontSize, font });
    page.drawText(safeText(formData.month), { x: 305, y: height - 166, size: fontSize, font });
    page.drawText(safeText(formData.year), { x: 380, y: height - 166, size: fontSize, font });

    page.drawText(safeText(formData.name1), { x: 90, y: height - 300, size: fontSize, font });
    page.drawText(safeText(formData.name2), { x: 90, y: height - 330, size: fontSize, font });
    page.drawText(safeText(formData.dept1), { x: 440, y: height - 300, size: fontSize, font });
    page.drawText(safeText(formData.dept2), { x: 440, y: height - 330, size: fontSize, font });

    page.drawText(safeText(formData.info), { x: 210, y: height - 370, size: fontSize, font });
    page.drawText(safeText(formData.tag), { x: 92, y: height - 401, size: fontSize, font });

    page.drawText(safeText(formData.location), { x: 145, y: height - 434, size: fontSize, font });
    page.drawText(safeText(formData.from), { x: 280, y: height - 434, size: fontSize, font });
    page.drawText(safeText(formData.to), { x: 420, y: height - 434, size: fontSize, font });

    page.drawText(safeText(formData.info), { x: 90, y: height - 467, size: fontSize, font });
    page.drawText(safeText(formData.cause), { x: 100, y: height - 500, size: fontSize, font });
    page.drawText(safeText(formData.resolve), { x: 180, y: height - 535, size: fontSize, font });

    page.drawText(safeText(formData.rep), { x: 228, y: height - 602, size: fontSize, font });

    page.drawText(safeText(formData.dept1), { x: 280, y: height - 682, size: fontSize, font });
    page.drawText(safeText(formData.dept2), { x: 450, y: height - 682, size: fontSize, font });

  // checkbox
  if (checkboxes.damaged)
    page.drawText(safeText("X"), { x: 178, y: height - 114, size: 14, font });
  if (checkboxes.wet)
    page.drawText(safeText("X"), { x: 294, y: height - 114, size: 14, font });
  if (checkboxes.leaking)
    page.drawText(safeText("X"), { x: 420, y: height - 114, size: 14, font });
  if (checkboxes.other)
    page.drawText(safeText("X"), { x: 526, y: height - 114, size: 14, font });

  // signatures
  if (signatures.sig1) {
    const img = await pdfDoc.embedPng(signatures.sig1.buffer);
    const s = img.scale(0.07);
    page.drawImage(img, { x: 230, y: -8, ...s });
  }

  if (signatures.sig2) {
    const img = await pdfDoc.embedPng(signatures.sig2.buffer);
    const s = img.scale(0.07);
    page.drawImage(img, { x: 390, y: -8, ...s });
  }

  const out = await pdfDoc.save();
  fs.writeFileSync(outputPath, out);
};
