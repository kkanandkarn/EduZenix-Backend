const Joi = require("joi");
const { min } = require("lodash");
const { ErrorHandler } = require("../helper");
const { statusCodes } = require("../helper");

const { BAD_GATEWAY } = statusCodes;

const schemas = {
  crm_generate_onboarding_link_post: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "any.required": "Organisation ID is required",
      "number.base": "Organisation ID is required",
      "number.integer": "Organisation ID is required",
      "number.positive": "Organisation ID is required",
    }),

    organisationType: Joi.string()
      .valid("university", "college", "institution")
      .required()
      .messages({
        "any.required": "Organisation type is required",
        "any.only":
          "Organisation type must be one of university, college, or institution",
        "string.base": "Organisation type must be a string",
      }),
  }),

  crm_send_onboarding_mail_post: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "any.required": "Organisation ID is required",
      "number.base": "Organisation ID is required",
      "number.integer": "Organisation ID is required",
      "number.positive": "Organisation ID is required",
    }),

    organisationType: Joi.string()
      .valid("university", "college", "institution")
      .required()
      .messages({
        "any.required": "Organisation type is required",
        "any.only":
          "Organisation type must be one of university, college, or institution",
        "string.base": "Organisation type must be a string",
      }),
    email: Joi.string()
      .trim()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email is required.",
        "string.email": "Please enter a valid email address.",
        "any.required": "Email is required.",
      }),
  }),
  export: Joi.boolean(),
};

/**
 *
 * The validator middleware checks for the request body in each APIs.
 *
 * For each API a key is created which is checked from the @schemas variable.
 * If the key matches all the request body is checked. If the request body is not found 400 error code
 * is thrown. If there are no matching keys the next middleware is called.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express next middleware function
 * @returns
 */

const validator = (req, res, next) => {
  console.log(req.path);
  try {
    const key = `${req.path
      .split("/")
      .splice(2)
      .join("_")
      .split("-")
      .join("_")}_${req.method.toLowerCase()}`;

    const schema = schemas[key];
    console.log({ key: key });
    if (!schema) {
      return next();
    } else if (!req.body) {
      throw new ErrorHandler(BAD_GATEWAY, "Payload is missing");
    } else {
      const { value, error } = schema.validate(req.body);
      if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
      else next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = validator;
