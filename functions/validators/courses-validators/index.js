const {
  courseExistsWithDocumentId,
  courseExistsWithCourseCode,
} = require("../../helpers/courses-helpers");
const { checkSchema, invalidString } = require("../../schema");
const SCHEMA = require("../../schema");
const ERROR = require("../../utils/errors");


const validateCreateCourseRequest = async (course) => {
  const validate = checkSchema(SCHEMA.createCourseRequest, { course });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { courseExists } = await courseExistsWithCourseCode(course.code);
  if (courseExists) throw new ERROR.DuplicatedError(course.code);
};

const validateGetMoreCoursesRequest = (startAfter) => {
  if (invalidString(startAfter))
    throw new ERROR.MissingObjectError("startAfter");
};

const validateGetCourseByCodeRequest = async (code) => {
  if (invalidString(code)) throw new ERROR.MissingObjectError("code");
  const { courseExists } = await courseExistsWithCourseCode(code);
  if (!courseExists) throw new ERROR.NotExisted(code);
};

const validateGetCoursesByNameRequest = (name) => {
  if (invalidString(name)) throw new ERROR.MissingObjectError("name");
};

const validateGetMoreCoursesByNameRequest = (name, startAfter) => {
  if (invalidString(name)) throw new ERROR.MissingObjectError("name");
  if (invalidString(startAfter))
    throw new ERROR.MissingObjectError("startAfter");
};

const validateUpdateCourseRequest = async (course) => {
  const validate = checkSchema(SCHEMA.createCourseRequest, { course });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { courseExists } = await courseExistsWithDocumentId(course.id);
  if (!courseExists) throw new ERROR.NotExisted(course.id);
};

const validateDeleteCourseRequest = async (id) => {
  if (invalidString(id)) throw new ERROR.MissingObjectError("id");
  const { courseExists } = await courseExistsWithDocumentId(id);
  if (!courseExists) throw new ERROR.NotExisted("course");

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
