const fs = require("fs");
const path = require("path");
const { generateReport35PDF } = require("../services/report35Pdf");

exports.createReport35 = async (req, res) => {
  try {
    const formData = JSON.parse(req.body.formData);

    const timestamp = Date.now();
    const baseDir = path.join(
      __dirname,
      "..",
      "uploads",
      "report35",
      String(timestamp)
    );

    fs.mkdirSync(baseDir, { recursive: true });

    //  Generate PDF
    await generateReport35PDF({
      formData,
      outputPath: path.join(baseDir, "report35.pdf"),
    });
    
    res.json({
      success: true,
      folder: timestamp,
    });
  } catch (err) {
    console.error("Report35 ERROR:", err);
    res.status(500).json({ message: "Create Report35 failed" });
  }
};
