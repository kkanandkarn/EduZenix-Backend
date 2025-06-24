const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = {
  camelize: async (obj) => {
    try {
      const camelcaseKeys = (await import("camelcase-keys")).default;
      return camelcaseKeys(JSON.parse(JSON.stringify(obj)), { deep: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getTenant: async (tenantId) => {
    const [tenant] = await sequelize.query(`select * from tenants where id=?`, {
      replacements: [tenantId],
      type: QueryTypes.SELECT,
    });
    return tenant;
  },
  transformVariable: (variable) => {
    if (!variable) {
      return null;
    } else if (typeof variable === "string" && variable.trim() === "") {
      return null;
    } else if (typeof variable === "object") {
      return JSON.stringify(variable);
    } else {
      return variable;
    }
  },
};
