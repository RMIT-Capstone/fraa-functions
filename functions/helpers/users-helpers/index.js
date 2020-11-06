const { db, admin } = require('../../utils/admin');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const USERS_ROUTES = require('../../utils/routes/users');
const { isEmail, stringIsEmpty } = require('../utilities-helpers');
const { studentAlreadySubscribedToCourses, getCourseDocumentIdWithCode } = require('../courses-helpers');

const getStudentDocumentIdWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('students')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { studentDocId: null, studentDocIdError: null };
    } else {
      const documentId = querySnapshot.docs[0].id;
      return { studentDocId: documentId, studentDocIdError: null };
    }
  }
  catch (errorGetUserDocumentIdWithEmail) {
    console.error('Something went wrong with getUserDocumentIdWithEmail: ', errorGetUserDocumentIdWithEmail);
    return { studentDocId: null, studentDocIdError: errorGetUserDocumentIdWithEmail };
  }
};

const getLecturerDocumentIdWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('lecturers')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { lecturerDocId: null, lecturerDocIdError: null };
    }
    else {
      const documentId = querySnapshot.docs[0].id;
      return { lecturerDocId: documentId, lecturerDocIdError: null };
    }
  }
  catch (errorGetLecturerDocumentIdWithEmail) {
    console.error(
      'Something went wrong with getLecturerDocumentIdWithEmail: ', errorGetLecturerDocumentIdWithEmail);
    return { lecturerDocId: null, lecturerDocIdError: errorGetLecturerDocumentIdWithEmail };
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

const validateCreateUserRequest = async (email, password, displayName, school, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  if (!isEmail(email)) error.email = 'Email is not in correct format';
  if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password.`;
  if (password.length < 6) error.password = 'Password must be longer than 6 characters.';
  if (stringIsEmpty(displayName)) error.displayName = `${ERROR_MESSAGES.MISSING_FIELD} displayName.`;
  if (stringIsEmpty(school)) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school.`;
  if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  }
  // email duplicate is already handled inside create user function in users/https

  return { error, valid: Object.keys(error).length === 0 };
};

const validateSignInChangePasswordRequest = async (email, password, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password`;
  else if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  }
  else {
    if (isLecturer) {
      const { lecturerDocId, lecturerDocIdError } = await getLecturerDocumentIdWithEmail(email);
      if (lecturerDocIdError) error.lecturer = 'Error retrieving lecturer document id.';
      if (!lecturerDocId) error.lecturer = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    }
    else {
      const { studentDocId, errorStudentDocId } = await getStudentDocumentIdWithEmail(email);
      if (errorStudentDocId) error.student = 'Error retrieving student document id.';
      if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGenerateVerifyOTPRequest = async (email, isLecturer, path) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} ${email}.`;
  else if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  } else {
    if (isLecturer) {
      const { lecturerDocId, lecturerDocIdError } = await getLecturerDocumentIdWithEmail(email);
      if (lecturerDocIdError) error.lecturer = 'Error retrieving lecturer document id.';
      if (!lecturerDocId) error.lecturer = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    } else {
      const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
      if (studentDocIdError) error.student = 'Error retrieving student document id.';
      if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    }
    if (path === USERS_ROUTES.VERIFY_OTP) {
      const { data, OTPDocumentError } = await getLatestOTPDocumentOfUser(email);
      if (OTPDocumentError) error.OTP = 'Error retrieving user OTP documents.';
      if (!data) error.OTP = `No OTP documents is found with ${email}.`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetUserRequest = async (email, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (isLecturer === undefined || typeof isLecturer !== 'boolean') {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  } else {
    if (isLecturer) {
      const { lecturerDocId, lecturerDocIdError } = await getLecturerDocumentIdWithEmail(email);
      if (lecturerDocIdError) error.lecturer = 'Error retrieving lecturer document id.';
      if (!lecturerDocId) error.lecturer = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    } else {
      const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
      if (studentDocIdError) error.student = 'Error retrieving student document id.';
      if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUserSubscriptionRequest = async (email, courses, path) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!courses || !Array.isArray(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  else {
    let invalidCourses = [];
    let subscribedCourses = [];
    let notSubscribedCourses = [];

    const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
    if (studentDocIdError) error.user = 'Error retrieving user document id.';
    if (!studentDocId) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}`;

    // TODO: is this really necessary ?
    await Promise.all(courses.map(async courseCode => {
      const { courseDocId, courseDocIdError } = await getCourseDocumentIdWithCode(courseCode);
      const { subscribed, subscribedError } = await studentAlreadySubscribedToCourses(studentDocId, courseCode);

      if (!courseDocId) invalidCourses.push(courseCode);
      if (courseDocIdError) error.request = 'Error retrieving course document id.';

      if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES) {
        if (subscribed) subscribedCourses.push(courseCode);
      } else {
        if (!subscribed) notSubscribedCourses.push(courseCode);
      }

      if (subscribedError) error.request = 'Error check user subscription.';
      if (invalidCourses.length > 0) error.courses = `Course(s) do not exists: ${invalidCourses}`;

      if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES && subscribedCourses.length > 0) {
        error.user = `User already subscribed to course(s): ${subscribedCourses}.`;
      }
      if (path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES && notSubscribedCourses.length > 0) {
        error.user = `User is not subscribed to course(s): ${notSubscribedCourses}.`;
      }
    }));
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUserAttendanceRegistrationRequest = async (userId, sessionId) => {
  let error = {};
  if (!userId) error.userId = `${ERROR_MESSAGES.MISSING_FIELD} userId.`;
  else if (!sessionId) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId`;
  // else {
  //
  // }
};

module.exports = {
  getStudentDocumentIdWithEmail,
  getLecturerDocumentIdWithEmail,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
  getUserIdInFBAuthWithEmail,
  validateCreateUserRequest,
  validateSignInChangePasswordRequest,
  validateGenerateVerifyOTPRequest,
  validateGetUserRequest,
  validateUserSubscriptionRequest,
};
