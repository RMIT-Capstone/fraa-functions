const { db } = require('../../utils/admin');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const { getUserDocumentIdWithEmail } = require('../users-helpers');
const { getCourseDocumentIdWithCode } = require('../courses-helpers');

exports.getAttendanceSessionDocumentIdByDate = async date => {
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '==', new Date(date))
      .get();

    if (querySnapshot.empty) return { id: null, error: null };
    else {
      const id = querySnapshot.docs[0].id;
      return { id, error: null };
    }
  }
  catch (errorGetAttendanceSessionDocumentIdByDate) {
    console.error(
      'Something went wrong with getAttendanceSessionDocumentIdByDate: ',
      errorGetAttendanceSessionDocumentIdByDate);
    return { id: null, error: errorGetAttendanceSessionDocumentIdByDate };
  }
};

exports.attendanceSessionExistsWithDocId = async docId => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(docId)
      .get();

    return {
      exists: documentSnapshot.exists,
      error: null
    };
  }
  catch (errorAttendanceSessionExistsWithDocId) {
    console.error(
      'Something went wrong with attendanceSessionExistsWithDocId: ',
      errorAttendanceSessionExistsWithDocId);
    return { exists: null, error: errorAttendanceSessionExistsWithDocId };
  }
};

exports.userAlreadyRegisteredToAttendanceSession = async (email, sessionId) => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(sessionId)
      .get();

    const { attendees } = documentSnapshot.data();
    if (!attendees) return { attended: false, error: null };
    return {
      attended: Boolean(attendees.includes(email)),
      error: null
    };
  }
  catch (errorUserAlreadyRegisteredToAttendanceSession) {
    console.error(
      'Something went wrong with userAlreadyRegisteredToAttendanceSession: ',
      errorUserAlreadyRegisteredToAttendanceSession);
    return { attended: null, error: errorUserAlreadyRegisteredToAttendanceSession };
  }
};

//validations
exports
  .validateCreateAttendanceSessionRequest = async (courseCode, courseName, lecturer, validOn, expireOn, location) => {
    let error = {};
    if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode.`;
    else {
      const { id, error: docIdError } = await getCourseDocumentIdWithCode(courseCode);
      if (docIdError) {
        error.course = 'Error retrieving course doc id.';
      }
      if (!id) {
        error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${courseCode}`;
      }
    }
    if (!courseName) error.courseName = `${ERROR_MESSAGES.MISSING_FIELD} courseName.`;
    if (!lecturer) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
    if (!validOn) error.validOn = `${ERROR_MESSAGES.MISSING_FIELD} validOn.`;
    else {
      let start = new Date(validOn);
      start.setHours(0, 0, 0, 0);
      const end = new Date(validOn);
      end.setHours(23, 59, 59, 999);
      const querySnapshot = await db
        .collection('attendance-sessions')
        .where('validOn', '>=', start)
        .where('validOn', '<=', end)
        .get();

      if (!querySnapshot.empty) {
        error.invalidRequest = 'Cannot create 2 attendance session of the same day with the same course.';
      }
    }
    if (!expireOn) error.expireOn = `${ERROR_MESSAGES.MISSING_FIELD} expireOn.`;
    if (!location) error.location = `${ERROR_MESSAGES.MISSING_FIELD} location.`;

    return { error, valid: Object.keys(error).length === 0 };
  };

exports.validateGetMoreAttendanceByCourseCodeRequest = (courseCode, startAfter) => {
  let error = {};
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateGetAttendanceSessionsInDateRangeRequest = async (courses, startTime, endTime) => {
  let error = {};
  if (!courses) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (!startTime) error.startTime = `${ERROR_MESSAGES.MISSING_FIELD} startTime.`;
  if (!endTime) error.endTime = `${ERROR_MESSAGES.MISSING_FIELD} endTime.`;
  if (startTime > endTime) error.time = 'Start time must be sooner than end time.';

  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateGetAttendanceSessionsInMonthRangeRequest = (courses, startMonth, monthRange) => {
  let error = {};
  if (!courses) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (startMonth <= 0 || startMonth > 11) error.startMonth = `startMonth must be between 1 and 11`;
  if (monthRange <= 0 || monthRange > 6) {
    error.monthRange = 'monthRange must be at least 1 and maximum 6.';
  }
  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateRegisterStudentToAttendanceSessionRequest = async (email, sessionId) => {
  let error = {};
  if (!email) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  if (!sessionId) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId.`;

  const { id, error: userDocIdError } = await getUserDocumentIdWithEmail(email);

  if (userDocIdError) error.user = 'Error retrieving user document id.';
  if (!id) error.usere = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;

  const {
    exists: attendanceSessionExists,
    error: errorAttendanceSessionExists
  } = await attendanceSessionExistsWithDocId(sessionId);
  if (errorAttendanceSessionExists) error.attendanceSession = `Error check attendance session exists.`;
  if (!attendanceSessionExists) error.attendanceSession = `No attendance session exists with id: ${sessionId}`;

  const { attended, error: errorAttended } = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
  if (errorAttended) error.attended = 'Error check user attendance.';
  if (attended) error.attended = 'User already registered to attendance session.';

  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateGetDailyAttendanceSessionsRequest = (courses) => {
  let error = {};
  if (!courses) error.courses = 'Must include courses.';

  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateGetMonthlyAttendanceSessionsRequest = (courses, month) => {
  let error = {};
  if (!courses) error.courses = 'Must include courses.';
  if (!month) error.month = 'Must include month.';
  if (month < 0 || month > 11) error.month = 'Month must be between 0 and 11';

  return { error, valid: Object.keys(error).length === 0 };
};
