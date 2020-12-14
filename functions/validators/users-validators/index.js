const {
  userAlreadyRegisteredToAttendanceSession,
  attendanceSessionExistsWithDocId,
} = require('../../helpers/attendance-sessions-helpers');
const {
  isEmail,
  stringIsEmpty,
  booleanIsMissing,
  objectIsMissing,
  arrayIsMissing,
} = require('../../helpers/utilities-helpers');
const { studentAlreadySubscribedToCourses, getCourseDocumentIdWithCode } = require('../../helpers/courses-helpers');
const {
  userWithEmailExistsInFirestore,
  userWithIdExistsInFirestore,
  getLatestOTPDocumentOfUser,
} = require('../../helpers/users-helpers');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const USERS_ROUTES = require('../../utils/routes/users');

const validateCreateUserRequest = async (user) => {
  let error = {};
  if (objectIsMissing(user)) error.user = `${ERROR_MESSAGES.MISSING_FIELD} user`;
  else {
    const { email, password, displayName, school, isLecturer } = user;
    if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
    else if (!isEmail(email)) error.email = 'Email is not in correct format';
    if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password`;
    else if (password.length < 6) error.password = 'Password must be longer than 6 characters';
    if (stringIsEmpty(displayName)) error.displayName = `${ERROR_MESSAGES.MISSING_FIELD} displayName`;
    if (stringIsEmpty(school)) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school`;
    if (booleanIsMissing(isLecturer)) {
      error.isLecturer = 'isLecturer must not be empty and has to be boolean';
    }
  }

  // email duplicate is already handled inside create user function in users/https

  return { error, valid: Object.keys(error).length === 0 };
};

const validateDeleteUserRequest = async (email) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUpdateUserRequest = async (user) => {
  let error = {};

  if (objectIsMissing(user)) error.user = `${ERROR_MESSAGES.MISSING_FIELD} user`;
  else {
    const { id, displayName, firstTimePassword, school, verified } = user;
    if (stringIsEmpty(id)) error.id = `${ERROR_MESSAGES.MISSING_FIELD} id.`;
    else {
      const { existsWithId, errorCheckExists } = await userWithIdExistsInFirestore(id);
      if (errorCheckExists) error.user = 'Error checking user exists with id';
      if (!existsWithId) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_ID} ${id}`;
      else {
        if (stringIsEmpty(displayName)) error.displayName = `${ERROR_MESSAGES.MISSING_FIELD} displayName`;
        if (booleanIsMissing(firstTimePassword)) {
          error.firstTimePassword = `${ERROR_MESSAGES.MISSING_FIELD} firstTimePassword`;
        }
        if (stringIsEmpty(school)) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school`;
        if (booleanIsMissing(verified)) error.verified = `${ERROR_MESSAGES.MISSING_FIELD} verified`;
      }
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetUserByEmailRequest = async (email) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAllUsersRequest = (isLecturer) => {
  let error = {};
  if (booleanIsMissing(isLecturer)) {
    error.isLecturer = 'isLecturer must not be empty and has to be boolean';
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateSignInRequest = async (email, password) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }
  if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password`;
  else if (password.length < 6) error.password = 'Password must be longer than 6 characters';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateChangePasswordRequest = async (email, password) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }
  if (stringIsEmpty(password)) error.password = `${ERROR_MESSAGES.MISSING_FIELD} password`;
  else if (password.length < 6) error.password = 'Password must be longer than 6 characters';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGenerateOTPRequest = async (email) => {
  let error = {};

  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateVerifyOTPRequest = async (email, OTP) => {
  let error = {};

  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = 'Email is not in correct format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }
  if (stringIsEmpty(OTP)) error.OTP = `${ERROR_MESSAGES.MISSING_FIELD} OTP`;
  else {
    const { data, OTPDocumentError } = await getLatestOTPDocumentOfUser(email);
    if (OTPDocumentError) error.OTP = 'Error retrieving user OTP documents with email';
    if (!data) error.OTP = `No OTP documents is found with ${email}`;
  }

  return { error, valid: Object.keys(error).length === 0 };
};


const validateUserSubscriptionRequest = async (userId, courses, path) => {
  let error = {};
  if (stringIsEmpty(userId)) error.userId = `${ERROR_MESSAGES.MISSING_FIELD} userId`;
  else if (arrayIsMissing(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses`;
  else {
    let invalidCourses = [];
    let subscribedCourses = [];
    let notSubscribedCourses = [];

    const { existsWithId, errorCheckExists } = await userWithIdExistsInFirestore(userId);
    if (errorCheckExists) error.user = 'Error checking user exists with id';
    if (!existsWithId) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_ID} ${userId}`;
    else {
      await Promise.all(courses.map(async courseCode => {
        const { courseDocId, courseDocIdError } = await getCourseDocumentIdWithCode(courseCode);
        const { subscribed, subscribedError } = await studentAlreadySubscribedToCourses(userId, courseCode);

        if (!courseDocId) invalidCourses.push(courseCode);
        if (courseDocIdError) error.course = 'Error retrieving course document id with code';

        if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES) {
          if (subscribed) subscribedCourses.push(courseCode);
        } else {
          if (!subscribed) notSubscribedCourses.push(courseCode);
        }

        if (subscribedError) error.subscription = 'Error checking user subscription';
        if (invalidCourses.length > 0) error.courses = `Course(s) do not exists: ${invalidCourses}`;

        if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES && subscribedCourses.length > 0) {
          error.user = `User already subscribed to course(s): ${subscribedCourses}`;
        }
        if (path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES && notSubscribedCourses.length > 0) {
          error.user = `User is not subscribed to course(s): ${notSubscribedCourses}`;
        }
      }));
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUserAttendanceRegistrationRequest = async (email, sessionId) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = 'Email is in incorrect format';
  else {
    const { existsWithEmail, errorCheckExists } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = 'Error checking user exists';
    if (!existsWithEmail) error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }
  if (!sessionId) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId`;
  else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      // eslint-disable-next-line max-len
      const { attendanceSessionExists, attendanceSessionExistsError } = await attendanceSessionExistsWithDocId(sessionId);
      if (attendanceSessionExistsError) error.session = 'Error retrieving session id with email';
      if (!attendanceSessionExists) error.session = `No attendance session exists with id: ${sessionId}`;
      else {
        const { attended, errorAttended } = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
        if (errorAttended) error.student = 'Error checking user attendance';
        if (attended) error.attended = 'Student have already attended this session';
      }
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateCountMissedTotalAttendanceSessionsRequest = async (email, courses, semester) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = 'Email is in incorrect format.';
  if (arrayIsMissing(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (stringIsEmpty(semester)) error.semester = `${ERROR_MESSAGES.MISSING_FIELD} semester.`;
  // TODO: validate user subscription
  // TODO: validate courses in courses array
  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
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
};
