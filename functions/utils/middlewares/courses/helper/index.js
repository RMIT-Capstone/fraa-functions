const {userDocumentExists} = require('../../users/helper');
const {db} = require('../../../admin');

exports.courseAlreadyExistsWithCourseCode = async code => {
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

exports.userAlreadySubscribedToCourse = async (userDocId, courseDocId) => {
  try {
    const userDocExists = await userDocumentExists(userDocId);
    if (!userDocExists) {
      return null;
    }
    const querySnapshot = await db
      .collection('users')
      .doc(userDocId)
      .get();
    const {subscribedCourses} = querySnapshot.data();
    return subscribedCourses.includes(courseDocId);
  }
  catch (errorUserAlreadySubscribedToCourse) {
    console.error(errorUserAlreadySubscribedToCourse.message);
    return null;
  }
};
