const { throwError } = require("../../../utils/helper");
const ejs = require("ejs");
const { sendMail } = require("../../../utils/mail");
const path = require("path");

class MailService {
  async sendOtpMail(email, otp) {
    try {
      const templatePath = path.join(
        __dirname,
        `../../../templates`,
        "otp-template.ejs",
      );
      const data = {
        otp: otp,
        year: new Date().getFullYear(),
      };
      const htmlContent = await ejs.renderFile(templatePath, data);
      const subject = "One-Time Password (OTP) For Verification";
      await sendMail(email, subject, htmlContent);
    } catch (error) {
      throwError(error);
    }
  }
}
module.exports = MailService;
