const {db} = require('../../../admin');

exports.getCourseDocumentIdWithCode = async code => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .get();

    if (querySnapshot.empty) {
      return {exists: false, id: null};
    }
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
