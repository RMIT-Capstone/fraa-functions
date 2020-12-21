const Joi = require("joi");

const createCourseRequest = Joi.object({
  code: Joi.string().alphanum().min(8).max(8).required(),
  name: Joi.string().min(3).max(30).required(),
  school: Joi.string().alphanum().min(3).max(3).required(),
  lecturer: Joi.string().min(3).max(50).required(),
}).options({ abortEarly: false });

const checkCreateCourseRequest = async course => {
  
  const validate = Joi.object({
    code: Joi.string().alphanum().min(8).max(8).required(),
    name: Joi.string().min(3).max(30).required(),
    school: Joi.string().alphanum().min(3).max(3).required(),
    lecturer: Joi.string().min(3).max(50).required(),
  }).options({ abortEarly: false }).validate(course);
  if ("error" in validate) {
    let msg = {};
    validate.error.details.forEach((e) => {
      msg[e.path[0]] = e.message.replace(/"|\"/g, ``);
    });
    return { error: msg };
  }
};

const getMoreCoursesRequest = Joi.object({
  startAfter: Joi.string().required()
}).options({ abortEarly: false });

let updateCourseRequest, deleteCourseRequest;

deleteCourseRequest, updateCourseRequest = Joi.object({
  startAfter: Joi.string().required()
}).options({ abortEarly: false });

module.exports = {
  createCourseRequest,
  getMoreCoursesRequest,
  updateCourseRequest,
  checkCreateCourseRequest
};
