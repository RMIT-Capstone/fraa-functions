const COURSE_ROUTES = require('../../../routes/courses');
const {sendErrorMessage} = require('../../helpers');
const {getUserDocumentIdWithEmail} = require('../users/helper');
const {getCourseDocumentIdWithCode} = require('./helper');
const ERROR_MESSAGES = require('../../../handlers/constants/ErrorMessages');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === COURSE_ROUTES.CREATE_COURSE ) {
    const {course: {code, name, school, lecturer}} = req.body;
    if (!code) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course code.`);
    if (!name) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course name.`);
    if (!school) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} school.`);
    if (!lecturer) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`);
    const courseExistedWithCode = await getCourseDocumentIdWithCode(code);
    if (courseExistedWithCode.exists) return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_ALREADY_EXISTS} ${code}.`);
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES || path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
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
    if (!name) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course name.`);
    if (!startAfter) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`);
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const {course, course: {code}} = req.body;
    if (!course) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course.`);
    const courseExistedWithCode = await getCourseDocumentIdWithCode(code);
    if (!courseExistedWithCode.exists) {
      return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${code}.`);
    }
  }

  if (path === COURSE_ROUTES.DELETE_COURSE) {
    const {code} = req.body;
    if (!code) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} ${code}.`);
    const courseExistedWithCode = await getCourseDocumentIdWithCode(code);
    if (!courseExistedWithCode.exists) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} ${code}.`);
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const {email, courses} = req.body;
    if (!courses) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} courses.`);
    let invalidCourses = [];
    // use promise all to concurrently check for courses that do not exist
    // cannot use for each or map because it will throw an error for sending a response message when a message is
    // already sent
    await Promise.all(courses.map(async courseCode => {
      const {exists} = await getCourseDocumentIdWithCode(courseCode);
      if (!exists) invalidCourses.push(courseCode);
    }));
    if (invalidCourses.length > 0) return sendErrorMessage(res, `Course(s) do not exist: ${invalidCourses}.`);
    if (!email) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} email.`);
    const {exists} = await getUserDocumentIdWithEmail(email);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}`);
  }

  return next();
};
