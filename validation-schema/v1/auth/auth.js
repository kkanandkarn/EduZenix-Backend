const Joi = require("joi");
const authSchema = {
  auth_login_post: Joi.object({
    email: Joi.string().trim().email().required().messages({
      "string.base": "Email should be a type of text",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email is required",
    }),

    password: Joi.string().trim().min(6).max(30).required().messages({
      "string.base": "Password should be a type of text",
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password must not exceed 30 characters",
      "any.required": "Password is required",
      "string.empty": "Password is required",
    }),
  }),
};
module.exports = authSchema;
