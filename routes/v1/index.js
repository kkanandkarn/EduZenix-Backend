const express = require("express");
const app = express();

const { auth } = require("./auth");
const { crm } = require("./crm");
const { cdn } = require("./cdn");
const { otp } = require("./Otp");

app.use("/auth", auth);
app.use("/crm", crm);
app.use("/cdn", cdn);
app.use("/otp", otp);

module.exports = app;
