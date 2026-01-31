const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");
const { ErrorHandler } = require("../helper");
const { UNAUTHORIZED } = require("../helper/status-codes");
const { throwError } = require("../utils/helper");

const matchPermission = async (req, resource, permission) => {
  try {
    if (!req.user?.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }

    const roleId = req.user.roleId;

    const [result] = await sequelize.query(
      `
    SELECT EXISTS (
      SELECT 1
      FROM global_role_permissions grp
      WHERE grp.role_id = ?
        AND grp.status = 'Active'
        AND grp.permission_id = (
          SELECT gpm.id
          FROM global_permission_master gpm
          WHERE gpm.permission_name = ?
            AND gpm.parent = ?
            AND gpm.status = 'Active'
          LIMIT 1
        )
    ) AS has_permission
    `,
      {
        replacements: [roleId, permission, resource],
        type: QueryTypes.SELECT,
      },
    );

    return result.has_permission === 1;
  } catch (error) {
    throwError(error);
  }
};
module.exports = matchPermission;
