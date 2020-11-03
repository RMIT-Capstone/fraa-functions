const { db, admin } = require('../../utils/admin');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const USERS_ROUTES = require('../../utils/routes/users');

const getUserDocumentIdWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { id: null, error: null };
    }
    else {
      const documentId = querySnapshot.docs[0].id;
      return { id: documentId, error: null };
    }
  }
  catch (errorGetUserDocumentIdWithEmail) {
    console.error('Something went wrong with getUserDocumentIdWithEmail: ', errorGetUserDocumentIdWithEmail);
    return { id: null, error: errorGetUserDocumentIdWithEmail };
  }
};

const getLecturerDocumentIdWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('lecturers')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { id: null, error: null };
    }
    else {
      const documentId = querySnapshot.docs[0].id;
      return { id: documentId, error: null };
    }
  }
  catch (errorGetLecturerDocumentIdWithEmail) {
    console.error(
      'Something went wrong with getLecturerDocumentIdWithEmail: ', errorGetLecturerDocumentIdWithEmail);
    return { id: null, error: errorGetLecturerDocumentIdWithEmail };
  }
};

const deleteUserInFirestore = async userDocId => {
  try {
    await db
      .collection('users')
      .doc(userDocId)
      .delete();
    return { success: true, error: null };
  }
  catch (errorDeleteUserInFirestore) {
    console.error('Something went wrong with deleteUserInFirestore: ', errorDeleteUserInFirestore);
    return { success: false, error: errorDeleteUserInFirestore };
  }
};

const getLatestOTPDocumentOfUser = async email => {
  try {
    const querySnapshot = await db
      .collection('reset-password-otp')
      .where('email', '==', email)
      .orderBy('expiryTime', 'desc')
      .get();
    if (querySnapshot.empty) return { error: `no OTP code found with ${email}` };
    return { data: querySnapshot.docs[0].data(), error: null };
  }
  catch (errorGetLatestOTPDocumentOfUser) {
    console.error('Something went wrong with getLatestOTPDocumentOfUser: ', errorGetLatestOTPDocumentOfUser);
    return { data: null, error: errorGetLatestOTPDocumentOfUser };
  }
};

const deleteOTPDocumentsByEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('reset-password-otp')
      .where('email', '==', email)
      .get();
    if (!querySnapshot.empty) {
      querySnapshot.forEach(snapshot => {
        snapshot.ref.delete();
      });
    }
    return { success: true };
  }
  catch (errorDeleteOTPDocuments) {
    console.error('Something went wrong with deleteOTPDocumentsByEmail', errorDeleteOTPDocuments);
    return { success: false };
  }
};

const getUserIdInFBAuthWithEmail = async email => {
  try {
    const userRecord = await admin
      .auth()
      .getUserByEmail(email);
    if (!userRecord) {
      return null;
    }
    return userRecord.uid;
  }
  catch (errorGetUserIdInFBAuthWithEmail) {
    console.error(errorGetUserIdInFBAuthWithEmail.message);
    return null;
  }
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateOTPCode = () => {
  const OTP_LENGTH = 6;
  return Array.apply(null, { length: OTP_LENGTH }).map(() => getRandomInt(0, 9)).join('');
};

const stringIsEmpty = string => {
  if (!(typeof string === 'string') || !string) return true;
  return string.trim() === '';
};

const isEmail = email => {
  let regEx;
  // eslint-disable-next-line no-useless-escape,max-len
  regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return Boolean(email.match(regEx));
};

const validateAccountData = (email, password, displayName, school, isLecturer) => {
  let error = {};
  if (!displayName) error.displayName = 'displayName must not be empty.';
  if (!school) error.school = 'school must not be empty.';
  if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty/in incorrect format.';
  }
  validateEmailData(email, error);
  validatePasswordData(password, error);
  return {
    error,
    valid: Object.keys(error).length === 0
  };
};

const validateEmailData = (email, errorObj) => {
  if (stringIsEmpty(email)) {
    return errorObj.email = 'Email must not be empty';
  }
  else if (!isEmail(email)) {
    return errorObj.email = 'Invalid email address';
  }
  return null;
};

const validatePasswordData = (password, errorObj) => {
  if (stringIsEmpty(password)) errorObj.password = 'Password must not be empty';
  else if (password.length < 6) errorObj.password = 'Password length must be more than 6 characters';
};

const validateCreateUserRequest = async (email, password, displayName, school, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password.`;
  else if (stringIsEmpty(displayName)) error.displayName = `${ERROR_MESSAGES.MISSING_FIELD} displayName.`;
  else if (stringIsEmpty(school)) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school.`;
  else if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty/in incorrect format.';
  }
  else {
    if (isLecturer) {
      const { lecturerDocId, errorLecturerDocId } = await getLecturerDocumentIdWithEmail(email);
      if (errorLecturerDocId) error.lecturer = 'Error retrieving lecturer document id.';
      if (lecturerDocId) error.lecturer = `${ERROR_MESSAGES.LECTURER_ALREADY_EXISTS} ${email}`;
    }
    else {
      const { studentDocId, errorStudentDocId } = await getUserDocumentIdWithEmail(email);
      if (errorStudentDocId) error.student = 'Error retrieving student document id.';
      if (studentDocId) error.student = `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateSignInChangePasswordRequest = async (email, password, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password`;
  else if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty/in incorrect format.';
  }
  else {
    if (isLecturer) {
      const { lecturerDocId, errorLecturerDocId } = await getLecturerDocumentIdWithEmail(email);
      if (errorLecturerDocId) error.lecturer = 'Error retrieving lecturer document id.';
      if (!lecturerDocId) error.lecturer = `${ERROR_MESSAGES.LECTURER_DOES_NOT_EXISTS} ${email}.`;
    }
    else {
      const { studentDocId, errorStudentDocId } = await getUserDocumentIdWithEmail(email);
      if (errorStudentDocId) error.student = 'Error retrieving student document id.';
      if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGenerateVerifyOTPRequest = async (email, path) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} ${email}.`;
  else {
    const { studentDocId, studentDocIdError } = await getUserDocumentIdWithEmail(email);
    if (studentDocIdError) error.student = 'Error retrieving student document id.';
    if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;

    if (path === USERS_ROUTES.VERIFY_OTP) {
      const { data, OTPDocumentError } = await getLatestOTPDocumentOfUser(email);
      if (OTPDocumentError) error.OTP = 'Error retrieving user OTP documents.';
      if (!data) error.OTP = `No OTP documents is found with ${email}.`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetUserRequest = async (email) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else {
    const { userDocId, errorUserDocId } = await getUserDocumentIdWithEmail(email);
    if (errorUserDocId) error.user = 'Error retrieving user document id.';
    if (!userDocId) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
  getUserDocumentIdWithEmail,
  getLecturerDocumentIdWithEmail,
  deleteUserInFirestore,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
  getUserIdInFBAuthWithEmail,
  getRandomInt,
  generateOTPCode,
  stringIsEmpty,
  isEmail,
  validateAccountData,
  validateEmailData,
  validatePasswordData,
  validateCreateUserRequest,
  validateSignInChangePasswordRequest,
  validateGenerateVerifyOTPRequest,
  validateGetUserRequest
};
