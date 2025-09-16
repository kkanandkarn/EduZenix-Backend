const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");
const crypto = require("crypto");

const camelize = async (obj) => {
  try {
    const camelcaseKeys = (await import("camelcase-keys")).default;
    return camelcaseKeys(JSON.parse(JSON.stringify(obj)), { deep: true });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getTenant = async (tenantId) => {
  const [tenant] = await sequelize.query(`select * from tenants where id=?`, {
    replacements: [tenantId],
    type: QueryTypes.SELECT,
  });
  return tenant;
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
const getMultipleGlobalVariable = async (names) => {
  const globalVariables = await sequelize.query(
    `select name, data from global_variables where status = 'Active' and name IN (?)`,
    {
      replacements: [names],
      type: QueryTypes.SELECT,
    }
  );
  return globalVariables;
};
const getGlobalVariable = async (name) => {
  const [globalVariable] = await sequelize.query(
    `select data from global_variables where status = 'Active' and name=?`,
    {
      replacements: [name],
      type: QueryTypes.SELECT,
    }
  );
  return globalVariable.data;
};
const generateOtp = (digit) => {
  const minNuber = "1";
  const startNumber = minNuber.padEnd(digit, 0);
  const maxNumber = "9";
  const endNumber = maxNumber.padEnd(digit, 9);
  return crypto.randomInt(Number(startNumber), Number(endNumber));
};
module.exports = {
  camelize,
  getTenant,
  transformVariable,
  getGlobalVariable,
  getMultipleGlobalVariable,
  generateOtp,
};
