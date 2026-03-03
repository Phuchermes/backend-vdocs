const fs = require("fs");
const path = require("path");
const { generateReport35PDF } = require("../services/reportPdf");

exports.createReport = async (req, res) => {
  try {
    const formData = JSON.parse(req.body.formData);

    const timestamp = Date.now();
    const baseDir = path.join(
      __dirname,
      "..",
      "uploads",
      "report",
      String(timestamp)
    );

    fs.mkdirSync(baseDir, { recursive: true });

    //  Generate PDF
    await generateReport35PDF({
      formData,
      outputPath: path.join(baseDir, "report.pdf"),
    });
    
    res.json({
      success: true,
      folder: timestamp,
    });
  } catch (err) {
    console.error("Report ERROR:", err);
    res.status(500).json({ message: "Create Report failed" });
  }
};
