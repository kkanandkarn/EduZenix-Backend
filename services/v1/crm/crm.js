const PagiHelp = require("pagi-help");
const sequelize = require("../../../config/db");
const { QueryTypes, UUIDV4 } = require("sequelize");
const { throwError } = require("../../../utils");
const CrmHelper = require("./crm-helper");
const { ErrorHandler } = require("../../../helper");
const { NOT_FOUND, BAD_GATEWAY } = require("../../../helper/status-codes");
const fs = require("fs");
const {
  ONBAORDING_MAIL,
  MAIL_TEMPLATE,
} = require("../../../utils/mail-template");
const { EDUZENIX_LOGO, SUCCESS } = require("../../../utils/constant");
const { sendMail } = require("../../../utils/mail");
const path = require("path");

class Crm {
  async listUniversity(body, user) {
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
  async listCollege(body, user) {
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

  async listInstitution(body, user) {
    try {
      let paginationArr = [];
      let additionalWhereConditions = [["status", "!=", "Deleted"]];
      let toPush = {
        tableName: "master_institution",
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
  async generateOnboardingLink(body, user) {
    try {
      const { id, organisationType, section = "Link Generation", email } = body;
      const userId = user.userId;
      const data = await new CrmHelper().getOrganisationData(
        id,
        organisationType
      );

      if (data.is_onboarded === "Yes") {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "This Organisation is already onbaorded"
        );
      }

      const organisation = {
        id: data.id,
        aisheCode: data.aishe_code,
        name: data.name,
        state: data.state,
        district: data.district,
        isOnboarded: data.is_onboarded,
      };

      console.log("Organisation: ", organisation);

      const { nanoid } = await import("nanoid");
      const linkId = nanoid();

      const onboardingLink = `${process.env.FRONTENDURL}/organisation/onboarding/${linkId}`;

      await sequelize.query(
        `insert into onboarding_link (link_id, onboarding_link, organisation_id, organisation_type, email, section, created_by, created_at) 
            values(?, ?, ?, ?, ?, ?, ?, NOW())`,
        {
          replacements: [
            linkId,
            onboardingLink,
            id,
            organisationType,
            email ? email : null,
            section,
            userId,
          ],
          type: QueryTypes.INSERT,
        }
      );
      return onboardingLink;
    } catch (error) {
      throwError(error);
    }
  }
  async getOnboardingData(body, user, params) {
    try {
      const { linkId } = params;
      if (!linkId) {
        throw new ErrorHandler(BAD_GATEWAY, "LINK ID IS REQUIRED");
      }
      const onboardingResponse = {
        errorFlag: false,
        isOnbaorded: false,
        linkExpired: false,
        dataNotFound: false,
        onboardingData: null,
        section: null,
      };

      const [linkData] = await sequelize.query(
        `select * from onboarding_link where link_id =? and status != 'Deleted' order by id desc limit 1`,
        {
          replacements: [linkId],
          type: QueryTypes.SELECT,
        }
      );
      if (!linkData) {
        onboardingResponse.errorFlag = true;
        onboardingResponse.dataNotFound = true;
        return onboardingResponse
      }
      if (linkData.status === "Inactive") {
        onboardingResponse.errorFlag = true;
        onboardingResponse.linkExpired = true;
      }
      

      const onboardingData = await new CrmHelper().getOrganisationData(
        linkData.organisation_id,
        linkData.organisation_type
      );
      onboardingResponse.section = onboardingData.section;
      if (onboardingData.is_onboarded === "Yes") {
        onboardingResponse.errorFlag = true;
        onboardingResponse.isOnbaorded = true;
      }
      if (onboardingResponse.errorFlag) {
        return onboardingResponse;
      }
      onboardingResponse.onboardingData = onboardingData;
      return onboardingResponse;
    } catch (error) {
      throwError(error);
    }
  }
  async sendOnboardingEmail(body, user) {
    try {
      const { id, organisationType, email } = body;
      body.section = "Email Invitation";
      const userId = user.userId;
      const data = await new CrmHelper().getOrganisationData(
        id,
        organisationType
      );

      if (data.is_onboarded === "Yes") {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "This Organisation is already onbaorded"
        );
      }
      const onboardingLink = await this.generateOnboardingLink(body, user);

      const replaceObject = {
        organisation_name: data.name,
        onboarding_link: onboardingLink,
        eduzenix_logo: EDUZENIX_LOGO,
      };
      console.log(
        "TEMPLATE FILE NAME: ",
        MAIL_TEMPLATE.ONBAORDING_MAIL.MAIL_FILE
      );
      const templatePath = path.join(
        __dirname,
        "../../../templates",
        MAIL_TEMPLATE.ONBAORDING_MAIL.MAIL_FILE
      );
      let mailContent = fs.readFileSync(templatePath, "utf8");

      for (let key of Object.keys(replaceObject)) {
        mailContent = mailContent.replaceAll(`{{${key}}}`, replaceObject[key]);
      }

      await sendMail(
        email,
        MAIL_TEMPLATE.ONBAORDING_MAIL.MAIL_SUBJECT,
        mailContent
      );
      return {
        message: SUCCESS,
      };
    } catch (error) {
      throwError(error);
    }
  }
}

module.exports = Crm;
