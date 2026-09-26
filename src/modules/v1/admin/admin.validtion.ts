import Joi from "joi";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";
import type {
  AddGlobalPermissionBody,
  SaveConstantBody,
  UpdateGlobalPermissionBody,
} from "./admin.type";
import { type Prisma, Status } from "../../../generated/prisma/client";

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

export const AddGlobalPermissionSchema = Joi.object<AddGlobalPermissionBody>({
  permissions: Joi.array().items(permissionSchema).min(1).required().messages({
    "any.required": "Permissions are required",
    "array.base": "Permissions must be an array",
    "array.min": "At least one permission is required",
  }),
});

export const UpdateGlobalPermissionSchema = Joi.object<UpdateGlobalPermissionBody>({
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
// Sent as multipart/form-data, so `variables` reaches us as a JSON string.
const templateVariablesSchema = Joi.any()
  .custom((value: unknown, helpers) => {
    let parsed = value;

    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return helpers.error("object.base");
      }
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return helpers.error("object.base");
    }

    return parsed;
  })
  .optional()
  .messages({
    "object.base": "Template variables must be a valid JSON object",
  });

export const validateSaveMailTemplateSchema = Joi.object<
  Omit<Prisma.MailTemplatesCreateInput, "body">
>({
  name: Joi.string().trim().required().messages({
    "any.required": "Template name is required",
    "string.empty": "Template name cannot be empty",
    "string.base": "Template name must be a string",
  }),
  subject: Joi.string().trim().required().messages({
    "any.required": "Template subject is required",
    "string.empty": "Template subject cannot be empty",
    "string.base": "Template subject must be a string",
  }),
  variables: templateVariablesSchema,
});
export const saveConstantSchema = Joi.object<SaveConstantBody>({
  name: Joi.string().required().messages({
    "any.required": "Constant name is required",
    "string.empty": "Constant name cannot be empty",
    "string.base": "Constant name must be a string",
  }),

  data: Joi.object().min(1).required().messages({
    "any.required": "Constant data is required",
    "object.base": "Constant data must be an object",
    "object.min": "Constant data must contain at least one key",
  }),

  status: Joi.string()
    .valid(...Object.values(Status))
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Invalid status",
      "string.empty": "Status cannot be empty",
      "string.base": "Status must be a string",
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
export function validateAddGlobalPermission(input: unknown): AddGlobalPermissionBody {
  return assertValid(AddGlobalPermissionSchema, input);
}
export function validateUpdateGlobalPermission(input: unknown): UpdateGlobalPermissionBody {
  return assertValid(UpdateGlobalPermissionSchema, input);
}
// `body` is not part of the payload: it is read from the uploaded HTML file.
export function validateSaveMailTemplate(
  input: unknown,
): Omit<Prisma.MailTemplatesCreateInput, "body"> {
  return assertValid(validateSaveMailTemplateSchema, input);
}
export function validateSaveConstant(input: unknown): SaveConstantBody {
  return assertValid(saveConstantSchema, input);
}
