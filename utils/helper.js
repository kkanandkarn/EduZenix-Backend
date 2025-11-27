const crypto = require("crypto");
const {
  NOT_FOUND,
  UNAUTHORIZED,
  FORBIDDEN,
} = require("../helper/status-codes");

const { STATUS } = require("./constant");

const camelize = async (obj) => {
  try {
    const camelcaseKeys = (await import("camelcase-keys")).default;
    return camelcaseKeys(JSON.parse(JSON.stringify(obj)), { deep: true });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const transformVariable = (variable) => {
  if (!variable) {
    return null;
  } else if (typeof variable === "string" && variable.trim() === "") {
    return null;
  } else if (typeof variable === "object") {
    return JSON.stringify(variable);
  } else {
    return variable;
  }
};

module.exports = {
  camelize,
  transformVariable,
};
