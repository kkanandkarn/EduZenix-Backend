const { statusCodes } = require("../helper");
const { FAILURE } = require("../utils/constant");
const { BAD_GATEWAY } = statusCodes;

const handleError = (err, res) => {
  const { statusCode = BAD_GATEWAY, message } = err;
  res.status(statusCode).json({
    status: FAILURE,
    statusCode,
    message,
  });
};

module.exports = handleError;
