const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");
const { ErrorHandler } = require("../helper");
const { UNAUTHORIZED, SERVER_ERROR } = require("../helper/status-codes");
const { throwError } = require("../utils/throw-error");

const matchPermission = async (req, permission) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const roleId = req.user.roleId;
    const tenantId = req.user.tenantId;

    const Permission = await sequelize.query(
      "select id from global_permissions_master where status='Active' and permission_name	= ?",
      {
        replacements: [permission],
        type: QueryTypes.SELECT,
      }
    );
    const permissionId = Permission[0].id;
    const checkTenantPerm = await sequelize.query(
      "select * from global_tenant_permissions where status='Active' and permission_id = ? and tenant_id = ?",
      {
        replacements: [permissionId, tenantId],
        type: QueryTypes.SELECT,
      }
    );
    if (!checkTenantPerm.length) {
      return false;
    }

    const checkPermission = await sequelize.query(
      "select * from global_role_permissions where status='Active' and permission_id = ? and role_id = ?",
      {
        replacements: [permissionId, roleId],
        type: QueryTypes.SELECT,
      }
    );

    return checkPermission.length;
  } catch (error) {
    throwError(error);
  }
};

module.exports = {
  matchPermission,
};
