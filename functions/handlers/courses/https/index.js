const {getUserDocumentIdWithEmail} = require('../../../utils/middlewares/users/helper');
const {
  userAlreadySubscribedToCourse,
  getCourseDocumentIdWithCode
} = require('../../../utils/middlewares/courses/helper');
const {db, admin} = require('../../../utils/admin');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');

exports.createCourse = async (req, res) => {
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');
  course.createdAt = new Date();
  try {
    await db
      .collection('courses')
      .add(course);
    return res.json({success: 'Course created.'});
  }
  catch (errorCreateCourse) {
    console.error('Something went wrong with create course: ', errorCreateCourse);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = [];
    const querySnapshot = await db
      .collection('courses')
      .orderBy('code')
      .limit(5)
      .get();
    querySnapshot.forEach(snap => {
      const data = snap.data();
      data.createdAt = data.createdAt.toDate();
      courses.push(data);
    });
    return res.json({courses});
  }
  catch (errorGetCourses) {
    console.error('Something went wrong with get courses: ', errorGetCourses);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getMoreCourses = async (req, res) => {
  const {startAfter} = req.body;
  const courses = [];
  try {
    const querySnapshot = await db
      .collection('courses')
      .orderBy('code')
      .startAfter(startAfter)
      .limit(5)
      .get();

    querySnapshot.forEach(snap => {
      courses.push(snap.data());
    });
    return res.json({courses});
  }
  catch (errorGetMoreCourses) {
    console.error('Something went wrong with get more courses: ', errorGetMoreCourses);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getCourseByCode = async (req, res) => {
  const {code} = req.body;
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .limit(1)
      .get();
    const course = querySnapshot.docs[0].data();

    return res.json({course});
  }
  catch (errorGetCourseByCode) {
    console.error('Something went wrong with get course by code: ', errorGetCourseByCode);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getCoursesByName = async (req, res) => {
  const {name} = req.body;
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('name', 'array-contains', name.toLowerCase())
      .orderBy('code')
      .limit(20)
      .get();

    const courses = [];
    querySnapshot.forEach(snapshot => {
      courses.push(snapshot.data());
    });
    return res.json({courses});
  }
  catch (errorGetCourseByName) {
    console.error('Something went wrong with get course by name: ', errorGetCourseByName);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getMoreCoursesByName = async (req, res) => {
  const {name, startAfter} = req.body;
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('name', 'array-contains', name.toLowerCase())
      .orderBy('code')
      .startAfter(startAfter)
      .limit(20)
      .get();

    const courses = [];
    querySnapshot.forEach(snapshot => {
      courses.push(snapshot.data());
    });
    return res.json({courses});
  }
  catch (errorGetMoreCoursesByName) {
    console.error('Something went wrong with get more courses by name: ', errorGetMoreCoursesByName);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.updateCourse = async (req, res) => {
  // very important thing to note is that course code cannot be updated
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');
  try {
    const courseExistsWithCode = await getCourseDocumentIdWithCode(course.code);
    await db
      .collection('courses')
      .doc(courseExistsWithCode.id)
      .update(course);
    return res.json({success: 'Course updated.'});
  }
  catch (errorUpdateCourse) {
    console.error('Something went wrong with update course: ', errorUpdateCourse);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.deleteCourse = async (req, res) => {
  const {code} = req.body;
  try {
    const {id} = await getCourseDocumentIdWithCode(code);
    await db
      .collection('courses')
      .doc(id)
      .delete();
    return res.json({success: 'Course deleted.'});
  }
  catch (errorDeleteCourse) {
    console.error('Something went wrong with delete course: ', errorDeleteCourse);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.subscribeUserToCourses = async (req, res) => {
  const {courses, email} = req.body;
  const {id: userDocId} = await getUserDocumentIdWithEmail(email);
  try {
    // https://stackoverflow.com/questions/35612428/call-async-await-functions-in-parallel
    await Promise.all(courses.map(async course => {
      const {exists} = await getCourseDocumentIdWithCode(course);
      if (exists) {
        await db
          .collection('users')
          .doc(userDocId)
          .update({
            subscribedCourses: admin.firestore.FieldValue.arrayUnion(course)
          });
      } else {
        console.log(`Course with code: ${course} does not exist`);
      }
    }));

    return res.json({success: 'User subscribed to course(s).'});
  }
  catch (errorSubscribeUserToCourses) {
    console.error('Something went wrong with subscribe user to courses: ', errorSubscribeUserToCourses);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.unsubscribeStudentFromCourses = async (req, res) => {
  const {courses, email} = req.body;
  const {id: userDocId} = await getUserDocumentIdWithEmail(email);

  try {
    await Promise.all(courses.map(async course => {
      const {exists} = await getCourseDocumentIdWithCode(course);
      if (exists) {
        const {id} = await getCourseDocumentIdWithCode(course);
        const userSubscribedToCourse = await userAlreadySubscribedToCourse(email, id);
        if (userSubscribedToCourse) {
          await db
            .collection('users')
            .doc(userDocId)
            .update({
              subscribedCourses: admin.firestore.FieldValue.arrayRemove(course)
            });
        }
        else {
          console.log(`Student is not subscribed in ${course}`);
        }
      }
      else {
        console.log(`Course with code: ${course} does not exist`);
      }
    }));
    return res.json({success: 'User unsubscribed from course(s).'});
  }
  catch (errorUnsubscribeUserFromCourses) {
    console.error('Something went wrong with unsubscribe user from courses: ', errorUnsubscribeUserFromCourses);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};
