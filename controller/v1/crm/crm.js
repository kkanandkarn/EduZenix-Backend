const sequelize = require("../../../config/db");
const { Crm } = require("../../../services/v1");

const listUniveristy = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().listUniversity(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
const listCollege = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().listCollege(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
const listInstitution = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().listInstitution(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
const generateOnboardingLink = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().generateOnboardingLink(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
const getOnboardingData = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().getOnboardingData(req.body, req.user, req.params);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
const sendOnboardingEmail = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().sendOnboardingEmail(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUniveristy,
  listCollege,
  listInstitution,
  generateOnboardingLink,
  getOnboardingData,
  sendOnboardingEmail,
};
