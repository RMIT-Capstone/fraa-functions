const { db } = require('../../utils/admin');

const courseExistsWithDocumentId = async id => {
  try {
    const documentSnapshot = await db
      .collection('courses')
      .doc(id)
      .get();
    if (documentSnapshot.exists) {
      return { courseExistsWithDocId: true, courseExistsWithDocIdError: null };
    }
    return { courseExistsWithDocId: false, courseExistsWithDocIdError: null };
  } catch (errorCourseDocumentExistsWithDocumentId) {
    console.error('Something went wrong with getCourseDocumentIdWithCode: ', errorCourseDocumentExistsWithDocumentId);
    return { courseExistsWithDocId: null, courseExistsWithDocIdError: errorCourseDocumentExistsWithDocumentId };
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

const studentAlreadySubscribedToCourses = async (userDocId, courseCode) => {
  try {
    const querySnapshot = await db
      .collection('students')
      .doc(userDocId)
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
