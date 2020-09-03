const {sendErrorMessage, sendErrorObject} = require('../../helpers');
const {getUserDocumentIdWithEmail} = require('../users/helper');
const {
  getCourseDocumentIdWithCode,
  validateCreateCourseRequest,
  validateGetMoreCoursesByNameRequest,
  validateCourseSubscriptionRequest
} = require('./helper');
const COURSE_ROUTES = require('../../../routes/courses');
const ERROR_MESSAGES = require('../../../handlers/constants/ErrorMessages');


module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === COURSE_ROUTES.CREATE_COURSE ) {
    const {course, course: {code}} = req.body;
    const {error, valid} = validateCreateCourseRequest(course);
    if (!valid) return sendErrorObject(res, error);
    const {exists} = await getCourseDocumentIdWithCode(code);
    if (exists) return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_ALREADY_EXISTS} ${code}.`);
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES) {
    const {startAfter} = req.body;
    if (!startAfter) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`);
  }

  if (path === COURSE_ROUTES.GET_COURSE_BY_CODE) {
    const {code} = req.body;
    if (!code) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course code.`);
    const {exists} = await getCourseDocumentIdWithCode(code);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${code}.`);
  }

  if (path === COURSE_ROUTES.GET_COURSES_BY_NAME) {
    const {name} = req.body;
    if (!name) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course name.`);
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const {name, startAfter} = req.body;
    const {error, valid} = validateGetMoreCoursesByNameRequest(name, startAfter);
    if (!valid) return sendErrorObject(res, error);
    if (!name) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course name.`);
    if (!startAfter) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`);
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const {course, course: {code}} = req.body;
    if (!course) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course.`);
    const {exists} = await getCourseDocumentIdWithCode(code);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${code}.`);
  }

  if (path === COURSE_ROUTES.DELETE_COURSE) {
    const {code} = req.body;
    if (!code) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course code.`);
    const {exists} = await getCourseDocumentIdWithCode(code);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${code}.`);
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const {email, courses} = req.body;
    const {error, valid} = validateCourseSubscriptionRequest(email, courses);
    if (!valid) return sendErrorObject(res, error);
    let invalidCourses = [];
    // use promise all to concurrently check for courses that do not exist
    // cannot use for each or map because it will throw an error for sending a response message when a message is
    // already sent
    await Promise.all(courses.map(async courseCode => {
      const {exists} = await getCourseDocumentIdWithCode(courseCode);
      if (!exists) invalidCourses.push(courseCode);
    }));
    if (invalidCourses.length > 0) return sendErrorMessage(res, `Course(s) do not exist: ${invalidCourses}.`);
    const {exists} = await getUserDocumentIdWithEmail(email);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}`);
  }

  return next();
};
