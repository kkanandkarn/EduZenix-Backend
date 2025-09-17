const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils/throw-error");
const {
  getMultipleGlobalVariable,
  generateOtp,
  getGlobalVariable,
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

      // Fetch required global variables (OTP_LIMIT, SUCCESS_MESSAGES, ERROR_MESSAGES)
      const otpVariables = await getMultipleGlobalVariable([
        "OTP_LIMIT",
        "SUCCESS_MESSAGES",
        "ERROR_MESSAGES",
        "TEST_OTP_DATA",
        "OTP_REASON_FUNCTIONS",
      ]);

      // Extract OTP limit and messages
      const otpLimitVar = otpVariables.find(
        (v) => v.name === "OTP_LIMIT"
      )?.data;
      const successMessages = otpVariables.find(
        (v) => v.name === "SUCCESS_MESSAGES"
      )?.data.otp_sent;
      const errorMessages = otpVariables.find(
        (v) => v.name === "ERROR_MESSAGES"
      )?.data;
      const testOtpData = otpVariables.find(
        (v) => v.name === "TEST_OTP_DATA"
      )?.data;

      if (otpReason === "login") {
        await new OtpHelper().validateUserAccount(otpIdentifier, errorMessages);
      }

      const maxOtpAllowed = otpLimitVar.max_otp_allowed;
      const maxOtpAllowedMsg = errorMessages.otp_limit_exceed[otpReason];

      // Check if user has already requested OTP withing 24 hour
      const [otpCountRecord] = await sequelize.query(
        `SELECT id, count FROM otp_count WHERE otp_identifier = ? AND otp_reason = ? AND last_otp_sent >= (NOW() - INTERVAL 24 HOUR) limit 1`,
        {
          replacements: [otpIdentifier, otpReason],
          type: QueryTypes.SELECT,
        }
      );

      // Checking if user exceeds the limit of max otp allowed
      if (otpCountRecord && otpCountRecord.count >= maxOtpAllowed) {
        throw new ErrorHandler(TOO_MANY_REQUEST, maxOtpAllowedMsg);
      }

      //IF otp identifier is not whitelisted for tesing Generate 4-digit OTP
      let otp;
      if (testOtpData.TEST_CONTACT.includes(otpIdentifier)) {
        otp = testOtpData.TEST_OTP;
      } else {
        otp = generateOtp(4);
      }

      // Insert OTP into table
      await sequelize.query(
        `INSERT INTO otp (otp_identifier, otp, otp_type, otp_reason, created_at, updated_at, expired_at)
         VALUES (?, ?, ?, ?, NOW(),NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        {
          replacements: [otpIdentifier, otp, otpType, otpReason],
          type: QueryTypes.INSERT,
        }
      );

      // Update OTP count: insert new record or increment count if exists
      if (otpCountRecord) {
        await sequelize.query(
          `update otp_count set count = count + 1, last_otp_sent = NOW() where id=?`,
          {
            replacements: [otpCountRecord.id],
            type: QueryTypes.UPDATE,
          }
        );
      } else {
        await sequelize.query(
          `INSERT INTO otp_count (otp_identifier, otp_reason, last_otp_sent, count) VALUES (?, ?, NOW(), 1)`,
          {
            replacements: [otpIdentifier, otpReason],
            type: QueryTypes.INSERT,
          }
        );
      }

      // Return success message for the requested OTP type
      return {
        message: successMessages[otpType] || "OTP sent successfully",
      };
    } catch (error) {
      throwError(error);
    }
  }
  async verifyOtp(body) {
    try {
      const { otpIdentifier, otpType, otpReason, otp } = body;

      // Fetch required global variables (OTP_LIMIT, "ERROR_MESSAGES")
      const otpVariables = await getMultipleGlobalVariable([
        "OTP_LIMIT",
        "ERROR_MESSAGES",
      ]);

      // Extract OTP limit and messages
      const otpLimitVar = otpVariables.find(
        (v) => v.name === "OTP_LIMIT"
      )?.data;
      const errorMessages = otpVariables.find(
        (v) => v.name === "ERROR_MESSAGES"
      )?.data;

      const maxAttemptAllowed = otpLimitVar.max_attempt_allowed;

      // Fetching the last otp sent data with an condition of not expired
      const [otpData] = await sequelize.query(
        `select * from otp where otp_identifier=? and otp_type=? and otp_reason=? and expired_at > NOW() and is_used = false order by id desc limit 1`,
        {
          replacements: [otpIdentifier, otpType, otpReason],
          type: QueryTypes.SELECT,
        }
      );

      if (!otpData) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          errorMessages["no_valid_otp_found"]
        );
      }

      // Check user should not exceed attempt
      const attempt = otpData.attempt + 1;
      if (attempt > maxAttemptAllowed) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          errorMessages["maximum_otp_attempt_reached"]
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
          }
        );
        throw new ErrorHandler(BAD_GATEWAY, errorMessages["incorrect_otp"]);
      }

      // SET OTP USED TRUE
      await sequelize.query(
        `update otp set is_used = true, updated_at = NOW(), expired_at = NOW() where id=?`,
        {
          replacements: [otpData.id],
          type: QueryTypes.UPDATE,
        }
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
