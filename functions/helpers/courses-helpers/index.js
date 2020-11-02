const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const { db } = require('../../utils/admin');

exports.getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();

    if (querySnapshot.empty) return { id: null, error: null };
    else {
      const documentId = querySnapshot.docs[0].id;
      return { id: documentId, error: null };
    }
  }
  catch (errorGetCourseDocumentIdWithCode) {
    console.error('Something went wrong with getCourseDocumentIdWithCode', errorGetCourseDocumentIdWithCode);
    return { id: null, error: errorGetCourseDocumentIdWithCode };
  }
};

exports.userAlreadySubscribedToCourse = async (userDocId, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .doc(userDocId)
      .get();
    const { subscribedCourses } = querySnapshot.data();
    if (!subscribedCourses) return { subscribed: false, error: null };
    return {
      subscribed: subscribedCourses.includes(courseCode),
      error: null
    };
  }
  catch (errorUserAlreadySubscribedToCourse) {
    console.error('Something went wrong with userAlreadySubscribedToCourse: ', errorUserAlreadySubscribedToCourse);
    return { subscribed: null, error: errorUserAlreadySubscribedToCourse };
  }
};

exports.validateCreateCourseRequest = async course => {
  const { code, name, school, lecturer } = course;
  let error = {};
  if (!code) error.code = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
  else {
    const { id, error } = await getCourseDocumentIdWithCode(code);
    if (error) error.course = 'Error retrieving course document id.';
    if (id) error.course = `${ERROR_MESSAGES.COURSE_ALREADY_EXISTS} ${code}.`;
  }
  if (!lecturer) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
  if (!name) error.name = `${ERROR_MESSAGES.MISSING_FIELD} course name.`;
  if (!school) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school.`;

  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateGetMoreCoursesRequest = async startAfter => {
  let error = {};
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;

  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateGetCourseByCodeRequest = async courseCode => {
  let error = {};
  if (!courseCode) error.code = `${ERROR_MESSAGES.MISSING_FIELD} code.`;
  else {
    const { id, error } = await getCourseDocumentIdWithCode(courseCode);
    if (error) {
      error.course = 'Error retrieving course document id.';
    }
    if (!id) {
      error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${courseCode}.`;
    }
  }
};

exports.validateGetMoreCoursesByNameRequest = (name, startAfter) => {
  let error = {};
  if (!name) error.name = `${ERROR_MESSAGES.MISSING_FIELD} course name.`;
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return { error, valid: Object.keys(error).length === 0 };
};

exports.validateUpdateCourseRequest = async (course) => {
  let error = {};
  if (!course) error.course = `${ERROR_MESSAGES.MISSING_FIELD} course.`;
  const { courseCode } = course;
  if (!courseCode) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode`;
  else {
    const { id, error } = await getCourseDocumentIdWithCode(courseCode);
    if (error) error.course = 'Error retrieving course document id';
    if (!id) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS} ${courseCode}`;
  }
};

exports.validateCourseSubscriptionRequest = (email, courses) => {
  let error = {};
  if (!email) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  if (!courses) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  return { error, valid: Object.keys(error).length === 0 };
};
