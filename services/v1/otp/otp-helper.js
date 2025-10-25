const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils");
const { ErrorHandler } = require("../../../helper");
const {
  NOT_FOUND,
  FORBIDDEN,
  UNAUTHORIZED,
} = require("../../../helper/status-codes");
const { STATUS, SUCCESS } = require("../../../utils/constant");
const token = require("../../../utils/token");
const { getTenant, getRole } = require("../../../utils/helper");
const { compare } = require("../../../utils/hash");
const Token = require("../../../utils/token");

class OtpHelper {
  async validateUserAccount(email, errorMessages) {
    try {
      const [user] = await sequelize.query(
        `select * from users where status != 'Deleted' and email=?`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        },
      );
      if (!user) {
        throw new ErrorHandler(NOT_FOUND, errorMessages["account_not_found"]);
      }
      await getTenant(user.tenant_id);
      await getRole(user.role_id);
      if (user.status === STATUS.SUSPENDED) {
        throw new ErrorHandler(
          FORBIDDEN,
          "Your account has been suspended! Please contact your administrator.",
        );
      }
      return true;
    } catch (error) {
      throwError(error);
    }
  }

  async loginWithOtp(email) {
    try {
      let [user] = await sequelize.query(
        `select u.id, u.name, u.email,u.contact, JSON_OBJECT("id", r.id, "role", r.role, "role_type", r.role_type) as role, u.tenant_id, u.status from users u JOIN roles r on r.id = u.role_id where  u.email = ? and u.status != 'Deleted'`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        },
      );
      if (!user) {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid email or password.");
      }

      if (user.status === STATUS.SUSPENDED) {
        throw new ErrorHandler(
          FORBIDDEN,
          "Your account is suspended. Kindly contact your administrator.",
        );
      }

      const userId = user.id;
      const roleId = user.role.id;
      const tenantId = user.tenant_id;
      const tenant = await getTenant(tenantId);
      const globalPermissions = await sequelize.query(
        `select gpm.permission_name, gpm.parent from global_role_permissions grp left join global_permissions_master gpm on grp.permission_id = gpm.id 
        where gpm.status != 'Deleted' and grp.role_id=?`,
        {
          replacements: [roleId],
          type: QueryTypes.SELECT,
        },
      );

      const authorization = Token(userId, roleId, tenantId);
      return {
        message: SUCCESS,
        user,
        tenant,
        globalPermissions: globalPermissions,
        authorization: authorization,
      };
    } catch (error) {
      throwError(error);
    }
  }
}
module.exports = OtpHelper;
