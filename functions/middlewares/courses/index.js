/* eslint-disable no-redeclare */
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
  try {
    switch (path){
        case (COURSE_ROUTES.CREATE_COURSE):
          var { course } = req.body;
          await validateCreateCourseRequest(course);
          break;
        case (COURSE_ROUTES.GET_MORE_COURSES):
          var { startAfter } = req.body;
          await validateGetMoreCoursesRequest(startAfter);
          break;
        case (COURSE_ROUTES.GET_COURSE_BY_CODE):
          var { code } = req.body;
          await validateGetCourseByCodeRequest(code);
          break;
        case (COURSE_ROUTES.GET_COURSES_BY_NAME):
          var { name } = req.body;
          await validateGetCoursesByNameRequest(name);
          break;
        case (COURSE_ROUTES.GET_MORE_COURSES_BY_NAME):
          var { name, startAfter } = req.body;
          await validateGetMoreCoursesByNameRequest(name, startAfter);
          break;
        case (COURSE_ROUTES.UPDATE_COURSE):
          var { course } = req.body;
          await validateUpdateCourseRequest(course);
          break;
        case (COURSE_ROUTES.DELETE_COURSE):
          var { id } = req.body;
          await validateDeleteCourseRequest(id);
          break;
        default:
          console.log('Not found path: ' + path);
          break;
    }
    return next();
  }  catch (error){
    return sendErrorObject(res, error.message);
  }

};
