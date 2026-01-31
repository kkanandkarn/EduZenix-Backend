const { statusCodes, ErrorHandler } = require("../helper");
const { FORBIDDEN } = require("../helper/status-codes");
const { constant, camelize } = require("../utils");
const matchPermission = require("./match-permission");

const { OK } = statusCodes;
const { SUCCESS } = constant;

/**
 *
 * The dispacter function middleware is the single source for sending the response. This middleware
 * checks if the user is authenticated and if the allowed user has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param resource -> Resource to Check Permission On
 * @param {*} perm -> Permission to Check
 * @returns -> The final response with the data
 */

const dispatcher = async (
  req,
  res,
  next,
  func,
  resource,
  perm,
  stopPaths = [],
) => {
  try {
    if (resource && perm) {
      const isPerm = await matchPermission(req, resource, perm);
      if (!isPerm) {
        throw new ErrorHandler(
          FORBIDDEN,
          "You do not have permission for this action.",
        );
      }
    }

    const data = await func(req, res, next);

    if (data) {
      return res
        .status(OK)
        .json({ status: SUCCESS, data: camelize(data, stopPaths) });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = dispatcher;
