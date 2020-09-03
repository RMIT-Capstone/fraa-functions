const ATTENDANCE_SESSIONS_ROUTES = require('../../../routes/attendance-sessions');
const {sendErrorObject, sendErrorMessage} = require('../../helpers');
const {
  attendanceSessionExistsWithDocId,
  userAlreadyRegisteredToAttendanceSession,
  validateCreateAttendanceSessionRequest,
  validateGetMoreAttendanceByCourseCodeRequest,
  validateGetAttendanceSessionInDateRangeRequest,
  validateRegisterStudentToAttendanceSessionRequest
} = require('./helper');
const {getUserDocumentIdWithEmail} = require('../users/helper');
const {getCourseDocumentIdWithCode} = require('../courses/helper');
const ERROR_MESSAGE = require('../../../handlers/constants/ErrorMessages');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const {validOn, expireOn, courseCode} = req.body.content;
    const {error, valid} = validateCreateAttendanceSessionRequest(validOn, expireOn, courseCode);
    if (!valid) return sendErrorObject(res, error);
    const {exists} = await getCourseDocumentIdWithCode(courseCode);
    if (exists) return sendErrorMessage(res, `${ERROR_MESSAGE.COURSE_ALREADY_EXISTS} ${courseCode}.`);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_BY_COURSE_CODE ||
    path === ATTENDANCE_SESSIONS_ROUTES.GET_TODAY_ATTENDANCE_SESSIONS) {
    const {courseCode} = req.body;
    if (!courseCode) return sendErrorMessage(res, `${ERROR_MESSAGE.MISSING_FIELD} course code.`);
    const {exists} = await getCourseDocumentIdWithCode(courseCode);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGE.COURSE_DOES_NOT_EXISTS} ${courseCode}`);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_MORE_ATTENDANCE_SESSIONS_BY_COURSE_CODE) {
    const {courseCode, startAfter} = req.body;
    const {error, valid} = validateGetMoreAttendanceByCourseCodeRequest(courseCode, startAfter);
    if (!valid) return sendErrorObject(res, error);
    const {exists} = await getCourseDocumentIdWithCode(courseCode);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGE.COURSE_DOES_NOT_EXISTS} ${courseCode}.`);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE) {
    const {courseCode, startTime, endTime} = req.body;
    const {error, valid} = validateGetAttendanceSessionInDateRangeRequest(courseCode, startTime, endTime);
    if (!valid) return sendErrorObject(res, error);
    const {exists} = await getCourseDocumentIdWithCode(courseCode);
    if (!exists) return sendErrorMessage(res, `${ERROR_MESSAGE.COURSE_DOES_NOT_EXISTS} ${courseCode}`);
    if (startTime > endTime) return res.json({error: 'Start time must be sooner than end time'});
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.REGISTER_STUDENT_TO_ATTENDANCE_SESSION) {
    const {email, sessionId} = req.body;
    const {error, valid} = validateRegisterStudentToAttendanceSessionRequest(email, sessionId);
    if (!valid) return sendErrorObject(res, error);
    const {exists: userExists} = await getUserDocumentIdWithEmail(email);
    if (!userExists) return res.json({error: `User with email: ${email} does not exist`});
    const exists = await attendanceSessionExistsWithDocId(sessionId);
    if (!exists) return res.json({error: `Attendance session with id: ${sessionId} does not exist`});
    const attended = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
    if (attended) return res.json({error: `User already registered to attendance session`});
  }

  return next();
};
