const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils");
const { SUCCESS, STATUS } = require("../../../utils/constant");
let XLSX = require("xlsx");
const { formidableUpload } = require("../../../utils/upload");
const { ErrorHandler } = require("../../../helper");
const {
  NOT_FOUND,
  FORBIDDEN,
  UNAUTHORIZED,
} = require("../../../helper/status-codes");
const { compare } = require("../../../utils/hash");
const Token = require("../../../utils/token");
const { getTenant } = require("../../../utils/helper");

class Auth {
  async login(body, user) {
    try {
      const { email, password } = body;
      let [user] = await sequelize.query(
        `select u.id, u.name, u.email,u.contact,  u.password, JSON_OBJECT("id", r.id, "role", r.role, "role_type", r.role_type) as role, u.tenant_id, u.status from users u JOIN roles r on r.id = u.role_id where  u.email = ? and u.status != 'Deleted'`,
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
        `select gpm.permission_name, gpm.parent from global_role_permissions grp left join global_permissions_master gpm on grp.permission_id = gpm.id 
        where gpm.status != 'Deleted' and grp.role_id=?`,
        {
          replacements: [roleId],
          type: QueryTypes.SELECT,
        },
      );

      delete user.password;

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
module.exports = Auth;
