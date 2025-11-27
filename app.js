const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
require("moment-timezone")().tz("Asia/Kolkata");
const { morganLogger } = require("./middleware/logger");
const { FILE_UPLOAD_PATH, FILE_GENERATED_PATH } = process.env;

const { validator, validateToken, handleError } = require("./middleware");

const { v1 } = require("./routes");

const app = express();

app.use("/uploads", express.static(path.resolve(FILE_UPLOAD_PATH)));
app.use("/files", express.static(path.resolve(FILE_GENERATED_PATH)));

app
  .use(morganLogger)
  .use(cors())
  .use(helmet())
  .use(cookieParser())
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 50000,
    }),
  )
  .use(bodyParser.json({ limit: "100mb" }))
  .use(express.static(path.join(__dirname, "public")));

app.use(validator);
app.use(validateToken);
app.use("/v1", v1);

app.use((err, req, res, next) => {
  handleError(err, res);
});

module.exports = app;
