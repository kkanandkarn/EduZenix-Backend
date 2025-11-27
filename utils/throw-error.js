const { ErrorHandler } = require("../helper");
const { SERVER_ERROR } = require("../helper/status-codes");

const throwError = (error) => {
  if (error.statusCode) {
    throw new ErrorHandler(error.statusCode, error.message);
  }
  console.log("SERVER ERROR: ", error);
  throw new ErrorHandler(
    SERVER_ERROR,
    "Internal Server Error. Please try again lator.",
  );
};
module.exports = {
  throwError,
};
