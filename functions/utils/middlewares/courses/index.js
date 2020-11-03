const { sendErrorObject } = require('../../../helpers/express-helpers');
const {
  validateCreateCourseRequest,
  validateGetMoreCoursesRequest,
  validateGetCourseByCodeRequest,
  validateUpdateCourseRequest,
  validateDeleteCourseRequest,
  validateGetCoursesByNameRequest,
  validateGetMoreCoursesByNameRequest,
  validateCourseSubscriptionRequest,
} = require('../../../helpers/courses-helpers');
const COURSE_ROUTES = require('../../routes/courses');

// TODO: reconfirm if these functions work
module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === COURSE_ROUTES.CREATE_COURSE) {
    const { course } = req.body;

    const { error, valid } = await validateCreateCourseRequest(course);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES) {
    const { startAfter } = req.body;
    const { error, valid } = validateGetMoreCoursesRequest(startAfter);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.GET_COURSE_BY_CODE) {
    const { courseCode } = req.body;
    const { error, valid } = await validateGetCourseByCodeRequest(courseCode);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.GET_COURSES_BY_NAME) {
    const { courseName } = req.body;
    const { error, valid } = validateGetCoursesByNameRequest(courseName);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const { courseName, startAfter } = req.body;
    const { error, valid } = validateGetMoreCoursesByNameRequest(courseName, startAfter);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const { course } = req.body;
    const { error, valid } = await validateUpdateCourseRequest(course);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.DELETE_COURSE) {
    const { courseCode } = req.body;
    const { error, valid } = await validateDeleteCourseRequest(courseCode, path);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const { email, courses } = req.body;
    const { error, valid } = validateCourseSubscriptionRequest(email, courses);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
