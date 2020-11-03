const {
  validateGetUserRequest,
  validateGenerateVerifyOTPRequest,
  validateSignInChangePasswordRequest,
  validateCreateUserRequest
} = require('../../../helpers/users-helpers');
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
    const { email } = req.body;
    const { error, valid } = await validateGenerateVerifyOTPRequest(email, path);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === USERS_ROUTES.GET_USER) {
    const { email }  = req.body;
    const { valid, error } = await validateGetUserRequest(email);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
