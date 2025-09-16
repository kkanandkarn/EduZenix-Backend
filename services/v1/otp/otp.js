const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/db");
const { throwError } = require("../../../utils/throw-error");
const {
  getMultipleGlobalVariable,
  generateOtp,
} = require("../../../utils/helper");
const { ErrorHandler } = require("../../../helper");
const { TOO_MANY_REQUEST } = require("../../../helper/status-codes");
const { OTP_LIMIT_EXCEED } = require("../../../utils/error-message");

class Otp {
  async requestOtp(body) {
    try {
      const { otpIdentifier, otpType, otpReason } = body;

      // Fetch required global variables (OTP_LIMIT, SUCCESS_MESSAGES)
      const otpVariables = await getMultipleGlobalVariable([
        "OTP_LIMIT",
        "SUCCESS_MESSAGES",
      ]);

      // Extract OTP limit and messages
      const otpLimitVar = otpVariables.find(
        (v) => v.name === "OTP_LIMIT"
      )?.data;
      const otpMessageVar = otpVariables.find(
        (v) => v.name === "SUCCESS_MESSAGES"
      )?.data;

      const maxOtpAllowed = otpLimitVar.max_otp_allowed.limit;
      const maxOtpAllowedMsg = otpLimitVar.max_otp_allowed.error_messages;

      // Check if user has already requested OTP today
      const [otpCountRecord] = await sequelize.query(
        `SELECT count FROM otp_count WHERE otp_identifier=? AND otp_reason=? AND last_otp_sent=CURRENT_DATE`,
        {
          replacements: [otpIdentifier, otpReason],
          type: QueryTypes.SELECT,
        }
      );

      if (otpCountRecord && otpCountRecord.count >= maxOtpAllowed) {
        const limitExceedMsg = maxOtpAllowedMsg[otpReason] ?? OTP_LIMIT_EXCEED;
        throw new ErrorHandler(TOO_MANY_REQUEST, limitExceedMsg);
      }

      // Generate 4-digit OTP
      const otp = generateOtp(4);

      // Insert OTP into table
      await sequelize.query(
        `INSERT INTO otp (otp_identifier, otp, otp_type, otp_reason, created_at, expired_at)
         VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        {
          replacements: [otpIdentifier, otp, otpType, otpReason],
          type: QueryTypes.INSERT,
        }
      );

      // Update OTP count: insert new record or increment count if exists
      await sequelize.query(
        `INSERT INTO otp_count (otp_identifier, otp_reason, last_otp_sent, count)
         VALUES (?, ?, CURRENT_DATE, 1)
         ON DUPLICATE KEY UPDATE count = count + 1`,
        {
          replacements: [otpIdentifier, otpReason],
          type: QueryTypes.INSERT,
        }
      );

      // Return success message for the requested OTP type
      return {
        message: otpMessageVar[otpType] || "OTP sent successfully",
      };
    } catch (error) {
      // Pass error to centralized handler
      throwError(error);
    }
  }
}

module.exports = Otp;
