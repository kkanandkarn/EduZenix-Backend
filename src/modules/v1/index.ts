import express from "express";
import { adminValidator, authValidator } from "../../middleware";
import { NOT_FOUND } from "../../utils/status-codes";
import { FAILURE } from "../../utils/constant";

const app = express();
app.disable("x-powered-by");

import { admin } from "./admin";
import { tenant } from "./tenant";

app.use("/admin", adminValidator, admin);
app.use("/tenant", authValidator, tenant);

app.use((req, res) => {
  res.status(NOT_FOUND).json({
    status: FAILURE,
    statusCode: NOT_FOUND,
    message: "This Api does not exist on server",
    type: "apiError",
  });
});

export default app;
