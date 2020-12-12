const { stringIsEmpty } = require('../../helpers/utilities-helpers');
const { getCourseDocumentIdWithCode, courseExistsWithDocumentId } = require('../../helpers/courses-helpers');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');

const validateCreateCourseRequest = async course => {
  let error = {};
  if (!course || typeof course !== 'object') error.course = `${ERROR_MESSAGES.MISSING_FIELD} course.`;
  else {
    const { code, name, school, lecturer } = course;
    if (stringIsEmpty(code)) error.code = `${ERROR_MESSAGES.MISSING_FIELD} code.`;
    else {
      const { courseDocId, courseDocIdError } = await getCourseDocumentIdWithCode(code);
      if (courseDocIdError) error.course = 'Error retrieving course document id with code.';
      if (courseDocId) error.course = `${ERROR_MESSAGES.COURSE_ALREADY_EXISTS_WITH_CODE} ${code}.`;
    }
    if (stringIsEmpty(lecturer)) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
    if (stringIsEmpty(name)) error.name = `${ERROR_MESSAGES.MISSING_FIELD} name.`;
    if (stringIsEmpty(school)) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school.`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMoreCoursesRequest = startAfter => {
  let error = {};
  if (stringIsEmpty(startAfter)) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetCourseByCodeRequest = async code => {
  let error = {};
  if (stringIsEmpty(code)) error.code = `${ERROR_MESSAGES.MISSING_FIELD} code.`;
  else {
    const { courseDocId, courseDocIdError } = await getCourseDocumentIdWithCode(code);
    if (courseDocIdError) error.course = 'Error retrieving course document id with code.';
    if (!courseDocId) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXIST_WITH_CODE} ${code}.`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetCoursesByNameRequest = (name) => {
  let error = {};
  if (stringIsEmpty(name)) error.name = `${ERROR_MESSAGES.MISSING_FIELD} name.`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMoreCoursesByNameRequest = (name, startAfter) => {
  let error = {};
  if (stringIsEmpty(name)) error.name = `${ERROR_MESSAGES.MISSING_FIELD} name.`;
  if (stringIsEmpty(startAfter)) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUpdateCourseRequest = async (course) => {
  let error = {};
  if (!course || typeof course !== 'object') {
    error.course = `${ERROR_MESSAGES.MISSING_FIELD} course.`;
  } else {
    const { id } = course;
    if (stringIsEmpty(id)) error.id = `${ERROR_MESSAGES.MISSING_FIELD} id.`;
    else {
      const { courseExists, errorCheckExists } = await courseExistsWithDocumentId(id);
      if (errorCheckExists) error.course = 'Error checking course exists.';
      if (!courseExists) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${id}`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateDeleteCourseRequest = async (id) => {
  let error = {};
  if (stringIsEmpty(id)) error.id = `${ERROR_MESSAGES.MISSING_FIELD} id.`;
  else {
    const { courseExists, errorCheckExists } = await courseExistsWithDocumentId(id);
    if (errorCheckExists) error.course = 'Error checking course exists.';
    if (!courseExists) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${id}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
  validateCreateCourseRequest,
  validateGetMoreCoursesRequest,
  validateGetCourseByCodeRequest,
  validateGetCoursesByNameRequest,
  validateGetMoreCoursesByNameRequest,
  validateUpdateCourseRequest,
  validateDeleteCourseRequest,
};
