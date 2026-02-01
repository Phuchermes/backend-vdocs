const express = require("express");
const router = express.Router();
const GroundOpsLog = require("../models/GroundOpsLog");
const { getGroundOpsResult, ENGINE_VERSION } = require("../services/groundOpsLogic");

router.post("/calculate", async (req, res) => {
  try {
    const result = getGroundOpsResult(req.body);

    // save log
    await GroundOpsLog.create({
      flightNo: req.body.reg || "",
      formData: req.body,
      result,
      engineVersion: ENGINE_VERSION,
    });

    res.json({
      success: true,
      result,
      engineVersion: ENGINE_VERSION,
      official: true,
    });

  } catch (err) {
    console.error("GROUND OPS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
