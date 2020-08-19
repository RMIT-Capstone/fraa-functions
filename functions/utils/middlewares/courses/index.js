const COURSE_ROUTES = require('../../../routes/courses');
const {courseAlreadyExistsWithCourseCode} = require('../../../handlers/courses/helper');
const {userDocumentExistsWithEmail} = require('../../../handlers/users/helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === COURSE_ROUTES.CREATE_COURSE ) {
    const {course} = req.body;
    if (!course) return res.json({error: 'Must include course'});
    const courseExistedWithCode = await courseAlreadyExistsWithCourseCode(course.code);
    if (courseExistedWithCode.exists) return res.json({error: `Course with code: ${course.code} already exists`});
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES || path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const {startAt} = req.body;
    if (!startAt) return res.json({error: 'Must include startAt'});
  }

  if (path === COURSE_ROUTES.GET_COURSE_BY_CODE) {
    const {code} = req.body;
    if (!code) return res.json({error: 'Must include course code'});
    const courseExistedWithCode = await courseAlreadyExistsWithCourseCode(code);
    if (!courseExistedWithCode.exists) return res.json({error: `Course with code: ${code} does not exist`});
  }

  if (path === COURSE_ROUTES.GET_COURSES_BY_NAME) {
    const {name} = req.body;
    if (!name) return res.json({error: 'Must include course name'});
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const {name, startAt} = req.body;
    if (!name) return res.json({error: 'Must include course name'});
    if (!startAt) return res.json({error: 'Must include startAt'});
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const {course} = req.body;
    if (!course) return res.json({error: 'Must include course'});
    const courseExistedWithCode = await courseAlreadyExistsWithCourseCode(course.code);
    if (!courseExistedWithCode.exists) return res.json({error: `Course with code: ${course.code} does not exist`});
  }

  if (path === COURSE_ROUTES.DELETE_COURSE) {
    const {code} = req.body;
    if (!code) return res.json({error: 'Must include course code'});
    const courseExistedWithCode = await courseAlreadyExistsWithCourseCode(code);
    if (!courseExistedWithCode.exists) return res.json({error: `Course with code: ${code} does not exist`});
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const {email} = req.body;
    const userExists = await userDocumentExistsWithEmail(email);
    if (!userExists) return res.json({error: 'User does not exist'});
  }

  return next();
};
