const express = require("express");
const dispatcher = require("../../../middleware/dispatcher");
const { uploadFile, getCdnFile } = require("../../../controller/v1");

const router = express.Router();

router.post("/upload-file", (req, res, next) => {
  dispatcher(req, res, next, uploadFile);
});
router.get("/uploads/:fileId", (req, res, next) => {
  dispatcher(req, res, next, getCdnFile);
});

module.exports = router;
