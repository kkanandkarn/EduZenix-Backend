const { ErrorHandler } = require("../helper");
const { UNAUTHORIZED, SERVER_ERROR } = require("../helper/status-codes");
const { throwError } = require("../utils/throw-error");

const permissionChecker = async (req, resource, permission) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const roleId = req.user.roleId;
    const tenantId = req.user.tenantId;
  } catch (error) {
    throwError(error);
  }
};

module.exports = {
  permissionChecker,
};
