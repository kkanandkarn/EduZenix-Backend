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

const login = async (req) => {
  try {
    const { username, password } = req.body;
    let user = await sequelize.query(
      `select * from users where username = ? and status != 'Deleted'`,
      {
        replacements: [username],
        type: QueryTypes.SELECT,
      }
    );
    if (!user.length) {
      throw new ErrorHandler(NOT_FOUND, "Invalid username or password.");
    }
    user = user[0];
    if (user.status === STATUS.SUSPENDED) {
      throw new ErrorHandler(
        FORBIDDEN,
        "Your account is suspended. Kindly contact your administrator."
      );
    }
    const checkPassword = await compare(user.password, password);
    if (!checkPassword) {
      throw new ErrorHandler(UNAUTHORIZED, "Invalid username or Password");
    }
    const userId = user.id;
    const roleId = user.role_id;
    const tenantId = user.tenant_id;
    const globalPermisisons = await sequelize.query(
      `select gpm.permission_name, gpm.parent from global_role_permissions grp left join global_permissions_master gpm on grp.permission_id = gpm.id 
        where gpm.status != 'Deleted' and grp.role_id=?`,
      {
        replacements: [roleId],
        type: QueryTypes.SELECT,
      }
    );

    const [tenant] = await sequelize.query(`select * from tenants where id=?`, {
      replacements: [tenantId],
      type: QueryTypes.SELECT,
    });

    const authorization = Token(userId, roleId, tenantId);
    return {
      message: SUCCESS,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        contact: user.contact,
      },
      tenant: {
        tenantName: tenant.tenant_name,
        tenantLogo: tenant.tenant_logo,
        tokens: tenant.tokens,
      },
      globalPermisisons: globalPermisisons,
      authorization: authorization,
    };
  } catch (error) {
    throwError(error);
  }
};
module.exports = {
  login,
};
