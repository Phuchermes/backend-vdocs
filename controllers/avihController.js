const fs = require("fs");
const path = require("path");
const { generateAVIHPDF } = require("../services/avihPdf");

exports.createAVIH = async (req, res) => {
  try {
    const formData = JSON.parse(req.body.formData);

    const timestamp = Date.now();
    const baseDir = path.join(
      __dirname,
      "..",
      "uploads",
      "avih",
      String(timestamp)
    );

    fs.mkdirSync(baseDir, { recursive: true });

    //  Generate PDF
    await generateAVIHPDF({
      formData,
      signavih: {
        sig1: req.files.signavih1?.[0],
        sig2: req.files.signavih2?.[0],
      },
      outputPath: path.join(baseDir, "avih.pdf"),
    });

    // Save images
    if (req.files.images) {
      req.files.images.forEach((img, i) => {
        fs.writeFileSync(
          path.join(baseDir, `img_${i + 1}.jpg`),
          img.buffer
        );
      });
    }

    res.json({
      success: true,
      folder: timestamp,
      images: req.files.images?.length || 0,
    });
  } catch (err) {
    console.error("AVIH ERROR:", err);
    res.status(500).json({ message: "Create avih failed" });
  }
};
