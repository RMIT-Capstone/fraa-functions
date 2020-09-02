const COURSE_ROUTES = require('../../../routes/courses');
const {getUserDocumentIdWithEmail} = require('../users/helper');
const {getCourseDocumentIdWithCode} = require('./helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === COURSE_ROUTES.CREATE_COURSE ) {
    const {course} = req.body;
    if (!course) return res.json({error: 'Must include course'});
    const courseExistedWithCode = await getCourseDocumentIdWithCode(course.code);
    if (courseExistedWithCode.exists) return res.json({error: `Course with code: ${course.code} already exists`});
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES || path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const {startAfter} = req.body;
    if (!startAfter) return res.json({error: 'Must include startAfter'});
  }

  if (path === COURSE_ROUTES.GET_COURSE_BY_CODE) {
    const {code} = req.body;
    if (!code) return res.json({error: 'Must include course code'});
    const courseExistedWithCode = await getCourseDocumentIdWithCode(code);
    if (!courseExistedWithCode.exists) return res.json({error: `Course with code: ${code} does not exist`});
  }

  if (path === COURSE_ROUTES.GET_COURSES_BY_NAME) {
    const {name} = req.body;
    if (!name) return res.json({error: 'Must include course name'});
  }

  if (path === COURSE_ROUTES.GET_MORE_COURSES_BY_NAME) {
    const {name, startAfter} = req.body;
    if (!name) return res.json({error: 'Must include course name'});
    if (!startAfter) return res.json({error: 'Must include startAfter'});
  }

  if (path === COURSE_ROUTES.UPDATE_COURSE) {
    const {course} = req.body;
    if (!course) return res.json({error: 'Must include course'});
    const courseExistedWithCode = await getCourseDocumentIdWithCode(course.code);
    if (!courseExistedWithCode.exists) return res.json({error: `Course with code: ${course.code} does not exist`});
  }

  if (path === COURSE_ROUTES.DELETE_COURSE) {
    const {code} = req.body;
    if (!code) return res.json({error: 'Must include course code'});
    const courseExistedWithCode = await getCourseDocumentIdWithCode(code);
    if (!courseExistedWithCode.exists) return res.json({error: `Course with code: ${code} does not exist`});
  }

  if (path === COURSE_ROUTES.SUBSCRIBE_COURSES || path === COURSE_ROUTES.UNSUBSCRIBE_COURSES) {
    const {email, courses} = req.body;
    if (!courses) return res.json({error: 'Must include courses'});
    let invalidCourses = [];
    // use promise all to concurrently check for courses that do not exist
    // cannot use for each or map because it will throw an error for sending a response message when a message is
    // already sent
    await Promise.all(courses.map(async courseCode => {
      const {exists} = await getCourseDocumentIdWithCode(courseCode);
      if (!exists) invalidCourses.push(courseCode);
    }));
    if (invalidCourses.length > 0) return res.json({error: `Course(s) do not exist: ${invalidCourses}`});
    if (!email) return res.json({error: 'Must include email'});
    const {exists} = await getUserDocumentIdWithEmail(email);
    if (!exists) return res.json({error: 'User does not exist'});
  }

  return next();
};
