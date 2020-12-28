const { stringIsEmpty } = require("../../helpers/utilities-helpers");
const {
  courseExistsWithDocumentId,
  courseExistsWithCourseCode,
} = require("../../helpers/courses-helpers");
const { objectIsMissing } = require("../../helpers/utilities-helpers");
const { checkSchema } = require("../../schema");
const SCHEMA = require("../../schema");
const ERROR = require("../../utils/errors");


const validateCreateCourseRequest = async (course) => {
  if (objectIsMissing(course)) throw new ERROR.MissingObjectError("course");
  else {
    const validate = checkSchema(SCHEMA.createCourseRequest, course);
    if (validate !== null) throw new ERROR.schemaError(validate);
    else {
      const { courseExists } = await courseExistsWithCourseCode(course.code);
      if (courseExists) throw new ERROR.DuplicatedError(course.code);
    }
  }
};

const validateGetMoreCoursesRequest = (startAfter) => {
  if (stringIsEmpty(startAfter))
    throw new ERROR.MissingObjectError("startAfter");
};

const validateGetCourseByCodeRequest = async (code) => {
  if (stringIsEmpty(code)) throw new ERROR.MissingObjectError("code");
  else {
    const { courseExists } = await courseExistsWithCourseCode(code);
    if (!courseExists) throw new ERROR.NotExisted(code);
  }
};

const validateGetCoursesByNameRequest = (name) => {
  if (stringIsEmpty(name)) throw new ERROR.MissingObjectError("name");
};

const validateGetMoreCoursesByNameRequest = (name, startAfter) => {
  if (stringIsEmpty(name)) throw new ERROR.MissingObjectError("name");
  if (stringIsEmpty(startAfter))
    throw new ERROR.MissingObjectError("startAfter");
};

const validateUpdateCourseRequest = async (course) => {
  if (!course || typeof course !== "object")
    throw new ERROR.MissingObjectError("course");
  else {
    const { id } = course;
    if (stringIsEmpty(id)) throw new ERROR.MissingObjectError("id");
    else {
      const { courseExists } = await courseExistsWithDocumentId(id);
      if (!courseExists) throw new ERROR.NotExisted("course");
    }
  }
};

const validateDeleteCourseRequest = async (id) => {
  if (stringIsEmpty(id)) throw new ERROR.MissingObjectError("id");
  else {
    const { courseExists } = await courseExistsWithDocumentId(id);
    if (!courseExists) throw new ERROR.NotExisted("course");
  }
};

module.exports = {
  validateCreateCourseRequest,
  validateGetMoreCoursesRequest,
  validateGetCoursesByNameRequest,
  validateGetMoreCoursesByNameRequest,
  validateGetCourseByCodeRequest,
  validateUpdateCourseRequest,
  validateDeleteCourseRequest,
};
