const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils");
const { ErrorHandler } = require("../../../helper");
const { NOT_FOUND, FORBIDDEN } = require("../../../helper/status-codes");
const { STATUS, SUCCESS } = require("../../../utils/constant");
const token = require("../../../utils/token");

class OtpHelper {
  async validateUserAccount(email, errorMessages) {
    try {
      const [userAccount] = await sequelize.query(
        `select * from users where status != 'Deleted' and email=?`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        }
      );
      if (!userAccount) {
        throw new ErrorHandler(NOT_FOUND, errorMessages["account_not_found"]);
      }
      if (userAccount.status === STATUS.SUSPENDED) {
        throw new ErrorHandler(FORBIDDEN, errorMessages["account_suspended"]);
      }
      return true;
    } catch (error) {
      throwError(error);
    }
  }

  async loginWithOtp(email) {
    try {
      let [user] = await sequelize.query(
        `select * from users where email = ?`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        }
      );

      const userId = user.id;
      const roleId = user.role_id;
      const tenantId = user.tenant_id;
      const globalPermissions = await sequelize.query(
        `select gpm.permission_name, gpm.parent from global_role_permissions grp left join global_permissions_master gpm on grp.permission_id = gpm.id 
        where gpm.status != 'Deleted' and grp.role_id=?`,
        {
          replacements: [roleId],
          type: QueryTypes.SELECT,
        }
      );

      const [tenant] = await sequelize.query(
        `select * from tenants where id=?`,
        {
          replacements: [tenantId],
          type: QueryTypes.SELECT,
        }
      );

      const authorization = token(userId, roleId, tenantId);
      return {
        message: SUCCESS,
        name: user.name,
        email: user.email,
        contact: user.contact,
        tenantName: tenant.tenant_name,
        tenantLogo: tenant.tenant_logo,
        tokens: tenant.tokens,
        globalPermissions: globalPermissions,
        authorization: authorization,
      };
    } catch (error) {
      throwError(error);
    }
  }
}
module.exports = OtpHelper;
