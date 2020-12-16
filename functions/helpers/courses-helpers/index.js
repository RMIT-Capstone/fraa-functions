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

const getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();
    if (!querySnapshot.empty){
      const documentId = querySnapshot.docs[0].id;
      return { courseDocId: documentId };
    }
    else throw new ERROR.MissingObjectError();
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
    if (!subscribedCourses) return { subscribed: false, subscribedError: null };
    return {
      subscribed: subscribedCourses.includes(courseCode),
      subscribedError: null,
    };
  } catch (errorUserAlreadySubscribedToCourse) {
    console.error('Something went wrong with userAlreadySubscribedToCourse: ', errorUserAlreadySubscribedToCourse);
    return { subscribed: null, subscribedError: errorUserAlreadySubscribedToCourse };
  }
};



module.exports = {
  courseExistsWithDocumentId,
  getCourseDocumentIdWithCode,
  studentAlreadySubscribedToCourses,
};
