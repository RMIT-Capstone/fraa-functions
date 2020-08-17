const {getUserDocumentIdByEmail} = require('../../users/helper');
const {getCourseDocumentIdByCode} = require('../helper');
const {courseAlreadyExist, userAlreadySubscribedToCourse} = require('../helper');
const {db, admin} = require('../../../utils/admin');

exports.createCourse = async (req, res) => {
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');

  try {
    await db
      .collection('courses')
      .add(course);
    return res.json({message: 'Course created'});
  }
  catch (errorCreateCourse) {
    console.error(errorCreateCourse.message);
    return res.json({error: 'Something went wrong. Try again'});
  }
};

exports.updateCourse = async (req, res) => {
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');

  try {
    const courseDocId = await getCourseDocumentIdByCode(course.code);
    await db
      .collection('courses')
      .doc(courseDocId)
      .update(course);
    return res.json({message: 'Course updated'});
  }
  catch (errorUpdateCourse) {
    console.error(errorUpdateCourse.message);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.deleteCourse = async (req, res) => {
  const {course} = req.body;
  const courseExisted = await courseAlreadyExist(course.code);
  if (!courseExisted) return res.json({error: `Course with code: ${course.code} does not exist`});
  else {
    try {
      const courseDocId = await getCourseDocumentIdByCode(course.code);
      await db
        .collection('courses')
        .doc(courseDocId)
        .delete();
      return res.json({message: 'Course deleted'});
    }
    catch (errorDeleteCourse) {
      console.error(errorDeleteCourse.message);
      return res.json({error: 'Something went wrong. Try again.'});
    }
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
      courses.push(snap.data());
    });
    return res.json({courses});
  }
  catch (errorGetAllCourses) {
    console.error(errorGetAllCourses.message);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.getMoreCourses = async (req, res) => {
  const courses = [];
  try {
    const querySnapshot = await db
      .collection('courses')
      .orderBy('code')
      .startAfter(startAt)
      .limit(5)
      .get();

    querySnapshot.forEach(snap => {
      courses.push(snap.data());
    });
    return res.json({courses});
  }
  catch (errorGetMoreCourses) {
    console.error(errorGetMoreCourses.message);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.getCourseByCode = async (req, res) => {
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
    console.error(errorGetCourseByCode.message);
    return res.json({error: 'Something went wrong. Try again'});
  }
};

exports.getCoursesByName = async (req, res) => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('name', 'array-contains', name.toLowerCase())
      .orderBy('code')
      .limit(1)
      .get();

    const courses = [];
    querySnapshot.forEach(snapshot => {
      courses.push(snapshot.data());
    });
    return res.json({courses});
  }
  catch (errorGetCourseByName) {
    console.error(errorGetCourseByName);
    return res.json({error: 'Something went wrong. Try again'});
  }
};

exports.getMoreCoursesByName = async (req, res) => {
  try {
    const querySnapshot = await db
      .collection('courses')
      .where('name', 'array-contains', name.toLowerCase())
      .orderBy('code')
      .startAt(startAt)
      .limit(1)
      .get();

    const courses = [];
    querySnapshot.forEach(snapshot => {
      courses.push(snapshot.data());
    });
    return res.json({courses});
  }
  catch (errorGetMoreCoursesByName) {
    console.error(errorGetMoreCoursesByName.message);
    return res.json({error: 'Something went wrong. Try again'});
  }
};

exports.subscribeUserToCourses = async (req, res) => {
  const {courses, email} = req.body;
  const userDocId = await getUserDocumentIdByEmail(email);
  try {
    // Promise.allSettled is not available for current version of Node
    // using all instead
    // https://stackoverflow.com/questions/35612428/call-async-await-functions-in-parallel
    await Promise.all(courses.map(async course => {
      const courseExisted = await courseAlreadyExist(course);
      if (courseExisted) {
        const courseId = await getCourseDocumentIdByCode(course);
        // arrayUnion add element to array and avoid duplicate
        await db
          .collection('users')
          .doc(userDocId)
          .update({
            subscribedCourses: admin.firestore.FieldValue.arrayUnion(courseId)
          });
      } else {
        console.log(`Course with code: ${course} does not exist`);
      }
    }));

    return res.json({message: 'User subscribed to course(s)'});
  }
  catch (errorSubscribeUserToCourses) {
    console.error(errorSubscribeUserToCourses.message);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.unsubscribeStudentFromCourses = async (req, res) => {
  const {courses, email} = req.body;
  const userDocId = await getUserDocumentIdByEmail(email);

  try {
    await Promise.all(courses.map(async course => {
      const courseExisted = await courseAlreadyExist(course);
      if (courseExisted) {
        const courseDocId = await getCourseDocumentIdByCode(course);
        const userSubscribedToCourse = await userAlreadySubscribedToCourse(userDocId, courseDocId);
        if (userSubscribedToCourse) {
          await db
            .collection('users')
            .doc(userDocId)
            .update({
              subscribedCourses: admin.firestore.FieldValue.arrayRemove(courseDocId)
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
    return res.json({message: 'User unsubscribed from course(s)'});
  }
  catch (errorUnsubscribeUserFromCourses) {
    console.error(errorUnsubscribeUserFromCourses.message);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};
