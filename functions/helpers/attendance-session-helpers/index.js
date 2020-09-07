const {db} = require('../../utils/admin');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');

exports.getAttendanceSessionDocumentIdByDate = async date => {
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '==', new Date(date))
      .get();

    if (querySnapshot.empty) return {id: null, error: null};
    else {
      const id = querySnapshot.docs[0].id;
      return {id, error: null};
    }
  }
  catch (errorGetAttendanceSessionDocumentIdByDate) {
    console.error(
      'Something went wrong with getAttendanceSessionDocumentIdByDate: ',
      errorGetAttendanceSessionDocumentIdByDate);
    return {id: null, error: errorGetAttendanceSessionDocumentIdByDate};
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
    return {exists: null, error: errorAttendanceSessionExistsWithDocId};
  }
};

exports.userAlreadyRegisteredToAttendanceSession = async (email, sessionId) => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(sessionId)
      .get();

    const {attendees} = documentSnapshot.data();
    if (!attendees) return {attended: false, error: null};
    return {
      attended: Boolean(attendees.includes(email)),
      error: null
    };
  }
  catch (errorUserAlreadyRegisteredToAttendanceSession) {
    console.error(
      'Something went wrong with userAlreadyRegisteredToAttendanceSession: ',
      errorUserAlreadyRegisteredToAttendanceSession);
    return {attended: null, error: errorUserAlreadyRegisteredToAttendanceSession};
  }
};

exports.validateCreateAttendanceSessionRequest = (validOn, expireOn, courseCode) => {
  let error = {};
  if (!validOn) error.validOn = `${ERROR_MESSAGES.MISSING_FIELD} validOn.`;
  if (!expireOn) error.expireOn = `${ERROR_MESSAGES.MISSING_FIELD} expireOn.`;
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
  return {error, valid: Object.keys(error).length === 0};
};

exports.validateGetMoreAttendanceByCourseCodeRequest = (courseCode, startAfter) => {
  let error = {};
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return {error, valid: Object.keys(error).length === 0};
};

exports.validateGetAttendanceSessionInDateRangeRequest = (courses, startTime, endTime) => {
  let error = {};
  if (!courses) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (!startTime) error.startTime = `${ERROR_MESSAGES.MISSING_FIELD} startTime.`;
  if (!endTime) error.endTime = `${ERROR_MESSAGES.MISSING_FIELD} endTime.`;
  return {error, valid: Object.keys(error).length === 0};
};

exports.validateRegisterStudentToAttendanceSessionRequest = (email, sessionId) => {
  let error = {};
  if (!email) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  if (!sessionId) error.sessionId = `${ERROR_MESSAGES.MISSING_FIELD} sessionId.`;
  return {error, valid: Object.keys(error).length === 0};
};
