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

  const COLOR = rgb(0,0,0);
  const fontSize = 15;
  const safeText = (v) => typeof v === "string" ? v : v != null ? String(v) : "";

   const drawTextCentered = ({
    text,
    x,
    centerY,
    fontSize,
  }) => {
    if (!text) return;

    const textHeight = font.heightAtSize(fontSize);
    const y = centerY - textHeight / 2;

    page.drawText(safeText(text), {
      x,
      y,
      size: fontSize,
      font,
      color: COLOR,
    });
  };

  const drawQRCodeCentered = async ({
    value,
    x,
    centerY,
    size = 36,
  }) => {
    if (!value) return;

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

  const drawSignatureCentered = ({
    tmpPath,
    x,
    centerY,
    scale = 0.05,
  }) => {
    if (!tmpPath || !fs.existsSync(tmpPath)) return;

    const img = fs.readFileSync(tmpPath);
    return pdfDoc.embedPng(img).then((png) => {
      const w = png.width * scale;
      const h = png.height * scale;

      page.drawImage(png, {
        x,
        y: centerY - h / 2,
        width: w,
        height: h,
      });
    });
  };



    // Header info
      drawTextCentered({
    text: formData.location,
    x: 330,
    centerY: height - 133,
    fontSize: 15,
  });

  drawTextCentered({ text: formData.day, x: 420, centerY: height - 133, fontSize: 15 });
  drawTextCentered({ text: formData.month, x: 440, centerY: height - 133, fontSize: 15 });
  drawTextCentered({ text: formData.year, x: 460, centerY: height - 133, fontSize: 15 });

      // Draw each passenger + signatures
  const ROW_HEIGHT = 60;
  const FIRST_ROW_CENTER_Y = height - 250;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const centerY = FIRST_ROW_CENTER_Y - i * ROW_HEIGHT;

    drawTextCentered({ text: row.notice, x: 40, centerY, fontSize: 15 });
    drawTextCentered({ text: row.tnotice, x: 120, centerY, fontSize: 15 });
    drawTextCentered({ text: row.uldno, x: 180, centerY, fontSize: 15 });
    drawTextCentered({ text: row.pos, x: 290, centerY, fontSize: 15 });

    // 🔥 Số tag to hơn nhưng vẫn CENTER
    drawTextCentered({
      text: row.offtag,
      x: 400,
      centerY,
      fontSize: 22,
    });

    // 🔥 QR
    await drawQRCodeCentered({
      value: row.qr,
      x: 556,
      centerY,
      size: 36,
    });

    drawTextCentered({ text: row.end, x: 620, centerY, fontSize: 15 });
    drawTextCentered({ text: row.note, x: 720, centerY, fontSize: 15 });

    // 🔥 Signature NV
    await drawSignatureCentered({
      tmpPath: signavih?.sig1?.tmpPath,
      x: 640,
      centerY,
      scale: 0.05,
    });
  }
  
    const form = pdfDoc.getForm();
    form.flatten();
        
    const out = await pdfDoc.save();
    fs.writeFileSync(outputPath, out);
    console.log("PDF generated:", outputPath);
    return outputPath;
}