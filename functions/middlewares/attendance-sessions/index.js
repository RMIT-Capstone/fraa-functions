const { sendErrorObject } = require('../../helpers/express-helpers');
const {
  validateGetMonthlyAttendanceSessionsRequest,
  validateGetDailyAttendanceSessionsRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateCreateAttendanceSessionRequest,
} = require('../../validators/attendance-sessions-validators');
const ATTENDANCE_SESSIONS_ROUTES = require('../../utils/routes/attendance-sessions');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];
  try{
    if (path === ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION) {
      const { validOn, expireOn, room, location, semester, course } = req.body;
      await validateCreateAttendanceSessionRequest(
        validOn, expireOn, room, location, semester, course,
      );
    }

  if (path === ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const { validOn, expireOn, room, location, semester, course } = req.body;
    const { error, valid } = await validateCreateAttendanceSessionRequest(
      validOn, expireOn, room, location, semester, course,
    );
    if (!valid) return sendErrorObject(res, error);
  }

    if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE) {
      const { courses, startTime, endTime } = req.body;
      await validateGetAttendanceSessionsInDateRangeRequest(courses, startTime, endTime);
    }

    if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_MONTH_RANGE) {
      const { courses, startMonth, monthRange, startYear, endYear } = req.body;
      await validateGetAttendanceSessionsInMonthRangeRequest(courses, startMonth, monthRange, startYear, endYear);
    }
  if (path === ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_MONTH_RANGE) {
    const { courses, startMonth, monthRange, startYear, endYear } = req.body;
    const { error, valid } =
      validateGetAttendanceSessionsInMonthRangeRequest(courses, startMonth, monthRange, startYear, endYear);
    if (!valid) return sendErrorObject(res, error);
  }

    if (path === ATTENDANCE_SESSIONS_ROUTES.GET_DAILY_ATTENDANCE_SESSION) {
      const { courses } = req.body;
      await validateGetDailyAttendanceSessionsRequest(courses);
    }

    if (path === ATTENDANCE_SESSIONS_ROUTES.GET_MONTHLY_ATTENDANCE_SESSIONS) {
      const { courses, month } = req.body;
      await validateGetMonthlyAttendanceSessionsRequest(courses, month);
    }

    return next();
  } catch (error){
    console.log(error);
    return sendErrorObject(res, error.message);
  }
};
