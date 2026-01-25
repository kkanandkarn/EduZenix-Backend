const camelcaseKeys = require("camelcase-keys");
const { ErrorHandler } = require("../helper");
const { SERVER_ERROR } = require("../helper/status-codes");

const camelize = (obj, stopPaths = []) => {
  try {
    return camelcaseKeys(JSON.parse(JSON.stringify(obj)), {
      deep: true,
      stopPaths: stopPaths,
    });
  } catch (error) {
    throw new ErrorHandler(SERVER_ERROR, error);
  }
};
const throwError = (error) => {
  if (error.statusCode) {
    throw new ErrorHandler(error.statusCode, error.message);
  }
  console.error(error);
  throw new ErrorHandler(SERVER_ERROR, error.message);
};
const transformVariable = (variable, defaultValue = null) => {
  if (!variable) {
    return defaultValue;
  }
  if (typeof variable === "string") {
    const trimmed = variable.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined") {
      return defaultValue;
    }
  }
  if (typeof variable === "object") {
    if (Array.isArray(variable)) {
      return variable.length > 0 ? JSON.stringify(variable) : defaultValue;
    } else {
      return Object.keys(variable).length > 0
        ? JSON.stringify(variable)
        : defaultValue;
    }
  }
  return variable;
};

module.exports = {
  camelize,
  throwError,
  transformVariable,
};
