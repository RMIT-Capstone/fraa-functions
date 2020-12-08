const {
  validateUserAttendanceRegistrationRequest,
  validateUserSubscriptionRequest,
  validateGetUserRequest,
  validateGetAllUsersRequest,
  validateGenerateOTPRequest,
  validateVerifyOTPRequest,
  validateSignInRequest,
  validateUpdateRequest,
  validateChangePasswordRequest,
  validateCreateUserRequest,
  validateCountMissedTotalAttendanceSessionsRequest,
} = require('../../validators/users-validators');
const { sendErrorObject } = require('../../helpers/express-helpers');
const USERS_ROUTES = require('../../utils/routes/users');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER) {
    const { email, password, displayName, school, isLecturer } = req.body;
    const { error, valid } = await validateCreateUserRequest(email, password, displayName, school, isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.SIGN_IN) {
    const { email, password, isLecturer } = req.body;
    const { error, valid } = await validateSignInRequest(email, password, isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.UPDATE_USER) {
    const { id, displayName, firstTimePassword, school, verified, isLecturer } = req.body;
    const { error, valid } =
      await validateUpdateRequest(id, displayName, firstTimePassword, school, verified, isLecturer);
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

  if (path === USERS_ROUTES.GET_USER_BY_EMAIL) {
    const { email, isLecturer } = req.body;
    const { valid, error } = await validateGetUserRequest(email, isLecturer);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GET_ALL_USERS) {
    const { isLecturer } = req.body;
    const { valid, error } = await validateGetAllUsersRequest(isLecturer);
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

  if (path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSIONS ||
    path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSIONS_GROUP) {
    const { email, courses, semester } = req.body;
    const { error, valid } = await validateCountMissedTotalAttendanceSessionsRequest(email, courses, semester);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
