import Joi from "joi";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";
import { AddGlobalPermissionBody, UpdateGlobalPermissionBody } from "./admin.type";

const permissionSchema = Joi.object({
  permissionName: Joi.string().trim().required().messages({
    "any.required": "Permission name is required",
    "string.empty": "Permission name cannot be empty",
    "string.base": "Permission name must be a string",
  }),

  parent: Joi.string().trim().required().messages({
    "any.required": "Parent is required",
    "string.empty": "Parent cannot be empty",
    "string.base": "Parent must be a string",
  }),

  module: Joi.string().trim().required().messages({
    "any.required": "Module is required",
    "string.empty": "Module cannot be empty",
    "string.base": "Module must be a string",
  }),

  displayName: Joi.string().trim().required().messages({
    "any.required": "Display name is required",
    "string.empty": "Display name cannot be empty",
    "string.base": "Display name must be a string",
  }),

  description: Joi.string().trim().optional().messages({
    "string.base": "Description must be a string",
  }),
});

export const AddGlobalPermissionSchema = Joi.object({
  permissions: Joi.array().items(permissionSchema).min(1).required().messages({
    "any.required": "Permissions are required",
    "array.base": "Permissions must be an array",
    "array.min": "At least one permission is required",
  }),
});

export const UpdateGlobalPermissionSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv7" }).required().messages({
    "any.required": "Permission ID is required",
    "string.empty": "Permission ID cannot be empty",
    "string.guid": "Invalid Permission ID",
    "string.base": "Permission ID must be a string",
  }),

  permission: permissionSchema.required().messages({
    "any.required": "Permission is required",
    "object.base": "Permission must be an object",
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
export function validateAddGlobalPermission(input: unknown): AddGlobalPermissionBody {
  return assertValid(AddGlobalPermissionSchema, input);
}
export function validateUpdateGlobalPermission(input: unknown): UpdateGlobalPermissionBody {
  return assertValid(UpdateGlobalPermissionSchema, input);
}
