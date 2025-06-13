const sequelize = require("../../../config/db");
const { Auth } = require("../../../services/v1");

const login = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Auth().login(req.body, req.user);
    });
    return data;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
