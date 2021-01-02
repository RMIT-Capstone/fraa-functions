const Joi = require("joi");

// GENERAL FUNCTION

const checkSchema = (schema, value) => {
  const validate = schema.validate(value);
  if ("error" in validate) {
    console.log(validate.error);
    let msg = {};
    validate.error.details.forEach((e) => {
      if(e.path.length > 1) {
        msg[e.path[1]] = e.message.replace(/"|\"/g, ``).split(".")[1];
      }
      else msg[e.path[0]] = e.message.replace(/"|\"/g, ``);
    });
    return msg;
  }
  return null;
};

const invalidString = (string) => {
  if (!(typeof string === 'string') || !string) return true;
  return string.trim() === '';
};

const invalidBoolean = (bool) => {
  return bool === undefined || typeof bool !== 'boolean';
};

// COURSE_SCHEMA

const createCourseRequest = Joi.object().keys({
  course: Joi.object({
    code: Joi.string().alphanum().min(8).max(8).required(),
    name: Joi.string().min(3).max(80).required(),
    school: Joi.string().alphanum().min(3).max(3).required(),
    lecturer: Joi.string().min(3).max(50).required(),
  }).required()
}).options({ abortEarly: false });

const updateCourseRequest = Joi.object().keys({
  course: Joi.object({
    id: Joi.string().required(),
  }).required()
}).options({ abortEarly: false, allowUnknown: true });


// USER_SCHEMA

const createUserRequest = Joi.object({
  user: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    displayName: Joi.string().min(3).max(50).required(),
    school: Joi.string().alphanum().min(3).max(3).required(),
    isLecturer: Joi.boolean().required()
  }).required()
}).options({ abortEarly: false });

const requiredUserEmail = Joi.object({
  email: Joi.string().email().required()
}).options({ abortEarly: false });

const updateUserRequest = Joi.object({
  user: Joi.object({
    id: Joi.string().required(),
  }).required()
}).options({ abortEarly: false, allowUnknown: true });

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


// ATTENDANCE_SESSIONS_SCHEMA

const createAttendanceSessionRequest = Joi.object({
  course: Joi.object({
    courseId: Joi.string().alphanum().required(),
    courseCode: Joi.string().alphanum().min(8).max(8).required(),
    courseName: Joi.string().min(3).max(80).required(),
    lecturer: Joi.string().min(3).max(50).required(),
  }).required().options({ abortEarly: false }),
  validOn: Joi.date().iso().required(),
  expireOn: Joi.date().iso().greater(Joi.ref('validOn')).required(),
  room: Joi.string().required(),
  location: Joi.object({
    altitude: Joi.number().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required().options({ abortEarly: false }),
  semester: Joi.string().alphanum().required(),
}).options({ abortEarly: false });

const getAttendanceSessionsInDateRangeRequest = Joi.object({
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
  courses: Joi.array().required(),
}).options({ abortEarly: false });

const getAttendanceSessionsInMonthRangeRequest = Joi.object({
  startMonth: Joi.number().integer().min(0).max(11).required(),
  monthRange: Joi.number().integer().min(0).max(6).required(),
  startYear: Joi.number().integer().min(2019).max(2021).required(),
  endYear: Joi.number().integer().min(Joi.ref('startYear')).required(),
  courses: Joi.array().required(),
}).options({ abortEarly: false });

const requiredCoursesArray = Joi.object({
  courses: Joi.array().required(),
}).options({ abortEarly: false });

const getMonthlyAttendanceSessionsRequest = Joi.object({
  month: Joi.number().min(0).max(11).required(),
  courses: Joi.array().required(),
}).options({ abortEarly: false });

module.exports = {
  createCourseRequest,
  updateCourseRequest,
  createUserRequest,
  requiredUserEmail,
  updateUserRequest,
  userAccountRequest,
  verifyOTPRequest,
  userSubscriptionRequest,
  userAttendanceRegistrationRequest,
  countMissedTotalAttendanceSessionsRequest,
  createAttendanceSessionRequest,
  getAttendanceSessionsInDateRangeRequest,
  getAttendanceSessionsInMonthRangeRequest,
  requiredCoursesArray,
  getMonthlyAttendanceSessionsRequest,
  checkSchema,
  invalidString,
  invalidBoolean
};
