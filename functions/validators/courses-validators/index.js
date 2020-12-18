const { stringIsEmpty } = require('../../helpers/utilities-helpers');
const { getCourseDocumentIdWithCode, courseExistsWithDocumentId } = require('../../helpers/courses-helpers');
const SCHEMA = require('../../schema');
const ERROR = require('../../utils/errors');
const { objectIsMissing } = require('../../helpers/utilities-helpers');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const { courseExistsWithCourseCode } = require('../../helpers/courses-helpers');

const validateCreateCourseRequest = async course => {
  let error = {};
  if (objectIsMissing(course)) error.course = `${ERROR_MESSAGES.MISSING_FIELD} course`;
  else {
    const validate = SCHEMA.createCourseRequest.validate(course);
    if ("error" in validate) {
      let msg = {};
      validate.error.details.forEach((e) => {
        msg[e.path[0]] = e.message.replace(/"|\"/g, ``);
      });
      throw new ERROR.schemaError(msg);
    } else {
      const { courseDocId } = await getCourseDocumentIdWithCode(course.code);
      if (courseDocId) throw new ERROR.DuplicatedError(course.code);
    }
  }
};

const validateGetMoreCoursesRequest = startAfter => {
  if (stringIsEmpty(startAfter)) throw new ERROR.MissingObjectError(`startAfter.`);
};

const validateGetCourseByCodeRequest = async code => {
  if (stringIsEmpty(code)) throw new ERROR.MissingObjectError(`code.`);
  else {
    const { courseDocId } = await getCourseDocumentIdWithCode(code);
    if (!courseDocId) throw new ERROR.NotExisted(code);
  }
};

const validateGetCoursesByNameRequest = (name) => {
  if (stringIsEmpty(name)) throw new ERROR.MissingObjectError(`name.`);
};

const validateGetMoreCoursesByNameRequest = (name, startAfter) => {
  if (stringIsEmpty(name)) throw new ERROR.MissingObjectError(`name.`);
  if (stringIsEmpty(startAfter)) throw new ERROR.MissingObjectError(`startAfter.`);
};

const validateUpdateCourseRequest = async (course) => {
  if (!course || typeof course !== 'object') throw new ERROR.MissingObjectError('course');
  else {
    const { id } = course;
    if (stringIsEmpty(course.id)) throw new  ERROR.MissingObjectError(`id.`);
    else {
      const { courseExists } = await courseExistsWithDocumentId(id);
      if (!courseExists) throw new ERROR.NotExisted('course');
    }
  }
};

const validateDeleteCourseRequest = async (id) => {
  if (stringIsEmpty(id)) throw new ERROR.MissingObjectError('id');
  else {
    const { courseExists } = await courseExistsWithDocumentId(id);
    if (!courseExists) throw new ERROR.NotExisted('course');
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
