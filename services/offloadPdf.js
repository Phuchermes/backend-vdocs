const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const QRCode = require("qrcode");

/**
 * @param {Object} options
 *   - formData: { day, month, year, time, location, name1, name2, dept1, dept2, info, tag, from, to, cause, resolve, rep }
 *   - checkboxes: { damaged, wet, leaking, other }
 *   - images: [{ path, originalname }]
 *   - signatures: { sig1: file, sig2: file }
 *   - outputPath: string
 */

exports.generateOffloadPDF = async ({
  formData,
  rows,
  signavih,
  outputPath,
}) => {

  const templatePath = path.join(__dirname,"../assets/78490825.pdf");
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
      page.drawText(safeText(formData.location), { x: 330, y: height - 133, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.day), { x: 420, y: height - 133, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.month), { x: 440, y: height - 133, size: fontSize, font, color: rgb(0,0,0) });
      page.drawText(safeText(formData.year), { x: 460, y: height - 133, size: fontSize, font, color: rgb(0,0,0) });

      // Draw each passenger + signatures
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const baseX = height - 220 - i * 60;
        const baseY = height - 236 - i * 60;
        page.drawText(safeText(row.notice), { x: 40, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.tnotice), { x: 120, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.uldno), { x: 180, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.pos), { x: 290, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.offtag), { x: 400, y: baseX, size: 22, font, color: rgb(0,0,0) });

      if (row.qr) {
        const qrBase64 = await QRCode.toDataURL(row.qr);
        const img = await pdfDoc.embedPng(Buffer.from(qrBase64.split(",")[1], "base64"));
        page.drawImage(img, {x: 556, y: baseY, width: img.width * 0.22, height: img.height * 0.190});
      }

        page.drawText(safeText(row.end), { x: 620, y: baseX, size: fontSize, font, color: rgb(0,0,0) });
        page.drawText(safeText(row.note), { x: 720, y: baseX, size: fontSize, font, color: rgb(0,0,0) });

        // Draw NV1 signature
        if (signavih?.sig1?.tmpPath) {
          const img = await pdfDoc.embedPng(fs.readFileSync(signavih.sig1.tmpPath));
          page.drawImage(img, { x: 640, y: baseY , width: img.width * 0.07, height: img.height * 0.05 });
          console.log("SIG1 PATH:", signavih.sig1.tmpPath);
        }

        // // Draw NV2 signature
        // if (signavih?.sig2?.tmpPath) {
        //   const img = await pdfDoc.embedPng(fs.readFileSync(signavih.sig2.tmpPath));
        //   page.drawImage(img, { x: 570, y: baseY, width: img.width * 0.07, height: img.height * 0.07 });
        //   console.log("SIG2 PATH:", signavih.sig2.tmpPath);
        // }
    }
    const form = pdfDoc.getForm();
    form.flatten();
        
    const out = await pdfDoc.save();
    fs.writeFileSync(outputPath, out);
    console.log("PDF generated:", outputPath);
    return outputPath;
}