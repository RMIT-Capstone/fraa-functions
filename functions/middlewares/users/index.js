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
  try{
    if (path === USERS_ROUTES.CREATE_USER) {
      const { user } = req.body;
      await validateCreateUserRequest(user);
    }

    if (path === USERS_ROUTES.DELETE_USER) {
      const { email } = req.body;
      await validateDeleteUserRequest(email);
    }

    if (path === USERS_ROUTES.UPDATE_USER) {
      const { user } = req.body;
      await validateUpdateUserRequest(user);
    }

    if (path === USERS_ROUTES.GET_USER_BY_EMAIL) {
      const { email } = req.body;
      await validateGetUserByEmailRequest(email);
    }

    if (path === USERS_ROUTES.GET_ALL_USERS) {
      const { isLecturer } = req.body;
      await validateGetAllUsersRequest(isLecturer);
    }

    if (path === USERS_ROUTES.SIGN_IN) {
      const { email, password } = req.body;
      await validateSignInRequest(email, password);
    }

    if (path === USERS_ROUTES.CHANGE_PASSWORD) {
      const { email, password } = req.body;
      await validateChangePasswordRequest(email, password);
    }

    if (path === USERS_ROUTES.GENERATE_OTP) {
      const { email } = req.body;
      await validateGenerateOTPRequest(email);
    }

    if (path === USERS_ROUTES.VERIFY_OTP) {
      const { email, OTP } = req.body;
      await validateVerifyOTPRequest(email, OTP);
    }

    if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES || path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES) {
      const { userId, courses } = req.body;
      await validateUserSubscriptionRequest(userId, courses, path);
    }

    if (path === USERS_ROUTES.REGISTER_TO_ATTENDANCE_SESSION) {
      const { email, sessionId } = req.body;
      await validateUserAttendanceRegistrationRequest(email, sessionId);
    }

    if (path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSIONS ||
      path === USERS_ROUTES.COUNT_MISSED_TOTAL_ATTENDANCE_SESSIONS_GROUP) {
      const { email, courses, semester } = req.body;
      await validateCountMissedTotalAttendanceSessionsRequest(email, courses, semester);
    }
    return next();
  }
  catch (error){
    console.log(error);
    return sendErrorObject(res, error.message);
  }
};
