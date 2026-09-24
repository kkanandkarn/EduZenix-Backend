import Joi from "joi";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";
import { LoginBody } from "./auth.type";
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
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),

  password: passwordValidation("Password"),
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
export function validateLogin(input: unknown): LoginBody {
  return assertValid(loginSchema, input);
}
