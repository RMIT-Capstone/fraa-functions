const { sendErrorObject } = require('../../../helpers/express-helpers');
const ATTENDANCE_SESSIONS_ROUTES = require('../../routes/attendance-sessions');
const {
  validateGetMonthlyAttendanceSessionsRequest,
  validateGetDailyAttendanceSessionsRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateCreateAttendanceSessionRequest,
} = require('../../../validators/attendance-sessions-validators');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const { courseId, courseCode, courseName, lecturer, location, semester, validOn, expireOn } = req.body.content;
    const { error, valid } = await validateCreateAttendanceSessionRequest(
      courseId,
      courseCode,
      courseName,
      lecturer,
      location,
      semester,
      validOn,
      expireOn,
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

  return next();
};
