const express = require("express");
const dispatcher = require("../../../middleware/dispatcher");
const { login } = require("../../../controllers/v1");
const router = express.Router();

router.post("/login", (req, res, next) => {
  dispatcher(req, res, next, login);
});

module.exports = router;
