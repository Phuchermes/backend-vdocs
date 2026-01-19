const fs = require("fs");
const path = require("path");
const { generateULDPDF } = require("../services/offloadPdf");

exports.createOffload = async (req, res) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const checkboxes = JSON.parse(req.body.checkboxes || "{}");

    const timestamp = Date.now();
    const baseDir = path.join(
      __dirname,
      "..",
      "uploads",
      "offload",
      String(timestamp)
    );

    fs.mkdirSync(baseDir, { recursive: true });

    //  Generate PDF
    await generateULDPDF({
      formData,
      checkboxes,
      signavih: {
        sig1: req.files.signavih1?.[0],
      },
      outputPath: path.join(baseDir, "offload.pdf"),
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
    console.error("ULD ERROR:", err);
    res.status(500).json({ message: "Create uld failed" });
  }
};
