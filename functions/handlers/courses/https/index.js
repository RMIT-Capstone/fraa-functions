const {getUserDocumentIdWithEmail} = require('../../../helpers/users-helpers');
const {getCourseDocumentIdWithCode} = require('../../../helpers/courses-helpers');
const {db, admin} = require('../../../utils/admin');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');
const {sendErrorMessage} = require('../../../helpers/express-helpers');

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
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createCourse: `, errorCreateCourse);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = [];
    const querySnapshot = await db
      .collection('courses')
      .orderBy('code')
      .limit(25)
      .get();
    querySnapshot.forEach(snap => {
      let course = snap.data();
      const {createdAt} = course;
      course.createdAt = createdAt.toDate();
      courses.push(course);
    });
    return res.json({courses});
  }
  catch (errorGetCourses) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getCourses: `, errorGetCourses);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
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
      .limit(25)
      .get();

    querySnapshot.forEach(snap => {
      let course = snap.data();
      const {createdAt} = course;
      course.createdAt = createdAt.toDate();
      courses.push(course);
    });
    return res.json({courses});
  }
  catch (errorGetMoreCourses) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getMoreCourses: `, errorGetMoreCourses);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
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
    let course = querySnapshot.docs[0].data();
    const {createdAt} = course;
    course.createdAt = createdAt.toDate();

    return res.json({course});
  }
  catch (errorGetCourseByCode) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getCourseByCode: `, errorGetCourseByCode);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
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
  catch (errorGetCoursesByName) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getCoursesByName: `, errorGetCoursesByName);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
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
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getMoreCoursesByName: `, errorGetMoreCoursesByName);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.updateCourse = async (req, res) => {
  // very important thing to note is that course code cannot be updated
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');
  try {
    const {id, error} = await getCourseDocumentIdWithCode(course.code);
    if (error) sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    await db
      .collection('courses')
      .doc(id)
      .update(course);
    return res.json({success: 'Course updated.'});
  }
  catch (errorUpdateCourse) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} updateCourse: `, errorUpdateCourse);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.deleteCourse = async (req, res) => {
  const {code} = req.body;
  try {
    const {id, error} = await getCourseDocumentIdWithCode(code);
    if (error) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    await db
      .collection('courses')
      .doc(id)
      .delete();
    return res.json({success: 'Course deleted.'});
  }
  catch (errorDeleteCourse) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} deleteCourse: `, errorDeleteCourse);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.subscribeUserToCourses = async (req, res) => {
  const {courses, email} = req.body;
  const {id: userDocId, error} = await getUserDocumentIdWithEmail(email);
  if (error) return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}.`);
  try {
    // https://stackoverflow.com/questions/35612428/call-async-await-functions-in-parallel
    await Promise.all(courses.map(async course => {
      await db
        .collection('users')
        .doc(userDocId)
        .update({
          subscribedCourses: admin.firestore.FieldValue.arrayUnion(course)
        });
    }));

    return res.json({success: 'User subscribed to course(s).'});
  }
  catch (errorSubscribeUserToCourses) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} subscribeUserToCourses: `,
      errorSubscribeUserToCourses
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.unsubscribeStudentFromCourses = async (req, res) => {
  const {courses, email} = req.body;
  const {id: userDocId, error} = await getUserDocumentIdWithEmail(email);
  if (error) return res.json({error: `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}.`});

  try {
    await Promise.all(courses.map(async course => {
      await db
        .collection('users')
        .doc(userDocId)
        .update({
          subscribedCourses: admin.firestore.FieldValue.arrayRemove(course)
        });

    }));
    return res.json({success: 'User unsubscribed from course(s).'});
  }
  catch (errorUnsubscribeUserFromCourses) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE}`,
      errorUnsubscribeUserFromCourses
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};
