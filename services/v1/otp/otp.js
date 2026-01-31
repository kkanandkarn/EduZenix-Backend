const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError, getConstant } = require("../../../utils/helper");
const OtpHelper = require("./otp-helper");
const {
  TOO_MANY_REQUESTS,
  BAD_GATEWAY,
} = require("../../../helper/status-codes");
const { ErrorHandler } = require("../../../helper");
const { MailService } = require("../mail");

class Otp {
  async requestOtp(body) {
    try {
      const { otpIdentifier, otpType, otpReason } = body;
      const otpLimit = await getConstant("OTP_LIMIT");
      const maxOtpAllowed = otpLimit.max_otp_allowed;
      const helper = new OtpHelper();

      if (otpReason === "login") {
        await helper.validateUserAccount(otpIdentifier);
      }

      const [otpCountRecord] = await sequelize.query(
        `SELECT id, count FROM otp_count WHERE otp_identifier = ? AND otp_reason = ? AND last_otp_sent >= (NOW() - INTERVAL 24 HOUR) limit 1`,
        {
          replacements: [otpIdentifier, otpReason],
          type: QueryTypes.SELECT,
        },
      );

      if (otpCountRecord && otpCountRecord.count >= maxOtpAllowed) {
        throw new ErrorHandler(
          TOO_MANY_REQUESTS,
          "Daily OTP limit exceeded. No worries, you can request a new OTP after 24 hours.",
        );
      }

      const testOtpData = await getConstant("TEST_OTP_DATA");

      let otp;
      if (testOtpData.TEST_CONTACT.includes(otpIdentifier)) {
        otp = testOtpData.TEST_OTP;
      } else {
        otp = await helper.generateOtp(4);
      }

      await sequelize.query(
        `INSERT INTO otp (otp_identifier, otp, otp_type, otp_reason, created_at, updated_at, expired_at)
         VALUES (?, ?, ?, ?, NOW(),NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        {
          replacements: [otpIdentifier, otp, otpType, otpReason],
          type: QueryTypes.INSERT,
        },
      );

      if (otpCountRecord) {
        await sequelize.query(
          `update otp_count set count = count + 1, last_otp_sent = NOW() where id=?`,
          {
            replacements: [otpCountRecord.id],
            type: QueryTypes.UPDATE,
          },
        );
      } else {
        await sequelize.query(
          `INSERT INTO otp_count (otp_identifier, otp_reason, last_otp_sent, count) VALUES (?, ?, NOW(), 1)`,
          {
            replacements: [otpIdentifier, otpReason],
            type: QueryTypes.INSERT,
          },
        );
      }

      if (otpType === "email") {
        await new MailService().sendOtpMail(otpIdentifier, otp);
      }

      return {
        message:
          "All set! We’ve sent an OTP to your email. Can’t find it? Check your spam or junk folder.",
      };
    } catch (error) {
      throwError(error);
    }
  }
  async verifyOtp(body) {
    try {
      const { otpIdentifier, otpType, otpReason, otp } = body;
      const helper = new OtpHelper();

      const otpLimit = await getConstant("OTP_LIMIT");

      const maxAttemptAllowed = otpLimit.max_attempt_allowed;

      const [otpData] = await sequelize.query(
        `select * from otp where otp_identifier=? and otp_type=? and otp_reason=? and expired_at > NOW() and is_used = false order by id desc limit 1`,
        {
          replacements: [otpIdentifier, otpType, otpReason],
          type: QueryTypes.SELECT,
        },
      );

      if (!otpData) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "We couldn’t find a valid OTP for this request. No worries you can request a new OTP.",
        );
      }

      const attempt = otpData.attempt + 1;
      if (attempt > maxAttemptAllowed) {
        throw new ErrorHandler(
          TOO_MANY_REQUESTS,
          "You’ve reached the maximum number of attempts. Please request a new OTP",
        );
      }
      const generatedOtp = otpData.otp;

      if (otp !== generatedOtp) {
        await sequelize.query(
          `update otp set attempt = attempt + 1, updated_at =NOW() where id=?`,
          {
            replacements: [otpData.id],
            type: QueryTypes.UPDATE,
          },
        );
        throw new ErrorHandler(
          BAD_GATEWAY,
          "Oops! That OTP doesn’t match. Double-check and try again.",
        );
      }

      await sequelize.query(
        `update otp set is_used = true, updated_at = NOW(), expired_at = NOW() where id=?`,
        {
          replacements: [otpData.id],
          type: QueryTypes.UPDATE,
        },
      );
      if (otpReason === "login") {
        return await helper.loginWithOtp(otpIdentifier);
      }
      return {
        message: "OTP Verified Successfully !",
      };
    } catch (error) {
      throwError(error);
    }
  }
}
module.exports = Otp;
