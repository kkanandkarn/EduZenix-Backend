const jwt = require("jsonwebtoken");

module.exports = function (data) {
  return jwt.sign(data, process.env.JWT_PRIVATE_KEY);
};
