const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const { stringIsEmpty } = require('../utilities-helpers');
const { db } = require('../../utils/admin');

const courseExistsWithDocumentId = async id => {
  try {
    const documentSnapshot = await db
      .collection('courses')
      .doc(id)
      .get();

    if (documentSnapshot.exists) {
      return { courseExistsWithDocId: true, courseExistsWithDocIdError: null };
    }
    return { courseExistsWithDocId: false, courseExistsWithDocIdError: null };
  } catch (errorCourseDocumentExistsWithDocumentId) {
    console.error('Something went wrong with getCourseDocumentIdWithCode: ', errorCourseDocumentExistsWithDocumentId);
    return { courseExistsWithDocId: null, courseExistsWithDocIdError: errorCourseDocumentExistsWithDocumentId };
  }
};

const getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();

    if (querySnapshot.empty) return { courseDocId: null, courseDocIdError: null };
    else {
      const documentId = querySnapshot.docs[0].id;
      return { courseDocId: documentId, courseDocIdError: null };
    }
  }
  catch (errorGetCourseDocumentIdWithCode) {
    console.error('Something went wrong with getCourseDocumentIdWithCode', errorGetCourseDocumentIdWithCode);
    return { courseDocId: null, courseDocIdError: errorGetCourseDocumentIdWithCode };
  }
};

const studentAlreadySubscribedToCourses = async (userDocId, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('students')
      .doc(userDocId)
      .get();
    const { subscribedCourses } = querySnapshot.data();
    if (!subscribedCourses) return { subscribed: false, subscribedError: null };
    return {
      subscribed: subscribedCourses.includes(courseCode),
      subscribedError: null,
    };
  }
  catch (errorUserAlreadySubscribedToCourse) {
    console.error('Something went wrong with userAlreadySubscribedToCourse: ', errorUserAlreadySubscribedToCourse);
    return { subscribed: null, subscribedError: errorUserAlreadySubscribedToCourse };
  }
};

const validateCreateCourseRequest = async course => {
  let error = {};
  if (!course || typeof course !== 'object') error.course = `${ERROR_MESSAGES.MISSING_FIELD} course.`;
  else {
    const { code, name, school, lecturer } = course;
    if (stringIsEmpty(code)) error.code = `${ERROR_MESSAGES.MISSING_FIELD} code.`;
    else {
      const { courseDocId, courseDocIdError } = await getCourseDocumentIdWithCode(code);
      if (courseDocIdError) error.internalError = 'Internal server error.';
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
    if (courseDocIdError) error.internalError = 'Internal server error.';
    if (!courseDocId) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_CODE} ${code}.`;
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
      const { courseExistsWithDocId, courseExistsWithDocIdError } = await courseExistsWithDocumentId(id);
      if (courseExistsWithDocIdError) error.internalError = 'Internal server error.';
      if (!courseExistsWithDocId) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${id}`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateDeleteCourseRequest = async (id) => {
  let error = {};
  if (stringIsEmpty(id)) error.id = `${ERROR_MESSAGES.MISSING_FIELD} id.`;
  else {
    const { courseExistsWithDocId, courseExistsWithDocIdError } = await courseExistsWithDocumentId(id);
    if (courseExistsWithDocIdError) error.internalError = 'Internal server error.';
    if (!courseExistsWithDocId) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${id}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
  courseExistsWithDocumentId,
  getCourseDocumentIdWithCode,
  studentAlreadySubscribedToCourses,
  validateCreateCourseRequest,
  validateGetMoreCoursesRequest,
  validateGetCourseByCodeRequest,
  validateGetCoursesByNameRequest,
  validateGetMoreCoursesByNameRequest,
  validateUpdateCourseRequest,
  validateDeleteCourseRequest,
};
