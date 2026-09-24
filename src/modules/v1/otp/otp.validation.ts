import Joi from "joi";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";
import { SendOtpBody, VerifyOtpBody } from "./otp.type";

const phoneNumberRegex = /^[1-9]\d{9,14}$/;

const sendOtpSchema = Joi.object({
  otpReason: Joi.string().valid("LOGIN", "UPDATE_PASSWORD").required().messages({
    "any.required": "OTP reason is required",
    "any.only": "OTP reason must be either LOGIN or UPDATE_PASSWORD",
    "string.empty": "OTP reason cannot be empty",
    "string.base": "OTP reason must be a string",
  }),

  otpType: Joi.string().valid("EMAIL", "WHATS_APP", "SMS").required().messages({
    "any.required": "OTP type is required",
    "any.only": "OTP type must be either EMAIL, WHATS_APP or SMS",
    "string.empty": "OTP type cannot be empty",
    "string.base": "OTP type must be a string",
  }),

  otpIdentifier: Joi.string()
    .trim()
    .required()
    .when("otpType", {
      is: "EMAIL",
      then: Joi.string().email().messages({
        "string.email": "OTP identifier must be a valid email address",
      }),
      otherwise: Joi.string().pattern(phoneNumberRegex).messages({
        "string.pattern.base":
          "OTP identifier must be a valid phone number with country code, e.g. 918987654321",
      }),
    })
    .messages({
      "any.required": "OTP identifier is required",
      "string.empty": "OTP identifier cannot be empty",
      "string.base": "OTP identifier must be a string",
    }),
});
const verifyOtpSchema = Joi.object({
  otpReason: Joi.string().valid("LOGIN", "UPDATE_PASSWORD").required().messages({
    "any.required": "OTP reason is required",
    "any.only": "OTP reason must be either LOGIN or UPDATE_PASSWORD",
    "string.empty": "OTP reason cannot be empty",
    "string.base": "OTP reason must be a string",
  }),

  otpType: Joi.string().valid("EMAIL", "WHATS_APP", "SMS").required().messages({
    "any.required": "OTP type is required",
    "any.only": "OTP type must be either EMAIL, WHATS_APP or SMS",
    "string.empty": "OTP type cannot be empty",
    "string.base": "OTP type must be a string",
  }),

  otpIdentifier: Joi.string()
    .trim()
    .required()
    .when("otpType", {
      is: "EMAIL",
      then: Joi.string().email().messages({
        "string.email": "OTP identifier must be a valid email address",
      }),
      otherwise: Joi.string().pattern(phoneNumberRegex).messages({
        "string.pattern.base":
          "OTP identifier must be a valid phone number with country code, e.g. 918987654321",
      }),
    })
    .messages({
      "any.required": "OTP identifier is required",
      "string.empty": "OTP identifier cannot be empty",
      "string.base": "OTP identifier must be a string",
    }),
  otp: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "any.required": "OTP is required",
      "string.empty": "OTP cannot be empty",
      "string.base": "OTP must be a string",
      "string.pattern.base": "OTP must be exactly 4 digits",
    }),
});
function assertValid<T>(schema: Joi.ObjectSchema<T>, input: unknown): T {
  if (!input) throw new ErrorHandler(BAD_REQUEST, "Request body is required.");
  const { value, error } = schema.validate(input, {
    abortEarly: true,
    stripUnknown: true,
  });
  if (error) {
    throw new ErrorHandler(BAD_REQUEST, error.message);
  }
  return value;
}
export function validateSendOtp(input: unknown): SendOtpBody {
  return assertValid(sendOtpSchema, input);
}
export function validateVerifyOtp(input: unknown): VerifyOtpBody {
  return assertValid(verifyOtpSchema, input);
}
