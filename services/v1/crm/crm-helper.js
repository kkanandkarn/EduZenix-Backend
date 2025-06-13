const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils");
const { ErrorHandler } = require("../../../helper");
const { NOT_FOUND } = require("../../../helper/status-codes");
const { NOT_FOUND_MSG } = require("../../../utils/error-message");

class CrmHelper {
  async getOrganisationData(id, organisationType) {
    try {
      let data = {};
      if (organisationType === "university") {
        const universityData = await sequelize.query(
          `select * from master_university where status != "Deleted" and id=?`,
          {
            replacements: [id],
            type: QueryTypes.SELECT,
          }
        );
        if (!universityData.length) {
          throw new ErrorHandler(NOT_FOUND, NOT_FOUND_MSG);
        }
        data = universityData[0];
      } else if (organisationType === "college") {
        const collegeData = await sequelize.query(
          `select * from master_college where status != "Deleted" and id=?`,
          {
            replacements: [id],
            type: QueryTypes.SELECT,
          }
        );
        if (!collegeData.length) {
          throw new ErrorHandler(NOT_FOUND, NOT_FOUND_MSG);
        }
        data = collegeData[0];
      } else if (organisationType === "institution") {
        const institutionData = await sequelize.query(
          `select * from master_institution where status != "Deleted" and id=?`,
          {
            replacements: [id],
            type: QueryTypes.SELECT,
          }
        );
        if (!institutionData.length) {
          throw new ErrorHandler(NOT_FOUND, NOT_FOUND_MSG);
        }
        data = institutionData[0];
      } else {
        throw new ErrorHandler(NOT_FOUND, NOT_FOUND_MSG);
      }
      data.organisation_type = organisationType;
      return data;
    } catch (error) {
      throwError(error);
    }
  }
}
module.exports = CrmHelper;
