const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils/helper");
const { PagiHelp } = require("../pagi-help");

class Crm {
  async listUniversity(body) {
    try {
      let paginationArr = [];
      let additionalWhereConditions = [["status", "!=", "Deleted"]];
      let toPush = {
        tableName: "master_university",
        columnList: [
          { name: "id", alias: "id" },
          { name: "aishe_code", alias: "aishe_code" },
          { name: "name", alias: "name" },
          { name: "state", alias: "state" },
          { name: "district", alias: "district" },
          { name: "website", alias: "website" },
          { name: "year_of_establishment", alias: "year_of_establishment" },
          { name: "location", alias: "location" },
          { name: "email", alias: "email" },
          { name: "contact", alias: "contact" },
          { name: "address", alias: "address" },
          { name: "is_onboarded", alias: "is_onboarded" },
          { name: "status", alias: "status" },
          { name: "remarks", alias: "remarks" },
          { name: "remarks", alias: "remarks" },
        ],
        searchColumnList: [{ name: "aishe_code" }, { name: "name" }],
        additionalWhereConditions: additionalWhereConditions,
      };

      paginationArr.push(toPush);

      let genPaginate = new PagiHelp({
        columnNameConverter: (x) =>
          x.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      });
      let paginationQueries = genPaginate.paginate(body, paginationArr);
      let totalCount = await sequelize.query(
        paginationQueries.totalCountQuery,
        {
          replacements: paginationQueries.replacements,
          type: QueryTypes.SELECT,
        },
      );

      let data = await sequelize.query(paginationQueries.query, {
        replacements: paginationQueries.replacements,
        type: QueryTypes.SELECT,
      });

      return {
        data,
        totalCount: totalCount[0].countValue,
      };
    } catch (error) {
      throwError(error);
    }
  }
  async listCollege(body) {
    try {
      let paginationArr = [];
      let additionalWhereConditions = [["status", "!=", "Deleted"]];
      let toPush = {
        tableName: "master_college",
        columnList: [
          { name: "id", alias: "id" },
          { name: "aishe_code", alias: "aishe_code" },
          { name: "name", alias: "name" },
          { name: "state", alias: "state" },
          { name: "district", alias: "district" },
          { name: "website", alias: "website" },
          { name: "year_of_establishment", alias: "year_of_establishment" },
          { name: "location", alias: "location" },
          { name: "management", alias: "management" },
          { name: "university_name", alias: "univeristy_name" },
          { name: "university_type", alias: "university_type" },
          { name: "email", alias: "email" },
          { name: "contact", alias: "contact" },
          { name: "address", alias: "address" },
          { name: "is_onboarded", alias: "is_onboarded" },
          { name: "status", alias: "status" },
          { name: "remarks", alias: "remarks" },
        ],
        searchColumnList: [
          { name: "aishe_code" },
          { name: "name" },
          { name: "university_name" },
        ],
        additionalWhereConditions: additionalWhereConditions,
      };

      paginationArr.push(toPush);

      let genPaginate = new PagiHelp({
        columnNameConverter: (x) =>
          x.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      });
      let paginationQueries = genPaginate.paginate(body, paginationArr);
      let totalCount = await sequelize.query(paginationQueries.countQuery, {
        replacements: paginationQueries.replacements,
        type: QueryTypes.SELECT,
      });

      let data = await sequelize.query(paginationQueries.query, {
        replacements: paginationQueries.replacements,
        type: QueryTypes.SELECT,
      });

      return {
        data,
        totalCount: totalCount.length,
      };
    } catch (error) {
      throwError(error);
    }
  }

  async listOtherInstitution(body) {
    try {
      let paginationArr = [];
      let additionalWhereConditions = [["status", "!=", "Deleted"]];
      let toPush = {
        tableName: "master_other_institution",
        columnList: [
          { name: "id", alias: "id" },
          { name: "aishe_code", alias: "aishe_code" },
          { name: "name", alias: "name" },
          { name: "state", alias: "state" },
          { name: "district", alias: "district" },
          { name: "website", alias: "website" },
          { name: "year_of_establishment", alias: "year_of_establishment" },
          { name: "location", alias: "location" },
          { name: "standalone_type", alias: "standalone_type" },
          { name: "management", alias: "management" },
          { name: "email", alias: "email" },
          { name: "contact", alias: "contact" },
          { name: "address", alias: "address" },
          { name: "is_onboarded", alias: "is_onboarded" },
          { name: "status", alias: "status" },
          { name: "remarks", alias: "remarks" },
          { name: "remarks", alias: "remarks" },
        ],
        searchColumnList: [{ name: "aishe_code" }, { name: "name" }],
        additionalWhereConditions: additionalWhereConditions,
      };

      paginationArr.push(toPush);

      let genPaginate = new PagiHelp({
        columnNameConverter: (x) =>
          x.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      });
      let paginationQueries = genPaginate.paginate(body, paginationArr);
      let totalCount = await sequelize.query(paginationQueries.countQuery, {
        replacements: paginationQueries.replacements,
        type: QueryTypes.SELECT,
      });

      let data = await sequelize.query(paginationQueries.query, {
        replacements: paginationQueries.replacements,
        type: QueryTypes.SELECT,
      });

      return {
        data,
        totalCount: totalCount.length,
      };
    } catch (error) {
      throwError(error);
    }
  }
}

module.exports = Crm;
