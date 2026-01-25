const camelcaseKeys = require("camelcase-keys");
const { ErrorHandler } = require("../helper");
const {
  SERVER_ERROR,
  NOT_FOUND,
  FORBIDDEN,
} = require("../helper/status-codes");
const { STATUS, SERVER_ERROR_MESSAGE } = require("./constant");
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

const camelize = (obj, stopPaths = []) => {
  try {
    return camelcaseKeys(JSON.parse(JSON.stringify(obj)), {
      deep: true,
      stopPaths: stopPaths,
    });
  } catch (error) {
    throwError(error);
  }
};
const throwError = (error) => {
  if (error.statusCode) {
    throw new ErrorHandler(error.statusCode, error.message);
  }
  console.error(error);
  throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
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

const getTenant = async (tenantId) => {
  try {
    const [tenant] = await sequelize.query(
      `select t.name, t.logo, t.organisation_type, t.status, t.is_master, JSON_OBJECT("id", p.id, "name", p.name, "package_data", p.package_data) as package, t.package_expire_date, t.package_status from tenants t JOIN packages p on p.id = t.package_id where t.id = ? and t.status != 'Deleted'`,
      {
        replacements: [tenantId],
        type: QueryTypes.SELECT,
      },
    );
    if (!tenant) {
      throw new ErrorHandler(NOT_FOUND, "Tenant not found");
    }
    if (tenant.status === STATUS.SUSPENDED) {
      throw new ErrorHandler(
        FORBIDDEN,
        "Your tenant has been suspended!. Please contact your administrator.",
      );
    }

    if (tenant.package_expire_date) {
      const currentDate = new Date();
      const expireDate = new Date(tenant.package_expire_date);

      if (
        expireDate < currentDate &&
        tenant.package_status !== STATUS.EXPIRED
      ) {
        await sequelize.query(
          `UPDATE tenants
           SET package_status = 'Expired'
           WHERE id = ?
             `,
          {
            replacements: [tenantId],
            type: QueryTypes.UPDATE,
          },
        );

        tenant.package_status = "Expired";
      }
    }

    return tenant;
  } catch (error) {
    throwError(error);
  }
};

module.exports = {
  camelize,
  throwError,
  transformVariable,
  getTenant,
};
