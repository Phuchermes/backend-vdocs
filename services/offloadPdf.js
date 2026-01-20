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
  const { height } = page.getSize();
  console.log(height); 

  // const COLOR = rgb(0,0,0);
  const FONT_SIZE = 15;
  const safeText = (v) => typeof v === "string" ? v : v != null ? String(v) : "";

    // Header info
 page.drawText(safeText(formData.location), {
    x: 330,
    y: height - 132,
    size: FONT_SIZE,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(safeText(formData.day), {
    x: 420,
    y: height - 132,
    size: FONT_SIZE,
    font,
  });

  page.drawText(safeText("/"), {
    x: 434,
    y: height - 132,
    size: FONT_SIZE,
    font,
  });

  page.drawText(safeText(formData.month), {
    x: 440,
    y: height - 132,
    size: FONT_SIZE,
    font,
  });

  page.drawText(safeText("/"), {
    x: 454,
    y: height - 132,
    size: FONT_SIZE,
    font,
  });

  page.drawText(safeText(formData.year), {
    x: 460,
    y: height - 132,
    size: FONT_SIZE,
    font,
  });
      // Draw each passenger + signatures
   const ROW_CENTER_Y = [
    height - 215,
    height - 258,
    height - 302,
    height - 345,
    height - 389,
    height - 433,
    height - 478,
    height - 522,
  ];

    const drawTextCentered = (text, x, centerY, size = FONT_SIZE) => {
    page.drawText(safeText(text), {
      x,
      y: centerY - size / 2 + 2, // fix baseline
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const drawQRCentered = async (value, x, centerY, size = 32) => {
    const qrBase64 = await QRCode.toDataURL(value);
    const img = await pdfDoc.embedPng(
      Buffer.from(qrBase64.split(",")[1], "base64")
    );

    page.drawImage(img, {
      x,
      y: centerY - size / 2,
      width: size,
      height: size,
    });
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const y = ROW_CENTER_Y[i];
    if (!y) break;

    drawTextCentered(row.notice, 40, y);
    drawTextCentered(row.tnotice, 120, y);
    drawTextCentered(row.uldno, 180, y);
    drawTextCentered(row.pos, 290, y);
    drawTextCentered(row.offtag, 400, y, 22);

    // 🔥 QR
if (row.qr) {
      await drawQRCentered(row.qr, 560, y, 39);
    }

    drawTextCentered(row.end, 620, y);
    drawTextCentered(row.note, 720, y);

    // Signature (DVSD)
    if (signavih?.sig1?.tmpPath) {
      const img = await pdfDoc.embedPng(
        fs.readFileSync(signavih.sig1.tmpPath)
      );
      page.drawImage(img, {
        x: 650,
        y: y - 40,
        width: img.width * 0.06,
        height: img.height * 0.06,
      });
    }
  }

    const form = pdfDoc.getForm();
    form.flatten();
        
    const out = await pdfDoc.save();
    fs.writeFileSync(outputPath, out);
    console.log("PDF generated:", outputPath);
    return outputPath;
}