import Joi from "joi";
import { AuthStatus, TenantType } from "../../../generated/prisma/enums";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";
import { CreateTenantBody } from "./tenant.type";

const tenantSchema = Joi.object({
  tenantName: Joi.string().trim().required().messages({
    "any.required": "Tenant name is required",
    "string.empty": "Tenant name cannot be empty",
    "string.base": "Invalid tenant name",
  }),

  tenantType: Joi.string()
    .valid(...Object.values(TenantType))
    .optional()
    .messages({
      "any.only": "Invalid tenant type",
      "string.base": "Invalid tenant type",
    }),

  pocName: Joi.string().trim().optional().messages({
    "string.base": "Invalid POC name",
  }),

  pocEmail: Joi.string().trim().email().optional().messages({
    "string.email": "Invalid POC email",
    "string.base": "Invalid POC email",
  }),

  pocContact: Joi.string().trim().optional().messages({
    "string.base": "Invalid POC contact",
  }),

  status: Joi.string()
    .valid(...Object.values(AuthStatus))
    .optional()
    .messages({
      "any.only": "Invalid tenant status",
      "string.base": "Invalid tenant status",
    }),
});

const roleSchema = Joi.object({
  roleName: Joi.string().trim().required().messages({
    "any.required": "Role name is required",
    "string.empty": "Role name cannot be empty",
    "string.base": "Invalid role name",
  }),

  roleDescription: Joi.string().trim().optional().messages({
    "string.base": "Invalid role description",
  }),

  status: Joi.string()
    .valid(...Object.values(AuthStatus))
    .optional()
    .messages({
      "any.only": "Invalid role status",
      "string.base": "Invalid role status",
    }),
});

const userSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required",
    "string.empty": "First name cannot be empty",
    "string.base": "Invalid first name",
  }),

  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required",
    "string.empty": "Last name cannot be empty",
    "string.base": "Invalid last name",
  }),

  email: Joi.string().trim().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Invalid email",
    "string.base": "Invalid email",
  }),

  requireMfa: Joi.boolean().optional().messages({
    "boolean.base": "Invalid MFA requirement",
  }),

  status: Joi.string()
    .valid(...Object.values(AuthStatus))
    .optional()
    .messages({
      "any.only": "Invalid user status",
      "string.base": "Invalid user status",
    }),
});

export const CreateTenantSchema = Joi.object({
  tenant: tenantSchema.required().messages({
    "any.required": "Tenant is required",
    "object.base": "Invalid tenant",
  }),

  role: roleSchema.required().messages({
    "any.required": "Role is required",
    "object.base": "Invalid role",
  }),

  user: userSchema.required().messages({
    "any.required": "User is required",
    "object.base": "Invalid user",
  }),

  modules: Joi.array()
    .items(
      Joi.string().trim().required().messages({
        "string.empty": "Module cannot be empty",
        "string.base": "Invalid module",
      }),
    )
    .optional()
    .messages({
      "array.base": "Modules must be an array",
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
export function validateCreateTenant(input: unknown): CreateTenantBody {
  return assertValid(CreateTenantSchema, input);
}
