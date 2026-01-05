const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createIrregular } = require("../controllers/irregularController");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "signature1", maxCount: 1 },
    { name: "signature2", maxCount: 1 },
  ]),
  createIrregular
);

module.exports = router;
