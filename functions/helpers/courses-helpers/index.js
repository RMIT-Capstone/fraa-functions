const { db } = require('../../utils/admin');

const courseExistsWithDocumentId = async id => {
  try {
    const documentSnapshot = await db
      .collection('courses')
      .doc(id)
      .get();
    if (documentSnapshot.exists) {
      return { courseExists: true, errorCheckExists: null };
    }
    return { courseExists: false, errorCheckExists: null };
  } catch (errorCourseExistsWithDocumentId) {
    console.error('Something went wrong with getCourseDocumentIdWithCode: ', errorCourseExistsWithDocumentId);
    return { courseExists: null, errorCheckExists: errorCourseExistsWithDocumentId };
  }
};

const courseExistsWithCourseCode = async (courseCode) => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', courseCode)
      .get();

    if (querySnapshot.empty) {
      return { courseExists: false, errorCheckExists: null };
    }
    return { courseExists: true, errorCheckExists: null };
  } catch (errorCourseExistsWithCourseCode) {
    console.error('Something went wrong with courseExistsWithCourseCode: ', errorCourseExistsWithCourseCode);
    return { courseExists: null, errorCheckExists: null };
  }
};

const getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();

    if (querySnapshot.empty) return { courseDocId: null, courseDocIdError: null };
    else {
      const documentId = querySnapshot.docs[0].id;
      return { courseDocId: documentId, courseDocIdError: null };
    }
  } catch (errorGetCourseDocumentIdWithCode) {
    console.error('Something went wrong with getCourseDocumentIdWithCode', errorGetCourseDocumentIdWithCode);
    return { courseDocId: null, courseDocIdError: errorGetCourseDocumentIdWithCode };
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
  courseExistsWithCourseCode,
  getCourseDocumentIdWithCode,
  studentAlreadySubscribedToCourses,
};
