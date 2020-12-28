const Joi = require("joi");

const checkSchema = (schema, value) => {
  const validate = schema.validate(value);
  if ("error" in validate) {
    let msg = {};
    validate.error.details.forEach((e) => {
      // eslint-disable-next-line no-useless-escape
      msg[e.path[0]] = e.message.replace(/"|\"/g, ``);
    });
    return msg;
  }
  return null;
};

// COURSE_SCHEMA

const createCourseRequest = Joi.object({
  code: Joi.string().alphanum().min(8).max(8).required(),
  name: Joi.string().min(3).max(80).required(),
  school: Joi.string().alphanum().min(3).max(3).required(),
  lecturer: Joi.string().min(3).max(50).required(),
}).options({ abortEarly: false });

// USER_SCHEMA

const createUserRequest = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  displayName: Joi.string().min(3).max(50).required(),
  school: Joi.string().alphanum().min(3).max(3).required(),
  isLecturer: Joi.boolean().required(),
}).options({ abortEarly: false });

const requiredUserEmail = Joi.object({
  email: Joi.string().email().required()
}).options({ abortEarly: false });

const updateUserRequest = Joi.object({
  id: Joi.string().required(),
  firstTimePassword: Joi.boolean().required(),
  displayName: Joi.string().min(3).max(50).required(),
  school: Joi.string().alphanum().min(3).max(3).required(),
  verified: Joi.boolean().required(),
}).options({ abortEarly: false });

const userAccountRequest = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
}).options({ abortEarly: false });

const verifyOTPRequest = Joi.object({
  email: Joi.string().email().required(),
  OTP: Joi.string().min(6).max(30).required(),
}).options({ abortEarly: false });

const userSubscriptionRequest = Joi.object({
  userId: Joi.string().alphanum().required(),
  courses: Joi.array().required(),
}).options({ abortEarly: false });

const userAttendanceRegistrationRequest  = Joi.object({
  email: Joi.string().email().required(),
  sessionId: Joi.string().alphanum().required(),
}).options({ abortEarly: false });

const countMissedTotalAttendanceSessionsRequest = Joi.object({
  email: Joi.string().email().required(),
  courses: Joi.array().required(),
  semester: Joi.string().alphanum().required(),
}).options({ abortEarly: false });

module.exports = {
  createCourseRequest,
  createUserRequest,
  requiredUserEmail,
  updateUserRequest,
  userAccountRequest,
  verifyOTPRequest,
  userSubscriptionRequest,
  userAttendanceRegistrationRequest,
  countMissedTotalAttendanceSessionsRequest,
  checkSchema
};
