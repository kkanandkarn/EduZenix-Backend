const { compare } = require("../../../utils/hash");
const { UNAUTHORIZED, FORBIDDEN } = require("../../../helper/status-codes");
const { STATUS, SUCCESS } = require("../../../utils/constant");
const { throwError, getTenant } = require("../../../utils/helper");
const { ErrorHandler } = require("../../../helper");
const Token = require("../../../utils/token");
const sequelize = require("../../../config/db");
const { QueryTypes } = require("sequelize");

class Auth {
  async login(body) {
    try {
      const { email, password } = body;

      let [user] = await sequelize.query(
        `select u.id, u.name, u.email,u.country_code,u.phone,  u.password, JSON_OBJECT("id", r.id, "role", r.role, "role_type", r.role_type) as role, u.tenant_id, u.status from users u JOIN roles r on r.id = u.role_id where  u.email = ? and u.status != 'Deleted'`,
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
      const checkPassword = await compare(user.password, password);
      if (!checkPassword) {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid email or password");
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
      delete user.password;
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

module.exports = Auth;
