const {
  userAlreadyRegisteredToAttendanceSession,
  attendanceSessionExistsWithDocId,
} = require("../../helpers/attendance-sessions-helpers");
const {
  studentAlreadySubscribedToCourses,
  getCourseDocumentIdWithCode,
  studentAlreadySubscribedToCoursesByEmail
} = require("../../helpers/courses-helpers");
const {
  userWithEmailExistsInFirestore,
  userWithIdExistsInFirestore,
  getLatestOTPDocumentOfUser,
} = require("../../helpers/users-helpers");
const { checkSchema, invalidBoolean } = require("../../schema");
const USERS_ROUTES = require("../../utils/routes/users");
const SCHEMA = require("../../schema");
const ERROR = require("../../utils/errors");

const validateCreateUserRequest = async (user) => {
  const validate = checkSchema(SCHEMA.createUserRequest, { user });
  if (validate !== null) throw new ERROR.schemaError(validate);
  // email duplicate is already handled inside create user function in users/https
};

const validateDeleteUserRequest = async (email) => {
  const validate = checkSchema(SCHEMA.requiredUserEmail, { email });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateUpdateUserRequest = async (user) => {
  const validate = checkSchema(SCHEMA.updateUserRequest, { user });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { existsWithId } = await userWithIdExistsInFirestore(user.id);
  if (!existsWithId) throw new ERROR.NotExisted(user.id);
};

const validateGetUserByEmailRequest = async (email) => {
  const validate = checkSchema(SCHEMA.requiredUserEmail, { email });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
};

const validateGetAllUsersRequest = (isLecturer) => {
  if (invalidBoolean(isLecturer))
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
  const validate = checkSchema(SCHEMA.userSubscriptionRequest, { userId, courses });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { existsWithId } = await userWithIdExistsInFirestore(userId);
  if (!existsWithId) throw new ERROR.NotExisted(userId);
  let subscribedCourses = [];
  let notSubscribedCourses = [];
  let invalidCourses = [];
  await Promise.all(
    courses.map(async (courseCode) => {
      const { courseDocId } = await getCourseDocumentIdWithCode(courseCode);
      if (!courseDocId) invalidCourses.push(courseCode);
      const { subscribed } = await studentAlreadySubscribedToCourses(userId, courseCode);
      if (subscribed) subscribedCourses.push(courseCode);
      if (!subscribed) notSubscribedCourses.push(courseCode);
    })
  );
  if (invalidCourses.length > 0) throw new ERROR.NotExisted(invalidCourses);
  if (path === USERS_ROUTES.SUBSCRIBE_TO_COURSES && subscribedCourses.length > 0) {
    throw new ERROR.SubscribedError(`User already subscribed to course(s): ${subscribedCourses}`);
  }
  if (path === USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES && notSubscribedCourses.length > 0) {
    throw new ERROR.SubscribedError( `User is not subscribed to course(s): ${notSubscribedCourses}`);
  }
};

const validateUserAttendanceRegistrationRequest = async (email, sessionId) => {
  const validate = checkSchema(SCHEMA.userAttendanceRegistrationRequest, { email, sessionId });
  if (validate !== null) throw new ERROR.schemaError(validate);

  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);

  const { attendanceSessionExists } = await attendanceSessionExistsWithDocId(sessionId);
  if (!attendanceSessionExists) throw new ERROR.NotExisted(`Attendance session with id: ${sessionId}`);

  const { attended } = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
  if (attended) throw new ERROR.DuplicatedError("Student has already attended, this session");
};

const validateCountMissedTotalAttendanceSessionsRequest = async ( email, courses, semester) => {
  const validate = checkSchema(SCHEMA.countMissedTotalAttendanceSessionsRequest, { email, courses, semester });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { userExists } = await userWithEmailExistsInFirestore(email);
  if (!userExists) throw new ERROR.NotExisted(email);
  let notSubscribedCourses = [];
  let invalidCourses = [];
  await Promise.all(
    courses.map(async (courseCode) => {
      const { courseDocId } = await getCourseDocumentIdWithCode(courseCode);
      if (!courseDocId) invalidCourses.push(courseCode);
      const { subscribed } = await studentAlreadySubscribedToCoursesByEmail(email, courseCode);
      if (!subscribed) notSubscribedCourses.push(courseCode);
    })
  );
  if (invalidCourses.length > 0) throw new ERROR.NotExisted(invalidCourses);
  if (notSubscribedCourses.length > 0) {
    throw new ERROR.SubscribedError( `User is not subscribed to course(s): ${notSubscribedCourses}`);
  }
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
