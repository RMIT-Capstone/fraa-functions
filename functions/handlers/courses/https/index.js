const { db, admin } = require('../../../utils/admin');
const { sendErrorMessage } = require('../../../helpers/express-helpers');
const { sendSuccessMessage } = require('../../../helpers/express-helpers');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');

exports.createCourse = async (req, res) => {
  const { course } = req.body;
  course.name = course.name.toLowerCase().split(' ');
  course.createdAt = new Date();
  try {
    const docRef = await db
      .collection('courses')
      .add(course);
    course.id = docRef.id;
    return res.json(course);
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
      const id = snap.id;
      const { createdAt } = course;
      course.createdAt = createdAt.toDate();
      course.id = id;
      courses.push(course);
    });
    return res.json({ courses });
  }
  catch (errorGetCourses) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getCourses: `, errorGetCourses);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getMoreCourses = async (req, res) => {
  const { startAfter } = req.body;
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
      const id = snap.id;
      const { createdAt } = course;
      course.createdAt = createdAt.toDate();
      course.id = id;
      courses.push(course);
    });
    return res.json({ courses });
  }
  catch (errorGetMoreCourses) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getMoreCourses: `, errorGetMoreCourses);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getCourseByCode = async (req, res) => {
  const { code } = req.body;
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('code', '==', code)
      .limit(1)
      .get();
    let course = querySnapshot.docs[0].data();
    const { createdAt } = course;
    course.createdAt = createdAt.toDate();
    course.id = querySnapshot.docs[0].id;

    return res.json({ course });
  }
  catch (errorGetCourseByCode) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getCourseByCode: `, errorGetCourseByCode);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getCoursesByName = async (req, res) => {
  const { name } = req.body;
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
    return res.json({ courses });
  }
  catch (errorGetCoursesByName) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getCoursesByName: `, errorGetCoursesByName);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getMoreCoursesByName = async (req, res) => {
  const { name, startAfter } = req.body;
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
    return res.json({ courses });
  }
  catch (errorGetMoreCoursesByName) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getMoreCoursesByName: `, errorGetMoreCoursesByName);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.updateCourse = async (req, res) => {
  // very important thing to note is that course code cannot be updated
  const { course, course: { name, id } } = req.body;
  delete course.id;
  if (name) {
    course.name = course.name.toLowerCase().split(' ');
  }
  try {
    await db
      .collection('courses')
      .doc(id)
      .update(course);
    return res.json({ success: 'Course updated.' });
  }
  catch (errorUpdateCourse) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} updateCourse: `, errorUpdateCourse);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.body;
  try {
    await db
      .collection('courses')
      .doc(id)
      .delete();
    return res.json({ success: 'Course deleted.' });
  }
  catch (errorDeleteCourse) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} deleteCourse: `, errorDeleteCourse);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.subscribeUserToCourses = async (req, res) => {
  const { courses, userId } = req.body;
  try {
    // https://stackoverflow.com/questions/35612428/call-async-await-functions-in-parallel
    await Promise.all(courses.map(async course => {
      await db
        .collection('users')
        .doc(userId)
        .update({
          subscribedCourses: admin.firestore.FieldValue.arrayUnion(course),
        });
    }));

    return sendSuccessMessage(res, 'Student subscribed to course(s).');
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
  const { courses, userId } = req.body;
  try {
    await Promise.all(courses.map(async course => {
      await db
        .collection('users')
        .doc(userId)
        .update({
          subscribedCourses: admin.firestore.FieldValue.arrayRemove(course),
        });

    }));
    return res.json({ success: 'Student unsubscribed from course(s).' });
  }
  catch (errorUnsubscribeUserFromCourses) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE}`,
      errorUnsubscribeUserFromCourses
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};
