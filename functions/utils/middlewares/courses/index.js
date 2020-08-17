const COURSE_ROUTES = require('../../../routes/courses');
const {userDocumentExistsWithEmail} = require('../../../handlers/users/helper');
const {courseAlreadyExist} = require('../../../handlers/courses/helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === COURSE_ROUTES.CREATE_COURSE ) {
    const {course} = req.body;
    if (!course) return res.json({error: 'Must include course'});
    const courseExisted = await courseAlreadyExist(course.code);
    if (courseExisted) return res.json({error: `Course with code: ${course.code} already exists`});
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const {course} = req.body;
    if (!course) return res.json({error: 'Must include course'});
    const courseExisted = await courseAlreadyExist(course.code);
    if (!courseExisted) return res.json({error: `Course with code: ${course.code} does not exist`});
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES || path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const {startAt} = req.body;
    if (!startAt) return res.json({error: 'Must include startAt'});
  }

  if (path === COURSE_ROUTES.GET_COURSES_BY_NAME) {
    const {name} = req.body;
    if (!name) return res.json({error: 'Must include course name'});
  }

  if (path === COURSE_ROUTES.GET_COURSE_BY_CODE) {
    const {code} = req.body;
    if (!code) return res.json({error: 'Must include course code'});
    const courseExists = courseAlreadyExist(code);
    if (!courseExists) return res.json({error: `Course with code: ${code} does not exist`});
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const {email} = req.body;
    const userExists = await userDocumentExistsWithEmail(email);
    if (!userExists) return res.json({error: 'User does not exist'});
  }

  return next();
};
