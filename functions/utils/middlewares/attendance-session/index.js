const ATTENDANCE_SESSION_ROUTES = require('../../../routes/attendance-session');
const {courseAlreadyExistsWithCourseCode} = require('../../../handlers/courses/helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === ATTENDANCE_SESSION_ROUTES.CREATE_ATTENDANCE_SESSION) {
    const {validOn, expireOn, courseCode} = req.body;
    if (!validOn) return res.json({error: 'Must include validOn'});
    if (!expireOn) return res.json({error: 'Must include expireOn'});
    if (!courseCode) return res.json({error: 'Must include courseCode'});
    const {exists} = await courseAlreadyExistsWithCourseCode(courseCode);
    if (!exists) return res.json({error: `Course with course code: ${courseCode} does not exist`});
  }

  return next();
};
