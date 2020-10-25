const ATTENDANCE_SESSIONS_ROUTES = require('../../routes/attendance-sessions');
const {sendErrorObject, sendErrorMessage} = require('../../../helpers/express-helpers');
const {
  attendanceSessionExistsWithDocId,
  userAlreadyRegisteredToAttendanceSession,
  validateCreateAttendanceSessionRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateRegisterStudentToAttendanceSessionRequest
} = require('../../../helpers/attendance-session-helpers');
const {getUserDocumentIdWithEmail} = require('../../../helpers/users-helpers');
const {getCourseDocumentIdWithCode} = require('../../../helpers/courses-helpers');
const ERROR_MESSAGE = require('../../../handlers/constants/ErrorMessages');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const {validOn, expireOn, courseCode} = req.body.content;

    const {error, valid} = validateCreateAttendanceSessionRequest(validOn, expireOn, courseCode);
    if (!valid) return sendErrorObject(res, error);

    const {id: courseDocId, error: courseDocIdError} = await getCourseDocumentIdWithCode(courseCode);
    if (courseDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGE.GENERIC_ERROR_MESSAGE}`);
    if (!courseDocId) return sendErrorMessage(res, `${ERROR_MESSAGE.COURSE_DOES_NOT_EXISTS} ${courseCode}.`);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE) {
    const {courses, startTime, endTime} = req.body;
    const {error, valid} = validateGetAttendanceSessionsInDateRangeRequest(courses, startTime, endTime);
    if (!valid) return sendErrorObject(res, error);
    if (startTime > endTime) return res.json({error: 'Start time must be sooner than end time'});
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_MONTH_RANGE) {
    const {courses, startMonth, monthRange} = req.body;
    const {error, valid} = validateGetAttendanceSessionsInMonthRangeRequest(courses, startMonth, monthRange);
    if (!valid) return sendErrorMessage(res, error);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_DAILY_ATTENDANCE_SESSION) {
    const {courses} = req.body;
    if (!courses) return sendErrorMessage(res, `${ERROR_MESSAGE.MISSING_FIELD} courses.`);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_MONTHLY_ATTENDANCE_SESSIONS) {
    const {courses, month} = req.body;
    if (!courses) return sendErrorMessage(res, `${ERROR_MESSAGE.MISSING_FIELD} courses.`);
    if (!month) return sendErrorMessage(res, `${ERROR_MESSAGE.MISSING_FIELD} month.`);

    if (month < 0 || month > 11) return sendErrorMessage(res, 'Month must be between 0 and 11');
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.REGISTER_STUDENT_TO_ATTENDANCE_SESSION) {
    const {email, sessionId} = req.body;
    const {error, valid} = validateRegisterStudentToAttendanceSessionRequest(email, sessionId);
    if (!valid) return sendErrorObject(res, error);

    const {id: userDocId, error: userDocIdError} = await getUserDocumentIdWithEmail(email);
    if (userDocIdError) return sendErrorMessage(res, `${ERROR_MESSAGE.GENERIC_ERROR_MESSAGE}`);
    if (!userDocId) return res.json({error: `${ERROR_MESSAGE.USER_DOES_NOT_EXIST} ${email}.`});

    const {
      exists: attendanceSessionExists,
      error: errorAttendanceSessionExists
    } = await attendanceSessionExistsWithDocId(sessionId);
    if (errorAttendanceSessionExists) return sendErrorMessage(res, `${ERROR_MESSAGE.GENERIC_ERROR_MESSAGE}`);
    if (!attendanceSessionExists) return res.json({error: `Attendance session with id: ${sessionId} does not exist`});

    const {attended, error: errorAttended} = await userAlreadyRegisteredToAttendanceSession(email, sessionId);
    if (errorAttended) return sendErrorMessage(res, `${ERROR_MESSAGE.GENERIC_ERROR_MESSAGE}.`);
    if (attended) return res.json({error: `User already registered to attendance session`});
  }

  return next();
};
