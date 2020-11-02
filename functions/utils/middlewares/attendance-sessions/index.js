const ATTENDANCE_SESSIONS_ROUTES = require('../../routes/attendance-sessions');
const { sendErrorObject } = require('../../../helpers/express-helpers');
const {
  validateCreateAttendanceSessionRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateRegisterStudentToAttendanceSessionRequest,
  validateGetDailyAttendanceSessionsRequest,
  validateGetMonthlyAttendanceSessionsRequest
} = require('../../../helpers/attendance-session-helpers');

// TODO: check register student to attendance session request
module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const { courseCode, courseName, lecturer, validOn, expireOn, location } = req.body.content;

    const { error, valid } = await validateCreateAttendanceSessionRequest(
      courseCode,
      courseName,
      lecturer,
      validOn,
      expireOn,
      location
    );
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE) {
    const { courses, startTime, endTime } = req.body;
    const { error, valid } = validateGetAttendanceSessionsInDateRangeRequest(courses, startTime, endTime);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_MONTH_RANGE) {
    const { courses, startMonth, monthRange } = req.body;
    const { error, valid } = validateGetAttendanceSessionsInMonthRangeRequest(courses, startMonth, monthRange);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_DAILY_ATTENDANCE_SESSION) {
    const { courses } = req.body;
    const { error, valid } = validateGetDailyAttendanceSessionsRequest(courses);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_MONTHLY_ATTENDANCE_SESSIONS) {
    const { courses, month } = req.body;
    const { error, valid } = validateGetMonthlyAttendanceSessionsRequest(courses, month);
    if (!valid) return sendErrorObject(res, error);
  }

  if (path === ATTENDANCE_SESSIONS_ROUTES.REGISTER_STUDENT_TO_ATTENDANCE_SESSION) {
    const { email, sessionId } = req.body;
    const { error, valid } = validateRegisterStudentToAttendanceSessionRequest(email, sessionId);
    if (!valid) return sendErrorObject(res, error);
  }

  return next();
};
