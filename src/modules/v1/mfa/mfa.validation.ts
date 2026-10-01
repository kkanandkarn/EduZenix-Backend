import Joi from "joi";
import { ErrorHandler } from "../../../helper";
import type { DisableMfaBody, VerifyMfaSetupBody } from "./mfa.type";
import { BAD_REQUEST } from "../../../utils/status-codes";

export const passwordValidation = (fieldName = "Password") =>
  Joi.string()
    .min(6)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/\d/, "number")
    .pattern(/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;'`~]/, "special character")
    .required()
    .messages({
      "string.base": `${fieldName} must be a string.`,
      "string.min": `${fieldName} must be at least 6 characters long.`,
      "string.pattern.name": `${fieldName} must contain at least one {#name}.`,
      "any.required": `${fieldName} is required.`,
    });

const verifySetupSchema = Joi.object<VerifyMfaSetupBody>({
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.base": "Code must be a string.",
      "string.empty": "Code is required.",
      "string.pattern.base": "Code must be a 6-digit numeric string.",
      "any.required": "Code is required.",
    }),
});

const disableMfaSchema = Joi.object<DisableMfaBody>({
  password: passwordValidation("Password").optional(),

  code: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      "string.base": "Code must be a string.",
      "string.empty": "Code cannot be empty.",
      "string.pattern.base": "Code must be a 6-digit numeric string.",
    }),
})
  .or("password", "code")
  .messages({
    "object.missing": "Either password or code is required.",
  });

function assertValid<T>(schema: Joi.ObjectSchema<T>, input: unknown): T {
  if (!input) throw new ErrorHandler(BAD_REQUEST, "Request body is required.");
  const result = schema.validate(input, {
    abortEarly: true,
    stripUnknown: true,
  });
  if (result.error) {
    throw new ErrorHandler(BAD_REQUEST, result.error.message);
  }
  return result.value;
}

export function validateVerifySetup(input: unknown): VerifyMfaSetupBody {
  return assertValid(verifySetupSchema, input);
}
export function validateDisableMfa(input: unknown): DisableMfaBody {
  return assertValid(disableMfaSchema, input);
}
