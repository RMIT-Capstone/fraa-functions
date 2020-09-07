const USERS_ROUTES = require('../../routes/users');
const {
  getUserDocumentIdWithEmail,
  getLecturerDocumentIdWithEmail,
  validateAccountData
} = require('../../../helpers/users-helpers');
const ERROR_MESSAGES = require('../../../handlers/constants/ErrorMessages');
const {validateCreateLecturerRequest} = require('../../../helpers/users-helpers');
const {sendErrorObject} = require('../../../helpers/express-helpers');
const {sendErrorMessage} = require("../../../helpers/express-helpers");

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER) {
    const {email, password} = req.body;

    const {error, valid} = validateAccountData(email, password);
    if (!valid) return sendErrorObject(res, error);

    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}.`);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }

  if (path === USERS_ROUTES.SIGN_IN || path === USERS_ROUTES.CHANGE_PASSWORD) {
    const {email, password} = req.body;
    const {error, valid} = validateAccountData(email, password);
    if (!valid) return sendErrorObject(res, error);
    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }

  if (path === USERS_ROUTES.GENERATE_OTP || path === USERS_ROUTES.VERIFY_OTP) {
    const {email} = req.body;
    if (!email) return sendErrorMessage(res, `${ERROR_MESSAGES.MISSING_FIELD} email.`);
    const {id, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (!id) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }

  if (path === USERS_ROUTES.CREATE_LECTURER) {
    const {email, password, name, school} = req.body;

    const {error: requestError, valid: requestValid} = validateCreateLecturerRequest(name, school);
    if (!requestValid) return sendErrorObject(res, requestError);

    const {error, valid} = validateAccountData(email, password);
    if (!valid) return sendErrorObject(res, error);

    const {id: userDocId, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocId) return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}.`);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);

    const {id: lecturerId, error: lecturerIdError} = await getLecturerDocumentIdWithEmail(email);
    if (lecturerId) return sendErrorMessage(res, `${ERROR_MESSAGES.LECTURER_ALREADY_EXISTS} ${email}.`);
    if (lecturerIdError) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }

  return next();
};
