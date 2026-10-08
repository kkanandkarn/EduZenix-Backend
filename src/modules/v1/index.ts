import express from "express";
import { adminValidator, authValidator } from "../../middleware";
import { NOT_FOUND } from "../../utils/status-codes";
import { FAILURE } from "../../utils/constant";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

import { admin } from "./admin";
import { tenant } from "./tenant";
import { auth } from "./auth";
import { otp } from "./otp";
import { mfa } from "./mfa";
import { crm } from "./crm";

app.use("/admin", adminValidator, admin);
app.use("/tenant", authValidator, tenant);
app.use("/auth", auth);
app.use("/otp", otp);
app.use("/mfa", authValidator, mfa);
app.use("/crm", authValidator, crm);

app.use((req, res) => {
  res.status(NOT_FOUND).json({
    status: FAILURE,
    statusCode: NOT_FOUND,
    message: "This Api does not exist on server",
    type: "apiError",
  });
});

export default app;
