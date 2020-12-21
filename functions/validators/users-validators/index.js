const {
  userAlreadyRegisteredToAttendanceSession,
  attendanceSessionExistsWithDocId,
} = require("../../helpers/attendance-sessions-helpers");
const {
  isEmail,
  stringIsEmpty,
  booleanIsMissing,
  objectIsMissing,
  arrayIsMissing,
} = require("../../helpers/utilities-helpers");
const {
  studentAlreadySubscribedToCourses,
  getCourseDocumentIdWithCode,
} = require("../../helpers/courses-helpers");
const {
  userWithEmailExistsInFirestore,
  userWithIdExistsInFirestore,
  getLatestOTPDocumentOfUser,
} = require("../../helpers/users-helpers");
const USERS_ROUTES = require("../../utils/routes/users");
const SCHEMA = require("../../schema");
const { checkSchema } = require("../../schema");
const ERROR = require("../../utils/errors");

const validateCreateUserRequest = async (user) => {
  if (objectIsMissing(user)) throw new ERROR.MissingObjectError("user");
  else {
    const validate = checkSchema(SCHEMA.createUserRequest, user);
    if (validate !== null) throw new ERROR.schemaError(validate);
  }
  // email duplicate is already handled inside create user function in users/https
};

const validateDeleteUserRequest = async (email) => {
  const validate = checkSchema(SCHEMA.requiredUserEmail, { email });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateUpdateUserRequest = async (user) => {
  if (objectIsMissing(user)) throw new ERROR.MissingObjectError("user");
  else {
    const validate = checkSchema(SCHEMA.updateUserRequest, user);
    if (validate !== null) throw new ERROR.schemaError(validate);
    const { existsWithId } = await userWithIdExistsInFirestore(user.id);
    if (!existsWithId) throw new ERROR.NotExisted(user.id);
  }
};

const validateGetUserByEmailRequest = async (email) => {
  const validate = checkSchema(SCHEMA.requiredUserEmail, { email });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateGetAllUsersRequest = (isLecturer) => {
  if (booleanIsMissing(isLecturer))
    throw new ERROR.MissingObjectError("isLecturer");
};

const validateSignInRequest = async (email, password) => {
  const validate = checkSchema(SCHEMA.userAccountRequest, { email, password });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateChangePasswordRequest = async (email, password) => {
  const validate = checkSchema(SCHEMA.userAccountRequest, { email, password });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateGenerateOTPRequest = async (email) => {
  const validate = checkSchema(SCHEMA.requiredUserEmail, { email });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateVerifyOTPRequest = async (email, OTP) => {
  const validate = checkSchema(SCHEMA.verifyOTPRequest, { email, OTP });
  if (validate !== null) throw new ERROR.schemaError(validate);

  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);

  const { data } = await getLatestOTPDocumentOfUser(email);
  if (data === null) throw new ERROR.NotExisted(`OTP documents with ${email}`);
};

const validateUserSubscriptionRequest = async (userId, courses, path) => {
  let error = {};
  if (stringIsEmpty(userId))
    error.userId = `${ERROR_MESSAGES.MISSING_FIELD} userId`;
  else if (arrayIsMissing(courses))
    error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses`;
  else {
    let invalidCourses = [];
    let subscribedCourses = [];
    let notSubscribedCourses = [];

    const {
      existsWithId,
      errorCheckExists,
    } = await userWithIdExistsInFirestore(userId);
    if (errorCheckExists) error.user = "Error checking user exists with id";
    if (!existsWithId)
      error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_ID} ${userId}`;
    else {
      await Promise.all(
        courses.map(async (courseCode) => {
          const {
            courseDocId,
            courseDocIdError,
          } = await getCourseDocumentIdWithCode(courseCode);
          const {
            subscribed,
            subscribedError,
          } = await studentAlreadySubscribedToCourses(userId, courseCode);

          if (!courseDocId) invalidCourses.push(courseCode);
          if (courseDocIdError)
            error.course = "Error retrieving course document id with code";

          if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES) {
            if (subscribed) subscribedCourses.push(courseCode);
          } else {
            if (!subscribed) notSubscribedCourses.push(courseCode);
          }

          if (subscribedError)
            error.subscription = "Error checking user subscription";
          if (invalidCourses.length > 0)
            error.courses = `Course(s) do not exists: ${invalidCourses}`;

          if (
            path === USERS_ROUTES.SUBSCRIBE_TO_COURSES &&
            subscribedCourses.length > 0
          ) {
            error.user = `User already subscribed to course(s): ${subscribedCourses}`;
          }
          if (
            path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES &&
            notSubscribedCourses.length > 0
          ) {
            error.user = `User is not subscribed to course(s): ${notSubscribedCourses}`;
          }
        })
      );
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateUserAttendanceRegistrationRequest = async (email, sessionId) => {
  let error = {};
  if (stringIsEmpty(email))
    error.email = `${ERROR_MESSAGES.MISSING_FIELD} email`;
  else if (!isEmail(email)) error.email = "Email is in incorrect format";
  else {
    const {
      existsWithEmail,
      errorCheckExists,
    } = await userWithEmailExistsInFirestore(email);
    if (errorCheckExists) error.user = "Error checking user exists";
    if (!existsWithEmail)
      error.user = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST_WITH_EMAIL} ${email}`;
  }
  if (!sessionId) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId`;
  else {
    if (!stringIsEmpty(email) && isEmail(email)) {
      // eslint-disable-next-line max-len
      const {
        attendanceSessionExists,
        attendanceSessionExistsError,
      } = await attendanceSessionExistsWithDocId(sessionId);
      if (attendanceSessionExistsError)
        error.session = "Error retrieving session id with email";
      if (!attendanceSessionExists)
        error.session = `No attendance session exists with id: ${sessionId}`;
      else {
        const {
          attended,
          errorAttended,
        } = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
        if (errorAttended) error.student = "Error checking user attendance";
        if (attended)
          error.attended = "Student have already attended this session";
      }
    }
  }

  return { error, valid: Object.keys(error).length === 0 };
};

const validateCountMissedTotalAttendanceSessionsRequest = async (
  email,
  courses,
  semester
) => {
  let error = {};
  if (stringIsEmpty(email))
    error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  else if (!isEmail(email)) error.email = "Email is in incorrect format.";
  if (arrayIsMissing(courses))
    error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (stringIsEmpty(semester))
    error.semester = `${ERROR_MESSAGES.MISSING_FIELD} semester.`;
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
