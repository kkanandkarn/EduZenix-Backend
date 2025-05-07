const jwt = require("jsonwebtoken");
const users = require("../helper/users");

const { USER } = users;

module.exports = function (userId, roleId, tenantId) {
  return jwt.sign(
    { userId: userId, roleId: roleId, tenantId },
    process.env.JWT_PRIVATE_KEY
  );
};
