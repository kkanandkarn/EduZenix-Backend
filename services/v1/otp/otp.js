const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils/throw-error");
const {
  getMultipleGlobalVariable,
  generateOtp,
  getGlobalVariable,
  getTenant,
} = require("../../../utils/helper");
const { ErrorHandler } = require("../../../helper");
const {
  TOO_MANY_REQUEST,
  BAD_GATEWAY,
} = require("../../../helper/status-codes");
const OtpHelper = require("./otp-helper");

class Otp {
  async requestOtp(body) {
    try {
      const { otpIdentifier, otpType, otpReason } = body;
      const otpLimit = await getGlobalVariable("OTP_LIMIT");
      const errorMessages = await getGlobalVariable("ERROR_MESSAGES");
      const successMessages = await getGlobalVariable("SUCCESS_MESSAGES");
      const maxOtpAllowed = otpLimit.max_otp_allowed;

      if (otpReason === "login") {
        await new OtpHelper().validateUserAccount(otpIdentifier, errorMessages);
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
          TOO_MANY_REQUEST,
          errorMessages["otp_limit_exceed"][otpReason],
        );
      }

      const testOtpData = await getGlobalVariable("TEST_OTP_DATA");

      let otp;
      if (testOtpData.TEST_CONTACT.includes(otpIdentifier)) {
        otp = testOtpData.TEST_OTP;
      } else {
        otp = generateOtp(4);
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

      return {
        message: successMessages["otp_sent"][otpType],
      };
    } catch (error) {
      throwError(error);
    }
  }
  async verifyOtp(body) {
    try {
      const { otpIdentifier, otpType, otpReason, otp } = body;

      const otpLimit = await getGlobalVariable("OTP_LIMIT");
      const errorMessages = await getGlobalVariable("ERROR_MESSAGES");
      const successMessages = await getGlobalVariable("SUCCESS_MESSAGES");

      const maxAttemptAllowed = otpLimit.max_attempt_allowed;

      // Fetching the last otp sent data with an condition of not expired
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
          errorMessages["no_valid_otp_found"],
        );
      }

      // Check user should not exceed attempt
      const attempt = otpData.attempt + 1;
      if (attempt > maxAttemptAllowed) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          errorMessages["maximum_otp_attempt_reached"],
        );
      }
      const generatedOtp = otpData.otp;

      // Verifying OTP : If not matched update attempt
      if (otp !== generatedOtp) {
        await sequelize.query(
          `update otp set attempt = attempt + 1, updated_at =NOW() where id=?`,
          {
            replacements: [otpData.id],
            type: QueryTypes.UPDATE,
          },
        );
        throw new ErrorHandler(BAD_GATEWAY, errorMessages["incorrect_otp"]);
      }

      // SET OTP USED TRUE
      await sequelize.query(
        `update otp set is_used = true, updated_at = NOW(), expired_at = NOW() where id=?`,
        {
          replacements: [otpData.id],
          type: QueryTypes.UPDATE,
        },
      );
      if (otpReason === "login") {
        return await new OtpHelper().loginWithOtp(otpIdentifier);
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
