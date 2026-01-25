const jwt = require("jsonwebtoken");

/**
 *
 * Auth middleware checks if token is available in the header, is it's unavailable isAuth is passed as false,
 * isAuth is false even if there's error in decoding the token.
 *
 * User is shown unauthorized here. This middleware only check if user is authenticated or not.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @returns
 */

module.exports = function (req, res, next) {
  let user = { isAuth: false };
  req.user = user;

  const authHeader = req.headers.authorization;

  if (!authHeader) return next();

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return next();

  const token = parts[1];
  if (!token || token === "null") return next();

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    return next(err);
  }

  if (!decoded) return next();

  user = { ...user, isAuth: true, ...decoded };
  req.user = user;
  return next();
};
