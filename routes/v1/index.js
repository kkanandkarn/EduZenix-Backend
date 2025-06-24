const express = require("express");
const app = express();

const { auth } = require("./auth");
const { crm } = require("./crm");
const { cdn } = require("./cdn");

app.use("/auth", auth);
app.use("/crm", crm);
app.use("/cdn", cdn);

module.exports = app;
