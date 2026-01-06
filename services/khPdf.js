const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

/**
 * @param {Object} options
 *   - formData: { day, month, year, time, location, name1, name2, dept1, dept2, info, tag, from, to, cause, resolve, rep }
 *   - checkboxes: { damaged, wet, leaking, other }
 *   - images: [{ path, originalname }]
 *   - signatures: { sig1: file, sig2: file }
 *   - outputPath: string
 */

exports.generateKHPDF = async ({
  formData,
  checkboxes,
  images,
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
    
    page.drawText(safeText(formData.location), { x: 120, y: height - 226, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.time), { x: 90, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.day), { x: 225, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.month), { x: 305, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.year), { x: 380, y: height - 166, size: fontSize, font, color: rgb(0,0,0) });

    page.drawText(safeText(formData.name1), { x: 90, y: height - 300, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.name2), { x: 90, y: height - 330, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.dept1), { x: 440, y: height - 300, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.dept2), { x: 440, y: height - 330, size: fontSize, font, color: rgb(0,0,0) });

    page.drawText(safeText(formData.info), { x: 210, y: height - 370, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.tag), { x: 92, y: height - 401, size: fontSize, font, color: rgb(0,0,0) });

    page.drawText(safeText(formData.location), { x: 145, y: height - 434, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.from), { x: 280, y: height - 434, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.to), { x: 420, y: height - 434, size: fontSize, font, color: rgb(0,0,0) });

    page.drawText(safeText(formData.info), { x: 90, y: height - 467, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.cause), { x: 100, y: height - 500, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.resolve), { x: 180, y: height - 535, size: fontSize, font, color: rgb(0,0,0) });

    page.drawText(safeText(formData.rep), { x: 228, y: height - 602, size: fontSize, font, color: rgb(0,0,0) });

    page.drawText(safeText(formData.dept1), { x: 280, y: height - 682, size: fontSize, font, color: rgb(0,0,0) });
    page.drawText(safeText(formData.dept2), { x: 450, y: height - 682, size: fontSize, font, color: rgb(0,0,0) });
    

  // checkbox
  if (checkboxes.damaged)
    page.drawText(safeText("X"), { x: 178, y: height - 114, size: 14, font, color: rgb(0,0,0) });
  if (checkboxes.wet)
    page.drawText(safeText("X"), { x: 294, y: height - 114, size: 14, font, color: rgb(0,0,0) });
  if (checkboxes.leaking)
    page.drawText(safeText("X"), { x: 420, y: height - 114, size: 14, font, color: rgb(0,0,0) });
  if (checkboxes.other)
    page.drawText(safeText("X"), { x: 526, y: height - 114, size: 14, font, color: rgb(0,0,0) });

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
  console.log("PDF generated:", outputPath);
  return outputPath;
};
