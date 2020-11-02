const { sendErrorMessage, sendErrorObject } = require('../../../helpers/express-helpers');
const { getUserDocumentIdWithEmail } = require('../../../helpers/users-helpers');
const {
  getCourseDocumentIdWithCode,
  validateCreateCourseRequest,
  validateGetMoreCoursesByNameRequest,
  validateCourseSubscriptionRequest,
  userAlreadySubscribedToCourse
} = require('../../../helpers/courses-helpers');
const COURSE_ROUTES = require('../../routes/courses');
const ERROR_MESSAGES = require('../../../handlers/constants/ErrorMessages');
const { validateUpdateCourseRequest } = require('../../../helpers/courses-helpers');
const { validateGetMoreCoursesRequest } = require('../../../helpers/courses-helpers');
const { validateGetCourseByCodeRequest } = require('../../../helpers/courses-helpers');

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
    const { name } = req.body;
    if (!name) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course name.`);
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
    const { code } = req.body;
    if (!code) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} course code.`);

    const { id, error } = await getCourseDocumentIdWithCode(code);
    if (error) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${code}.`);
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const { email, courses } = req.body;
    const { error, valid } = validateCourseSubscriptionRequest(email, courses);
    if (!valid) return sendErrorObject(res, error);

    let invalidCourses = [];
    let invalidCoursesErrors = [];
    let subscribedCourses = [];
    let notSubscribedCourses = [];
    let errorCheckUserSubscription = [];

    const { id: userDocId } = await getUserDocumentIdWithEmail(email);
    await Promise.all(courses.map(async courseCode => {
      const { id, error } = await getCourseDocumentIdWithCode(courseCode);
      const { subscribed, error: errorUserSubscription } = await userAlreadySubscribedToCourse(userDocId, courseCode);

      if (!id) invalidCourses.push(courseCode);
      if (error) invalidCoursesErrors.push(error);

      if (path === COURSE_ROUTES.SUBSCRIBE_COURSES) {
        if (subscribed) subscribedCourses.push(courseCode);
      }
      else {
        if (!subscribed) notSubscribedCourses.push(courseCode);
      }

      if (errorUserSubscription) errorCheckUserSubscription.push(courseCode);
    }));
    if (invalidCoursesErrors.length > 0) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (invalidCourses.length > 0) return sendErrorMessage(res, `Course(s) do not exist: ${invalidCourses}.`);


    if (path === COURSE_ROUTES.SUBSCRIBE_COURSES && subscribedCourses.length > 0) {
      return sendErrorMessage(
        res,
        `User already subscribed to course(s): ${subscribedCourses}.`
      );
    }
    if (path === COURSE_ROUTES.UNSUBSCRIBE_COURSES && notSubscribedCourses.length > 0) {
      return sendErrorMessage(
        res,
        `User is not subscribed to course(s): ${notSubscribedCourses}.`
      );
    }

    if (errorCheckUserSubscription.length > 0) return sendErrorMessage(
      res,
      `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`
    );


    const { id, error: userDocIdError } = await getUserDocumentIdWithEmail(email);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}`);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }

  return next();
};
