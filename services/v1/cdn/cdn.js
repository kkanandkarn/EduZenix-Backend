const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils");
const { getTenant } = require("../../../utils/helper");
const { uploadToCloud } = require("../../../utils/upload");
const { ErrorHandler } = require("../../../helper");
const { NOT_FOUND } = require("../../../helper/status-codes");

class Cdn {
  async uploadFile(body, user, files) {
    try {
      let uploadDir = "profile";
      let userId = null;
      if (user.isAuth) {
        const tenant = await getTenant(user.tenantId);
        uploadDir = tenant.url_slug;
        userId = user.userId;
      }
      const { fileId, fileUrl } = await uploadToCloud(
        files,
        "document",
        uploadDir
      );
      await sequelize.query(
        `insert into  cdn_files (file_id, file_url,created_by, updated_by, created_at, updated_at) values( ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [fileId, fileUrl, userId, userId],
          type: QueryTypes.INSERT,
        }
      );
      return fileId;
    } catch (error) {
      throwError(error);
    }
  }
  async getCdnFile(fileId) {
    try {
      const [file] = await sequelize.query(
        "select * from cdn_files where file_id=? and status = 'Active'",
        {
          replacements: [fileId],
          type: QueryTypes.SELECT,
        }
      );

      if (!file) {
        throw new ErrorHandler(NOT_FOUND, "File not found.");
      }

      return file.file_url;
    } catch (error) {
      throwError(error);
    }
  }
}
module.exports = Cdn;
