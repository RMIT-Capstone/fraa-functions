const { db } = require('../../utils/admin');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const { stringIsEmpty } = require('../utilities-helpers');
const { courseExistsWithDocumentId } = require('../courses-helpers');
const { getStudentDocumentIdWithEmail } = require('../users-helpers');

const getAttendanceSessionDocumentIdByDate = async date => {
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
  } catch (errorGetAttendanceSessionDocumentIdByDate) {
    console.error(
      'Something went wrong with getAttendanceSessionDocumentIdByDate: ',
      errorGetAttendanceSessionDocumentIdByDate);
    return { id: null, error: errorGetAttendanceSessionDocumentIdByDate };
  }
};

const attendanceSessionExistsWithDocId = async docId => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(docId)
      .get();

    return {
      attendanceSessionExists: documentSnapshot.exists,
      attendanceSessionExistsError: null,
    };
  } catch (errorAttendanceSessionExistsWithDocId) {
    console.error(
      'Something went wrong with attendanceSessionExistsWithDocId: ',
      errorAttendanceSessionExistsWithDocId);
    return { attendanceSessionExists: null, attendanceSessionExistsError: errorAttendanceSessionExistsWithDocId };
  }
};

const userAlreadyRegisteredToAttendanceSession = async (email, sessionId) => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(sessionId)
      .get();

    const { attendees } = documentSnapshot.data();
    if (!attendees) return { attended: false, errorAttended: null };
    return {
      attended: Boolean(attendees.includes(email)),
      errorAttended: null,
    };
  } catch (errorUserAlreadyRegisteredToAttendanceSession) {
    console.error(
      'Something went wrong with userAlreadyRegisteredToAttendanceSession: ',
      errorUserAlreadyRegisteredToAttendanceSession);
    return { attended: null, errorAttended: errorUserAlreadyRegisteredToAttendanceSession };
  }
};

//validations
// eslint-disable-next-line max-len
const validateCreateAttendanceSessionRequest = async (courseId, courseCode, courseName, lecturer, location, validOn, expireOn) => {
  let error = {};
  if (stringIsEmpty(courseId)) error.courseId = `${ERROR_MESSAGES.MISSING_FIELD} courseId`;
  else if (stringIsEmpty(courseCode)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode.`;
  else if (stringIsEmpty(courseName)) error.courseName = `${ERROR_MESSAGES.MISSING_FIELD} courseName.`;
  else if (stringIsEmpty(lecturer)) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
  else if (stringIsEmpty(validOn)) error.validOn = `${ERROR_MESSAGES.MISSING_FIELD} validOn.`;
  else {
    const { courseExistsWithDocId, courseExistsWithDocIdError } = await courseExistsWithDocumentId(courseId);
    if (courseExistsWithDocIdError) error.internalError = 'Internal server error.';
    if (!courseExistsWithDocId) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${courseId}.`;
    else {
      let sessions = [];
      let start = new Date(validOn).setHours(0, 0, 0, 0);
      const end = new Date(validOn).setHours(23, 59, 59, 999);
      const querySnapshot = await db
        .collection('attendance-sessions')
        .where('courseCode', '==', courseCode)
        .get();

      if (!querySnapshot.empty) {
        querySnapshot.forEach(snapshot => {
          sessions.push(snapshot.data());
        });

        const filteredSession = sessions.filter(session => {
          const { validOn } = session;
          return validOn.toDate() > start && validOn.toDate() < end;
        });

        if (filteredSession.length !== 0) {
          error.invalidRequest = 'Cannot have 2 sessions in the same day with the same course.';
        }
      }
    }
  }
  if (stringIsEmpty(expireOn)) error.expireOn = `${ERROR_MESSAGES.MISSING_FIELD} expireOn.`;
  if (stringIsEmpty(location)) error.location = `${ERROR_MESSAGES.MISSING_FIELD} location.`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMoreAttendanceByCourseCodeRequest = (courseCode, startAfter) => {
  let error = {};
  if (stringIsEmpty(courseCode)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
  if (stringIsEmpty(startAfter)) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAttendanceSessionsInDateRangeRequest = (courses, startTime, endTime) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (stringIsEmpty(startTime)) error.startTime = `${ERROR_MESSAGES.MISSING_FIELD} startTime.`;
  if (stringIsEmpty(endTime)) error.endTime = `${ERROR_MESSAGES.MISSING_FIELD} endTime.`;
  if (startTime > endTime) error.time = 'Start time must be sooner than end time.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAttendanceSessionsInMonthRangeRequest = (courses, startMonth, monthRange) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (startMonth <= 0 || startMonth > 11) error.startMonth = `startMonth must be between 1 and 11`;
  if (monthRange <= 0 || monthRange > 6) {
    error.monthRange = 'monthRange must be at least 1 and maximum 6.';
  }
  return { error, valid: Object.keys(error).length === 0 };
};

const validateRegisterStudentToAttendanceSessionRequest = async (email, sessionId) => {
  let error = {};
  if (stringIsEmpty(email)) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  if (stringIsEmpty(sessionId)) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId.`;

  const { studentDocId, studentDocIdError } = await getStudentDocumentIdWithEmail(email);

  if (studentDocIdError) error.user = 'Error retrieving user document id.';
  if (!studentDocId) error.usere = `${ERROR_MESSAGES.USER_DOES_NOT_EXIST} ${email}.`;

  const {
    attendanceSessionExists,
    attendanceSessionExistsError,
  } = await attendanceSessionExistsWithDocId(sessionId);
  if (attendanceSessionExistsError) error.attendanceSession = `Error check attendance session exists.`;
  if (!attendanceSessionExists) error.attendanceSession = `No attendance session exists with id: ${sessionId}`;

  const { attended, errorAttended } = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
  if (errorAttended) error.attended = 'Error check user attendance.';
  if (attended) error.attended = 'User already registered to attendance session.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetDailyAttendanceSessionsRequest = (courses) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courses = 'Must include courses.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMonthlyAttendanceSessionsRequest = (courses, month) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courses = 'Must include courses.';
  if (!month) error.month = 'Must include month.';
  if (month < 0 || month > 11) error.month = 'Month must be between 0 and 11';

  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
  getAttendanceSessionDocumentIdByDate,
  attendanceSessionExistsWithDocId,
  userAlreadyRegisteredToAttendanceSession,
  validateCreateAttendanceSessionRequest,
  validateGetMoreAttendanceByCourseCodeRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateRegisterStudentToAttendanceSessionRequest,
  validateGetDailyAttendanceSessionsRequest,
  validateGetMonthlyAttendanceSessionsRequest,
};
