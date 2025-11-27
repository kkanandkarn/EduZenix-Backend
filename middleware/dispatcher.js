const { statusCodes, ErrorHandler } = require("../helper");

const { SUCCESS } = require("../utils/constant");
const { camelize } = require("../utils/helper");
const { permissionChecker } = require("./permission-checker");

const { OK, UNAUTHORIZED } = statusCodes;

const dispatcher = async (req, res, next, func, resource, permission) => {
  try {
    if (resource && permission) {
      const checkPerm = await permissionChecker(req, resource, permission);
      if (!checkPerm) throw new ErrorHandler(UNAUTHORIZED, "NOT PERMITTED");
    }
    const data = await func(req, res, next);

    if (data != null) {
      const camelData = await camelize(data);
      return res
        .status(OK)
        .json({ status: SUCCESS, statusCode: 200, data: camelData });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = dispatcher;
