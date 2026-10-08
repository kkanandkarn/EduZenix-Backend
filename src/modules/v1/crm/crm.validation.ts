import Joi from "joi";
import { InstitutionLocation } from "../../../generated/prisma/enums";
import { BulkAddUniversityBody } from "./crm.type";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";

const addUniversitySchema = Joi.object({
  aisheCode: Joi.string().trim().required().messages({
    "any.required": "AISHE code is required",
    "string.empty": "AISHE code cannot be empty",
    "string.base": "Invalid AISHE code",
  }),

  name: Joi.string().trim().required().messages({
    "any.required": "University name is required",
    "string.empty": "University name cannot be empty",
    "string.base": "Invalid university name",
  }),

  state: Joi.string().trim().required().messages({
    "any.required": "State is required",
    "string.empty": "State cannot be empty",
    "string.base": "Invalid state",
  }),

  district: Joi.string().trim().required().messages({
    "any.required": "District is required",
    "string.empty": "District cannot be empty",
    "string.base": "Invalid district",
  }),

  website: Joi.string().trim().uri().required().messages({
    "any.required": "Website is required",
    "string.empty": "Website cannot be empty",
    "string.uri": "Invalid website",
    "string.base": "Invalid website",
  }),

  yearOfEstablishment: Joi.number().integer().required().messages({
    "any.required": "Year of establishment is required",
    "number.base": "Invalid year of establishment",
    "number.integer": "Year of establishment must be a valid year",
  }),

  location: Joi.string()
    .valid(...Object.values(InstitutionLocation))
    .required()
    .messages({
      "any.required": "Location is required",
      "any.only": "Invalid location",
      "string.base": "Invalid location",
    }),

  pocName: Joi.string().trim().allow(null).required().messages({
    "any.required": "POC name is required",
    "string.base": "Invalid POC name",
  }),

  pocEmail: Joi.string().trim().email().allow(null).required().messages({
    "any.required": "POC email is required",
    "string.email": "Invalid POC email",
    "string.base": "Invalid POC email",
  }),

  pocContact: Joi.string().trim().required().messages({
    "any.required": "POC contact is required",
    "string.empty": "POC contact cannot be empty",
    "string.base": "Invalid POC contact",
  }),

  address: Joi.string().trim().required().messages({
    "any.required": "Address is required",
    "string.empty": "Address cannot be empty",
    "string.base": "Invalid address",
  }),
});

export const bulkAddUniversitySchema = Joi.object<BulkAddUniversityBody>({
  universities: Joi.array().items(addUniversitySchema).min(1).required().messages({
    "any.required": "Universities are required",
    "array.base": "Universities must be an array",
    "array.min": "At least one university is required",
  }),
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

export function validateBulkAddUniversity(input: unknown): BulkAddUniversityBody {
  return assertValid(bulkAddUniversitySchema, input);
}
