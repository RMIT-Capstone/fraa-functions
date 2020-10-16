const {
  getUserDocumentIdWithEmail,
  getLecturerDocumentIdWithEmail,
  validateAccountData,
  getLatestOTPDocumentOfUser,
  validateLecturerData
} = require('../../../helpers/users-helpers');
const {sendErrorMessage, sendErrorObject} = require("../../../helpers/express-helpers");
const USERS_ROUTES = require('../../routes/users');
const ERROR_MESSAGES = require('../../../handlers/constants/ErrorMessages');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER) {
    const {email, password} = req.body;

    const {error, valid} = validateAccountData(email, password);
    if (!valid) return sendErrorObject(res, error);

    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}.`);
  }

  if (path === USERS_ROUTES.SIGN_IN || path === USERS_ROUTES.CHANGE_PASSWORD) {
    const {email, password} = req.body;

    const {error, valid} = validateAccountData(email, password);
    if (!valid) return sendErrorObject(res, error);

    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`);
  }

  if (path === USERS_ROUTES.GENERATE_OTP || path === USERS_ROUTES.VERIFY_OTP) {
    const {email} = req.body;
    if (!email) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} email.`);

    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`);

    const {data, error: OTPDocumentError} = await getLatestOTPDocumentOfUser(email);
    if (OTPDocumentError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (!data) return sendErrorMessage(res, `No OTP documents is found with ${email}.`);
  }

  if (path === USERS_ROUTES.CREATE_LECTURER) {
    const {email, password, name, school} = req.body;

    const {error: errorLecturer, valid: validLecturer} = validateLecturerData(name, school);
    if (!validLecturer) return sendErrorObject(res, errorLecturer);

    const {error, valid} = validateAccountData(email, password);
    if (!valid) return sendErrorObject(res, error);

    const {id: userDocId, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (userDocId) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}.`);

    const {id: lecturerId, error: lecturerIdError} = await getLecturerDocumentIdWithEmail(email);
    if (lecturerIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (lecturerId) return sendErrorMessage(res, `${ERROR_MESSAGES.LECTURER_ALREADY_EXISTS} ${email}.`);
  }

  if (path === USERS_ROUTES.GET_USER) {
    const {email}  = req.body;
    if (!email) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} email.`);

    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`);
  }

  return next();
};
