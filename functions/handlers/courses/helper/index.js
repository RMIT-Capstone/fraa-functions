const {db} = require('../../../utils/admin');

exports.courseAlreadyExist = async courseCode => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', courseCode)
      .get();

    return querySnapshot.size > 0;
  }
  catch (errorCourseAlreadyExist) {
    console.error(errorCourseAlreadyExist.message);
    return null;
  }
};
