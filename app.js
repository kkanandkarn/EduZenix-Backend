const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: `.env`, quiet: true });
require("moment-timezone")().tz("Asia/Kolkata");
const { validateToken, handleError } = require("./middleware");
const sequelize = require("./config/db");
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { FAILURE } = require("./utils/constant");
const { TOO_MANY_REQUESTS } = require("./helper/status-codes");

app.set("view engine", "ejs");

app
  .use(cors())
  .use(helmet())
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 50000,
    }),
  )
  .use(bodyParser.json({ limit: "100mb" }))
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    res.status(TOO_MANY_REQUESTS).json({
      status: FAILURE,
      statusCode: TOO_MANY_REQUESTS,
      message: "Too many requests, please try again later.",
    });
  },
});

app.use(validateToken);
app.use("/v1", apiLimiter);

app.use((err, req, res, next) => {
  handleError(err, res);
});

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    throw err;
  });

module.exports = app;
