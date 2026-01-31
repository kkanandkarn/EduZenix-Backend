const express = require("express");
const app = express();

const { auth } = require("./auth");
const { crm } = require("./crm");
const { otp } = require("./otp");

app.use("/auth", auth);
app.use("/crm", crm);
app.use("/otp", otp);

module.exports = app;
