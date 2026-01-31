const Joi = require("joi");
const otpSchema = {
  otp_request_otp_post: Joi.object({
    otpIdentifier: Joi.string().trim().required().messages({
      "string.base": "otpIdentifier should be a type of text",
      "any.required": "otpIdentifier is required",
      "string.empty": "otpIdentifier is required",
    }),
    otpType: Joi.string().trim().required().messages({
      "string.base": "otpType should be a type of text",
      "any.required": "otpType is required",
      "string.empty": "otpType is required",
    }),
    otpReason: Joi.string().trim().required().messages({
      "string.base": "otpReason should be a type of text",
      "any.required": "otpReason is required",
      "string.empty": "otpReason is required",
    }),
  }),
  otp_verify_otp_post: Joi.object({
    otpIdentifier: Joi.string().trim().required().messages({
      "string.base": "otpIdentifier should be a type of text",
      "any.required": "otpIdentifier is required",
      "string.empty": "otpIdentifier is required",
    }),
    otpType: Joi.string().trim().required().messages({
      "string.base": "otpType should be a type of text",
      "any.required": "otpType is required",
      "string.empty": "otpType is required",
    }),
    otpReason: Joi.string().trim().required().messages({
      "string.base": "otpReason should be a type of text",
      "any.required": "otpReason is required",
      "string.empty": "otpReason is required",
    }),
    otp: Joi.string().trim().required().messages({
      "string.base": "otp should be a type of text",
      "any.required": "otp is required",
      "string.empty": "otp is required",
    }),
  }),
};
module.exports = otpSchema;
