const Joi = require("joi");
const otpSchema = {
  otp_request_otp_post: Joi.object({
    otpIdentifier: Joi.string().trim().required().messages({
      "string.base": "otp identifier must be string",
      "any.required": "otp identifier is required",
      "string.empty": "otp identifier must is required",
    }),
    otpType: Joi.string().trim().required().messages({
      "string.base": "otp type must be string",
      "any.required": "otp type is required",
      "string.empty": "otp type must is required",
    }),
    otpReason: Joi.string().trim().required().messages({
      "string.base": "otp reason must be string",
      "any.required": "otp reason is required",
      "string.empty": "otp reason must is required",
    }),
  }),
};
module.exports = otpSchema;
