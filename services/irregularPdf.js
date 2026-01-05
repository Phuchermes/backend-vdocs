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
    "../assets/Roboto-Regular.ttf"
  );

  const pdfBytes = fs.readFileSync(templatePath);
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.getPages()[0];
  const { height } = page.getSize();
    const fontSize = 15;
    const safe = (v) => (v ? String(v) : "");

  page.getTextField("location").setText(safe(formData.location));
  page.getTextField("time").setText(safe(formData.time));
  page.getTextField("day").setText(safe(formData.day));
  page.getTextField("month").setText(safe(formData.month));
  page.getTextField("year").setText(safe(formData.year));

    page.getTextField("name1").setText(safe(formData.name1));
  page.getTextField("name2").setText(safe(formData.name2));
  page.getTextField("dept1").setText(safe(formData.dept1));
  page.getTextField("dept2").setText(safe(formData.dept2));

     page.getTextField("info").setText(safe(formData.info));
  page.getTextField("tag").setText(safe(formData.tag));

    page.getTextField("location").setText(safe(formData.location));
     page.getTextField("from").setText(safe(formData.from));
  page.getTextField("to").setText(safe(formData.to));

     page.getTextField("cause").setText(safe(formData.cause));
  page.getTextField("resolve").setText(safe(formData.resolve));
  page.getTextField("rep").setText(safe(formData.rep));

    page.getTextField("dept1").setText(safe(formData.dept1));
  page.getTextField("dept2").setText(safe(formData.dept2));

  // checkbox
   if (checkboxes.damaged) page.getCheckBox("damages").check();
  if (checkboxes.wet) page.getCheckBox("wet").check();
  if (checkboxes.leaking) page.getCheckBox("leaking").check();
  if (checkboxes.other) page.getCheckBox("other").check();

  page.updateFieldAppearances(font);

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

  page.flatten();

  const out = await pdfDoc.save();
  fs.writeFileSync(outputPath, out);
};
