const express = require("express");
const app = express();

const { auth } = require("./auth");
const { crm } = require("./crm");

app.use("/auth", auth);
app.use("/crm", crm);

module.exports = app;
