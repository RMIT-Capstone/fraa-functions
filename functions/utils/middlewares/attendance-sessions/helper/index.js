const {db} = require('../../../admin');
const ERROR_MESSAGES = require('../../../../handlers/constants/ErrorMessages');

exports.getAttendanceSessionDocumentIdByDate = async date => {
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '==', new Date(date))
      .get();

    if (querySnapshot.empty) return {exists: false, id: null};
    else {
      const id = querySnapshot.docs[0].id;
      return {exists: true, id};
    }
  }
  catch (errorGetAttendanceSessionDocumentIdByDate) {
    console.error('Something went wrong with get attendance session document id by date: ',
      errorGetAttendanceSessionDocumentIdByDate);
    return {exists: false, id: null};
  }
};

exports.attendanceSessionExistsWithDocId = async docId => {
  const documentSnapshot = await db
    .collection('attendance-sessions')
    .doc(docId)
    .get();

  return documentSnapshot.exists;
};

exports.userAlreadyRegisteredToAttendanceSession = async (email, sessionId) => {
  const documentSnapshot = await db
    .collection('attendance-sessions')
    .doc(sessionId)
    .get();

  return Boolean(documentSnapshot.data().attendees.includes(email));
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

exports.validateGetAttendanceSessionInDateRangeRequest = (courseCode, startTime, endTime) => {
  let error = {};
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
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
