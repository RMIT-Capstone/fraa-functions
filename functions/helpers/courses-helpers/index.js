const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const COURSE_ROUTES = require('../../utils/routes/courses');
const { getUserDocumentIdWithEmail } = require('../users-helpers');
const { db } = require('../../utils/admin');

const getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();

    if (querySnapshot.empty) return { id: null, error: null };
    else {
      const documentId = querySnapshot.docs[0].id;
      return { id: documentId, error: null };
    }
  }
  catch (errorGetCourseDocumentIdWithCode) {
    console.error('Something went wrong with getCourseDocumentIdWithCode', errorGetCourseDocumentIdWithCode);
    return { id: null, error: errorGetCourseDocumentIdWithCode };
  }
};

const userAlreadySubscribedToCourse = async (userDocId, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .doc(userDocId)
      .get();
    const { subscribedCourses } = querySnapshot.data();
    if (!subscribedCourses) return { subscribed: false, error: null };
    return {
      subscribed: subscribedCourses.includes(courseCode),
      error: null
    };
  }
  catch (errorUserAlreadySubscribedToCourse) {
    console.error('Something went wrong with userAlreadySubscribedToCourse: ', errorUserAlreadySubscribedToCourse);
    return { subscribed: null, error: errorUserAlreadySubscribedToCourse };
  }
};

const validateCreateCourseRequest = async course => {
  const { code, name, school, lecturer } = course;
  let error = {};
  if (!code) error.code = `${ERROR_MESSAGES.MISSING_FIELD} code.`;
  else {
    const { id, error: errorCourseDocId } = await getCourseDocumentIdWithCode(code);
    if (errorCourseDocId) error.course = 'Error retrieving course document id.';
    if (id) error.course = `${ERROR_MESSAGES.COURSE_ALREADY_EXISTS} ${code}.`;
  }
  if (!lecturer) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
  if (!name) error.name = `${ERROR_MESSAGES.MISSING_FIELD} name.`;
  if (!school) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school.`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMoreCoursesRequest = startAfter => {
  let error = {};
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetCourseByCodeRequest = async courseCode => {
  let error = {};
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode.`;
  else {
    const { id, errorCourseDocID } = await getCourseDocumentIdWithCode(courseCode);
    if (errorCourseDocID) {
      error.course = 'Error retrieving course document id.';
    }
    if (!id) {
      error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${courseCode}.`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetCoursesByNameRequest = (courseName) => {
  let error = {};
  if (!courseName) error.name = `${ERROR_MESSAGES.MISSING_FIELD} courseName`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMoreCoursesByNameRequest = (courseName, startAfter) => {
  let error = {};
  if (!courseName) error.name = `${ERROR_MESSAGES.MISSING_FIELD} courseName.`;
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUpdateCourseRequest = async (course) => {
  let error = {};
  if (!course) error.course = `${ERROR_MESSAGES.MISSING_FIELD} course.`;
  const { code } = course;
  if (!code) error.code = `${ERROR_MESSAGES.MISSING_FIELD} code`;
  else {
    const { id, error: errorCourseDocId } = await getCourseDocumentIdWithCode(code);
    if (errorCourseDocId) error.course = 'Error retrieving course document id';
    if (!id) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${code}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateDeleteCourseRequest = async (courseCode) => {
  let error = {};
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode.`;
  else {
    const { id, error } = await getCourseDocumentIdWithCode(courseCode);
    if (error) error.courseCode = 'Error retrieving course document id';
    if (!id) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${courseCode}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateCourseSubscriptionRequest = async (email, courses, path) => {
  let error = {};
  if (!email) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!courses) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  else {
    let invalidCourses = [];
    let subscribedCourses = [];
    let notSubscribedCourses = [];

    const { id: userDocId, error: userDocIdError } = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) error.user = 'Error retrieving user document id.';
    if (!userDocId) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}`;

    await Promise.all(courses.map(async courseCode => {
      const { id, error } = await getCourseDocumentIdWithCode(courseCode);
      const { subscribed, error: errorUserSubscription } = await userAlreadySubscribedToCourse(userDocId, courseCode);

      if (!id) invalidCourses.push(courseCode);
      if (error) error.request = 'Error retrieving course document id.';

      if (path === COURSE_ROUTES.SUBSCRIBE_COURSES) {
        if (subscribed) subscribedCourses.push(courseCode);
      }
      else {
        if (!subscribed) notSubscribedCourses.push(courseCode);
      }

      if (errorUserSubscription) error.request = 'Error check user subscription.';
      if (invalidCourses.length > 0) error.courses = `Course(s) do not exists: ${invalidCourses}`;

      if (path === COURSE_ROUTES.SUBSCRIBE_COURSES && subscribedCourses.length > 0) {
        error.user = `User already subscribed to course(s): ${subscribedCourses}.`;
      }
      if (path === COURSE_ROUTES.UNSUBSCRIBE_COURSES && notSubscribedCourses.length > 0) {
        error.user = `User is not subscribed to course(s): ${notSubscribedCourses}.`;
      }


    }));
  }

  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
  getCourseDocumentIdWithCode,
  userAlreadySubscribedToCourse,
  validateCreateCourseRequest,
  validateGetMoreCoursesRequest,
  validateGetCourseByCodeRequest,
  validateGetCoursesByNameRequest,
  validateGetMoreCoursesByNameRequest,
  validateUpdateCourseRequest,
  validateDeleteCourseRequest,
  validateCourseSubscriptionRequest
};
