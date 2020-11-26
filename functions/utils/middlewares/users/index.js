const {
  validateUserAttendanceRegistrationRequest,
  validateUserSubscriptionRequest,
  validateGetUserRequest,
  validateGenerateVerifyOTPRequest,
  validateSignInChangePasswordRequest,
  validateCreateUserRequest,
  validateCountMissedTotalAttendanceSessionsRequest,
} = require('../../../validators/users-validators');
const { sendErrorObject } = require('../../../helpers/express-helpers');
const USERS_ROUTES = require('../../routes/users');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER) {
    const { email, password, displayName, school, isLecturer } = req.body;

    const { error, valid } = await validateCreateUserRequest(email, password, displayName, school, isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.SIGN_IN || path === USERS_ROUTES.CHANGE_PASSWORD) {
    const { email, password, isLecturer } = req.body;

    const { error, valid } = await validateSignInChangePasswordRequest(email, password, isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GENERATE_OTP || path === USERS_ROUTES.VERIFY_OTP) {
    const { email, isLecturer, OTP } = req.body;

    const { error, valid } = await validateGenerateVerifyOTPRequest(email, isLecturer, OTP, path);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GET_USER_BY_EMAIL) {
    const { email, isLecturer } = req.body;
    const { valid, error } = await validateGetUserRequest(email, isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES || path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES) {
    const { email, courses } = req.body;
    const { error, valid } = await validateUserSubscriptionRequest(email, courses, path);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.REGISTER_TO_ATTENDANCE_SESSION) {
    const { email, sessionId } = req.body;
    const { error, valid } = await validateUserAttendanceRegistrationRequest(email, sessionId);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSION) {
    const { email, courses, semester } = req.body;
    const { error, valid } = await validateCountMissedTotalAttendanceSessionsRequest(email, courses, semester);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
