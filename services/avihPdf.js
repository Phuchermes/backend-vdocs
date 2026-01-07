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

exports.generateAVIHPDF = async ({
  formData,
  rows,
  signavih,
  outputPath,
  
}) => {

  const templatePath = path.join(__dirname,"../assets/78482025.pdf");
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
    // Header info
      page.drawText(safeText(formData.day), { x: 90, y: height - 120, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.month), { x: 118, y: height - 120, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.year), { x: 145, y: height - 120, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.trans), { x: 180, y: height - 133, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.reg), { x: 500, y: height - 133, size: fontSize, font, color: rgb(0,0,0) });

      // Draw each passenger + signatures
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const baseX = height - 250 - i * 60;
        const baseY = height - 300 - i * 60;
        page.drawText(safeText(row.name), { x: 90, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.avih), { x: 250, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.status), { x: 360, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.tag), { x: 450, y: baseX, size: fontSize, font, color: rgb(0,0,0) });

        // Draw NV1 signature
        if (signavih?.sig1?.tmpPath) {
          const img = await pdfDoc.embedPng(fs.readFileSync(signavih.sig1.tmpPath));
          page.drawImage(img, { x: 500, y: baseY , width: img.width * 0.07, height: img.height * 0.07 });
          console.log("SIG1 PATH:", signavih.sig1.tmpPath);
        }

        // Draw NV2 signature
        if (signavih?.sig2?.tmpPath) {
          const img = await pdfDoc.embedPng(fs.readFileSync(signavih.sig2.tmpPath));
          page.drawImage(img, { x: 570, y: baseY, width: img.width * 0.07, height: img.height * 0.07 });
          console.log("SIG2 PATH:", signavih.sig2.tmpPath);
        }
    }
    const form = pdfDoc.getForm();
        form.flatten();
        
          const out = await pdfDoc.save();
          fs.writeFileSync(outputPath, out);
          console.log("PDF generated:", outputPath);
          return outputPath;
}