const {
  userAlreadyRegisteredToAttendanceSession,
  attendanceSessionExistsWithDocId,
} = require('../../helpers/attendance-sessions-helpers');
const { isEmail, stringIsEmpty } = require('../../helpers/utilities-helpers');
const { studentAlreadySubscribedToCourses, getCourseDocumentIdWithCode } = require('../../helpers/courses-helpers');
const {
  getStudentDocumentIdWithEmail,
  getLecturerDocumentIdWithEmail,
  getLatestOTPDocumentOfUser,
} = require('../../helpers/users-helpers');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const USERS_ROUTES = require('../../utils/routes/users');

const validateCreateUserRequest = async (email, password, displayName, school, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password.`;
  else if (password.length < 6) error.password = 'Password must be longer than 6 characters.';
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
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  } else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      if (isLecturer) {
        const { lecturerDocId, lecturerDocIdError } = await getLecturerDocumentIdWithEmail(email);
        if (lecturerDocIdError) error.lecturer = 'Error retrieving lecturer document id with email.';
        if (!lecturerDocId) error.lecturer = `No lecturer exists with email: ${email}`;
      } else {
        const { studentDocId, errorStudentDocId } = await getStudentDocumentIdWithEmail(email);
        if (errorStudentDocId) error.student = 'Error retrieving student document id with email.';
        if (!studentDocId) error.student = `No student exists with email: ${email}`;
      }
    }
  }
  if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password`;
  else if (password.length < 6) error.password = 'Password must be longer than 6 characters.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGenerateVerifyOTPRequest = async (email, isLecturer, OTP, path) => {
  let error = {};

  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} ${email}.`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  if (isLecturer === undefined || !(typeof isLecturer === 'boolean')) {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  } else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      if (isLecturer) {
        const { lecturerDocId, lecturerDocIdError } = await getLecturerDocumentIdWithEmail(email);
        if (lecturerDocIdError) error.lecturer = 'Error retrieving lecturer document id with email.';
        if (!lecturerDocId) error.lecturer = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
      } else {
        const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
        if (studentDocIdError) error.student = 'Error retrieving student document id with email.';
        if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
      }
      if (path === USERS_ROUTES.VERIFY_OTP) {
        const { data, OTPDocumentError } = await getLatestOTPDocumentOfUser(email);
        if (stringIsEmpty(OTP)) error.OTP = `Must include OTP`;
        if (OTPDocumentError) error.OTP = 'Error retrieving user OTP documents with email.';
        if (!data) error.OTP = `No OTP documents is found with ${email}.`;
      }
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetUserRequest = async (email, isLecturer) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  if (isLecturer === undefined || typeof isLecturer !== 'boolean') {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean.';
  } else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      if (isLecturer) {
        const { lecturerDocId, lecturerDocIdError } = await getLecturerDocumentIdWithEmail(email);
        if (lecturerDocIdError) error.lecturer = 'Error retrieving lecturer document id with email.';
        if (!lecturerDocId) error.lecturer = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
      } else {
        const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
        if (studentDocIdError) error.student = 'Error retrieving student document id with email.';
        if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;
      }
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUserSubscriptionRequest = async (email, courses, path) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  if (!courses || !Array.isArray(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      let invalidCourses = [];
      let subscribedCourses = [];
      let notSubscribedCourses = [];

      const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
      if (studentDocIdError) error.student = 'Error retrieving student id with email.';
      if (!studentDocId) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}`;

      // TODO: is this really necessary ?
      await Promise.all(courses.map(async courseCode => {
        const { courseDocId, courseDocIdError } = await getCourseDocumentIdWithCode(courseCode);
        const { subscribed, subscribedError } = await studentAlreadySubscribedToCourses(studentDocId, courseCode);

        if (!courseDocId) invalidCourses.push(courseCode);
        if (courseDocIdError) error.course = 'Error retrieving course document id with code.';

        if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES) {
          if (subscribed) subscribedCourses.push(courseCode);
        } else {
          if (!subscribed) notSubscribedCourses.push(courseCode);
        }

        if (subscribedError) error.subscription = 'Error checking user subscription.';
        if (invalidCourses.length > 0) error.courses = `Course(s) do not exists: ${invalidCourses}`;

        if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES && subscribedCourses.length > 0) {
          error.user = `User already subscribed to course(s): ${subscribedCourses}.`;
        }
        if (path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES && notSubscribedCourses.length > 0) {
          error.user = `User is not subscribed to course(s): ${notSubscribedCourses}.`;
        }
      }));
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUserAttendanceRegistrationRequest = async (email, sessionId) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is in incorrect format.';
  if (!sessionId) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId.`;
  else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      // eslint-disable-next-line max-len
      const { attendanceSessionExists, attendanceSessionExistsError } = await attendanceSessionExistsWithDocId(sessionId);
      if (attendanceSessionExistsError) error.session = 'Error retrieving session id with email.';
      if (!attendanceSessionExists) error.session = `No attendance session exists with id: ${sessionId}.`;
      else {
        const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);
        if (studentDocIdError) error.student = 'Error retrieving document id with email.';
        if (!studentDocId) error.student = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;

        const { attended, errorAttended } = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
        if (errorAttended) error.student = 'Error checking user attendance.';
        if (attended) error.attended = 'Student have already attended this session.';
      }
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateCountMissedTotalAttendanceSessionsRequest = async (email, courses, semester) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is in incorrect format.';
  if (!courses || !Array.isArray(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (stringIsEmpty(semester)) error.semester = `${ERROR_MESSAGES.MISSING_FIELD} semester.`;
  // TODO: validate user subscription
  return { error, valid: Object.keys(error).length === 0 };
};


module.exports = {
  validateCreateUserRequest,
  validateSignInChangePasswordRequest,
  validateGenerateVerifyOTPRequest,
  validateGetUserRequest,
  validateUserSubscriptionRequest,
  validateUserAttendanceRegistrationRequest,
  validateCountMissedTotalAttendanceSessionsRequest,
};
