const { sendErrorObject } = require('../../helpers/express-helpers');
const {
  validateDeleteCourseRequest,
  validateUpdateCourseRequest,
  validateGetMoreCoursesByNameRequest,
  validateGetCoursesByNameRequest,
  validateGetCourseByCodeRequest,
  validateGetMoreCoursesRequest,
  validateCreateCourseRequest,
} = require('../../validators/courses-validators/test');
const COURSE_ROUTES = require('../../utils/routes/courses');

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
    const { code } = req.body;
    const { error, valid } = await validateGetCourseByCodeRequest(code);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.GET_COURSES_BY_NAME) {
    const { name } = req.body;
    const { error, valid } = validateGetCoursesByNameRequest(name);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const { name, startAfter } = req.body;
    const { error, valid } = validateGetMoreCoursesByNameRequest(name, startAfter);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const { course } = req.body;
    const { error, valid } = await validateUpdateCourseRequest(course);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === COURSE_ROUTES.DELETE_COURSE) {
    const { id } = req.body;
    const { error, valid } = await validateDeleteCourseRequest(id);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
