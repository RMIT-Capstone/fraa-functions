const {userDocumentExists} = require('../../users/helper');
const {db} = require('../../../utils/admin');

exports.courseAlreadyExist = async courseCode => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', courseCode)
      .get();

    return !querySnapshot.empty;
  }
  catch (errorCourseAlreadyExist) {
    console.error(errorCourseAlreadyExist.message);
    return null;
  }
};

exports.getCourseDocumentIdByCode = async courseCode => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', courseCode)
      .get();

    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].id;
  }
  catch (errorGetCourseDocumentId) {
    console.error(errorGetCourseDocumentId.message);
    return null;
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
