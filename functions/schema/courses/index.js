const Joi = require("joi");

const schemaCreateCourseRequest = Joi.object({
  code: Joi.string().alphanum().min(8).max(8).required(),
  name: Joi.string().min(3).max(30).required(),
  school: Joi.string().alphanum().min(3).max(3).required(),
  lecturer: Joi.string().min(3).max(50).required(),
}).options({ abortEarly: false });

module.exports = {
  schemaCreateCourseRequest
};
