const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const {
  NOT_FOUND,
  FORBIDDEN,
  UNAUTHORIZED,
} = require("../../../helper/status-codes");
const { getTenant, getRole, throwError } = require("../../../utils/helper");
const { STATUS, SUCCESS } = require("../../../utils/constant");
const crypto = require("crypto");
const Token = require("../../../utils/token");

class OtpHelper {
  async validateUserAccount(email) {
    try {
      const [user] = await sequelize.query(
        `select * from users where status != 'Deleted' and email=?`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        },
      );
      if (!user) {
        throw new ErrorHandler(
          NOT_FOUND,
          "Looks like this email isn’t connected to any account. Double-check for typos or try a different email.",
        );
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
  async generateOtp(digit = 4) {
    try {
      const minNuber = "1";
      const startNumber = minNuber.padEnd(digit, 0);
      const maxNumber = "9";
      const endNumber = maxNumber.padEnd(digit, 9);
      const otp = crypto.randomInt(Number(startNumber), Number(endNumber));
      return String(otp);
    } catch (error) {
      throwError(error);
    }
  }
  async loginWithOtp(email) {
    try {
      let [user] = await sequelize.query(
        `select u.id, u.name, u.email,u.country_code,u.phone, JSON_OBJECT("id", r.id, "role", r.role, "role_type", r.role_type) as role, u.tenant_id, u.status from users u JOIN roles r on r.id = u.role_id where  u.email = ? and u.status != 'Deleted'`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        },
      );
      if (!user) {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid email.");
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
        `select gpm.permission_name, gpm.parent from global_role_permissions grp left join global_permission_master gpm on grp.permission_id = gpm.id 
        where gpm.status != 'Deleted' and grp.status != 'Deleted' and grp.role_id=?`,
        {
          replacements: [roleId],
          type: QueryTypes.SELECT,
        },
      );

      const authorization = Token({ userId, roleId, tenantId });
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
