const { db } = require('../../utils/admin');
const ERROR = require('../../utils/errors');

const courseExistsWithDocumentId = async id => {
  try {
    const documentSnapshot = await db
      .collection('courses')
      .doc(id)
      .get();
    if (!documentSnapshot.exists) return { courseExists: false };
    else return { courseExists: true };
  } catch (errorCourseDocumentExistsWithDocumentId) {
    console.error('Something went wrong with getCourseDocumentIdWithCode: ', errorCourseDocumentExistsWithDocumentId);
    return errorCourseDocumentExistsWithDocumentId;
  }
};

const courseExistsWithCourseCode = async (courseCode) => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', courseCode)
      .get();
    if (!querySnapshot.empty) return { courseExists: true };
    else return { courseExists: false };
  } catch (errorCourseExistsWithCourseCode) {
    console.error('Something went wrong with courseExistsWithCourseCode: ', errorCourseExistsWithCourseCode);
    return errorCourseExistsWithCourseCode;
  }
};

const getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();
    if (querySnapshot.empty) throw new ERROR.NotExisted();
    else {
      const documentId = querySnapshot.docs[0].id;
      return { courseDocId: documentId };
    }
  } catch (errorGetCourseDocumentIdWithCode) {
    console.error('Something went wrong with getCourseDocumentIdWithCode', errorGetCourseDocumentIdWithCode);
    return errorGetCourseDocumentIdWithCode;
  }
};

const studentAlreadySubscribedToCourses = async (userId, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .doc(userId)
      .get();
    const { subscribedCourses } = querySnapshot.data();
    if (!subscribedCourses) return { subscribed: false };
    return { subscribed: subscribedCourses.includes(courseCode) };
  } catch (errorUserAlreadySubscribedToCourse) {
    console.error('Something went wrong with userAlreadySubscribedToCourse: ', errorUserAlreadySubscribedToCourse);
    return errorUserAlreadySubscribedToCourse;
  }
};

const studentAlreadySubscribedToCoursesByEmail = async (email, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where("email", "==", email)
      .get().then( snapshot => {  return snapshot.docs[0] });
    const { subscribedCourses } = querySnapshot.data();
    if (!subscribedCourses) return { subscribed: false };
    return { subscribed: subscribedCourses.includes(courseCode) };
  } catch (errorUserAlreadySubscribedToCourse) {
    console.error('Something went wrong with userAlreadySubscribedToCourse: ', errorUserAlreadySubscribedToCourse);
    return errorUserAlreadySubscribedToCourse;
  }
};

module.exports = {
  courseExistsWithDocumentId,
  courseExistsWithCourseCode,
  getCourseDocumentIdWithCode,
  studentAlreadySubscribedToCourses,
  studentAlreadySubscribedToCoursesByEmail
};
