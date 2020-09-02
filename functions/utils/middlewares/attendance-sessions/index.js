const ATTENDANCE_SESSION_ROUTES = require('../../../routes/attendance-session');
const {courseAlreadyExistsWithCourseCode} = require('../../../handlers/courses/helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === ATTENDANCE_SESSION_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const {validOn, expireOn, courseCode} = req.body.content;
    if (!validOn) return res.json({error: 'Must include validOn'});
    if (!expireOn) return res.json({error: 'Must include expireOn'});
    if (!courseCode) return res.json({error: 'Must include courseCode'});
    const {exists} = await courseAlreadyExistsWithCourseCode(courseCode);
    if (!exists) return res.json({error: `Course with course code: ${courseCode} does not exist`});
  }

  if (path === ATTENDANCE_SESSION_ROUTES.GET_ATTENDANCE_SESSIONS_BY_COURSE_CODE ||
    path === ATTENDANCE_SESSION_ROUTES.GET_TODAY_ATTENDANCE_SESSIONS) {
    const {courseCode} = req.body;
    if (!courseCode) return res.json({error: 'Must include courseCode'});
    const {exists} = await courseAlreadyExistsWithCourseCode(courseCode);
    if (!exists) return res.json({error: `Course with course code: ${courseCode}`});
  }

  if (path === ATTENDANCE_SESSION_ROUTES.GET_MORE_ATTENDANCE_SESSIONS_BY_COURSE_CODE) {
    const {courseCode, startAfter} = req.body;
    if (!courseCode) return res.json({error: 'Must include course code'});
    const {exists} = await courseAlreadyExistsWithCourseCode(courseCode);
    if (!exists) return res.json({error: `Course with course code: ${courseCode}`});
    if (!startAfter) return res.json({error: 'Must include startAfter'});
  }

  if (path === ATTENDANCE_SESSION_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE) {
    const {courseCode, startTime, endTime} = req.body;
    if (!courseCode) return res.json({error: 'Must include course code'});
    const {exists} = await courseAlreadyExistsWithCourseCode(courseCode);
    if (!exists) return res.json({error: `Course with course code: ${courseCode}`});
    if (!startTime) return res.json({error: 'Must include startTime'});
    if (!endTime) return res.json({error: 'Must include endTime'});
    if (startTime > endTime) return res.json({error: 'Start time must be sooner than end time'});
  }

  return next();
};
