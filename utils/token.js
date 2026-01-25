const jwt = require("jsonwebtoken");

module.exports = function (tokenData) {
  return jwt.sign(tokenData, process.env.JWT_PRIVATE_KEY);
};
