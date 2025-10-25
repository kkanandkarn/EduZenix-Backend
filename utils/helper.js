const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");
const crypto = require("crypto");
const { ErrorHandler } = require("../helper");
const {
  NOT_FOUND,
  UNAUTHORIZED,
  FORBIDDEN,
} = require("../helper/status-codes");
const { throwError } = require("./index");
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
const getTenant = async (tenantId) => {
  try {
    const [tenant] = await sequelize.query(
      `select tenant_name, tenant_logo, url_slug, tokens, status from tenants where id = ? and status != 'Deleted'`,
      {
        replacements: [tenantId],
        type: QueryTypes.SELECT,
      },
    );
    if (!tenant) {
      throw new ErrorHandler(NOT_FOUND, "Tenant not found");
    }
    if (tenant.status === "Suspended") {
      throw new ErrorHandler(
        FORBIDDEN,
        "Your tenant has been suspended!. Please contact your administrator.",
      );
    }

    const [packageData] = await sequelize.query(
      `select tp.package_id,p.package_name, tp.package_type, tp.expire_date, tp.status from tenant_packages tp JOIN packages p on p.id = tp.package_id where tp.tenant_id=?`,
      {
        replacements: [tenantId],
        type: QueryTypes.SELECT,
      },
    );
    if (packageData) {
      const currentDate = new Date();
      const expireDate = new Date(packageData.expire_date);

      if (expireDate < currentDate && packageData.status !== "Expired") {
        await sequelize.query(
          `UPDATE tenant_packages
           SET status = 'Expired'
           WHERE tenant_id = ?
             AND package_id = ?`,
          {
            replacements: [tenantId, packageData.package_id],
            type: QueryTypes.UPDATE,
          },
        );

        packageData.status = "Expired";
      }
    }
    tenant.packageData = packageData;
    return tenant;
  } catch (error) {
    throwError(error);
  }
};
const getRole = async (roleId) => {
  try {
    const [role] = await sequelize.query(
      `select * from roles where id=? and status != 'Deleted'`,
      {
        replacements: [roleId],
        type: QueryTypes.SELECT,
      },
    );
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "Role not found");
    }
    if (role.status === STATUS.SUSPENDED) {
      throw new ErrorHandler(
        FORBIDDEN,
        "Your role has been suspended!. Please contact your administrator.",
      );
    }
    return role;
  } catch (error) {
    throwError(error);
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
const getMultipleGlobalVariable = async (names) => {
  const globalVariables = await sequelize.query(
    `select name, data from global_variables where status = 'Active' and name IN (?)`,
    {
      replacements: [names],
      type: QueryTypes.SELECT,
    },
  );
  return globalVariables;
};
const getGlobalVariable = async (name) => {
  const [globalVariable] = await sequelize.query(
    `select data from global_variables where status = 'Active' and name=?`,
    {
      replacements: [name],
      type: QueryTypes.SELECT,
    },
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
  getRole,
  transformVariable,
  getGlobalVariable,
  getMultipleGlobalVariable,
  generateOtp,
};
