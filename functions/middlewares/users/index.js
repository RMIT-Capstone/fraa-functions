const {
  validateCreateUserRequest,
  validateDeleteUserRequest,
  validateUpdateUserRequest,
  validateGetUserByEmailRequest,
  validateGetAllUsersRequest,
  validateSignInRequest,
  validateChangePasswordRequest,
  validateGenerateOTPRequest,
  validateVerifyOTPRequest,
  validateUserSubscriptionRequest,
  validateUserAttendanceRegistrationRequest,
  validateCountMissedTotalAttendanceSessionsRequest,
} = require('../../validators/users-validators');
const { sendErrorObject } = require('../../helpers/express-helpers');
const USERS_ROUTES = require('../../utils/routes/users');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER) {
    const { user } = req.body;
    const { error, valid } = await validateCreateUserRequest(user);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.DELETE_USER) {
    const { email } = req.body;
    const { error, valid } = await validateDeleteUserRequest(email);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.UPDATE_USER) {
    const { user } = req.body;
    const { error, valid } =
      await validateUpdateUserRequest(user);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GET_USER_BY_EMAIL) {
    const { email } = req.body;
    const { valid, error } = await validateGetUserByEmailRequest(email);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GET_ALL_USERS) {
    const { isLecturer } = req.body;
    const { valid, error } = await validateGetAllUsersRequest(isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.SIGN_IN) {
    const { email, password } = req.body;
    const { error, valid } = await validateSignInRequest(email, password);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.CHANGE_PASSWORD) {
    const { email, password } = req.body;
    const { error, valid } = await validateChangePasswordRequest(email, password);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GENERATE_OTP) {
    const { email } = req.body;
    const { error, valid } = await validateGenerateOTPRequest(email);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.VERIFY_OTP) {
    const { email, OTP } = req.body;
    const { error, valid } = await validateVerifyOTPRequest(email, OTP);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES || path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES) {
    const { userId, courses } = req.body;
    const { error, valid } = await validateUserSubscriptionRequest(userId, courses, path);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.REGISTER_TO_ATTENDANCE_SESSION) {
    const { email, sessionId } = req.body;
    const { error, valid } = await validateUserAttendanceRegistrationRequest(email, sessionId);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSIONS ||
    path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSIONS_GROUP) {
    const { email, courses, semester } = req.body;
    const { error, valid } = await validateCountMissedTotalAttendanceSessionsRequest(email, courses, semester);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
