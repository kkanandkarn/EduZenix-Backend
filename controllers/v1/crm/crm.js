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
const listOtherInstitution = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Crm().listOtherInstitution(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  listUniveristy,
  listCollege,
  listOtherInstitution,
};
