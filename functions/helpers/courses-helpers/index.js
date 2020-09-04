const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const {db} = require('../../utils/admin');

exports.getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();

    if (querySnapshot.empty) return {exists: false, id: null};
    else {
      const documentId = querySnapshot.docs[0].id;
      return {exists: true, id: documentId};
    }
  }
  catch (errorCourseAlreadyExistsWithCourseCode) {
    console.error(errorCourseAlreadyExistsWithCourseCode);
    return {exists: false, id: null};
  }
};

exports.userAlreadySubscribedToCourse = async (userDocId, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .doc(userDocId)
      .get();
    const {subscribedCourses} = querySnapshot.data();
    return subscribedCourses.includes(courseCode);
  }
  catch (errorUserAlreadySubscribedToCourse) {
    console.error(errorUserAlreadySubscribedToCourse.message);
    return null;
  }
};

exports.validateCreateCourseRequest = course => {
  const {code, name, school, lecturer} = course;
  let error = {};
  if (!code) error.code = `${ERROR_MESSAGES.MISSING_FIELD} course code.`;
  if (!name) error.name = `${ERROR_MESSAGES.MISSING_FIELD} course name.`;
  if (!school) error.school = `${ERROR_MESSAGES.MISSING_FIELD} school.`;
  if (!lecturer) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
  return {error, valid: Object.keys(error).length === 0};
};

exports.validateGetMoreCoursesByNameRequest = (name, startAfter) => {
  let error = {};
  if (!name) error.name = `${ERROR_MESSAGES.MISSING_FIELD} course name.`;
  if (!startAfter) error.startAfter = `${ERROR_MESSAGES.MISSING_FIELD} startAfter.`;
  return {error, valid: Object.keys(error).length === 0};
};

exports.validateCourseSubscriptionRequest = (email, courses) => {
  let error = {};
  if (!email) error.email = `${ERROR_MESSAGES.MISSING_FIELD} email.`;
  if (!courses) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  return {error, valid: Object.keys(error).length === 0};
};
