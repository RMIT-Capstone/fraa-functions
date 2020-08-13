const {getUserDocumentIdByEmail, userDocumentExistsWithEmail} = require('../../users/helper');
const {getCourseDocumentIdByCode} = require('../helper');
const {courseAlreadyExist, userAlreadySubscribedToCourse} = require('../helper');
const {db, admin} = require('../../../utils/admin');

exports.createCourse = async (req, res) => {
  const {course} = req.body;
  const courseExisted = await courseAlreadyExist(course.code);
  if (courseExisted) return res.json({error: `Course with code: ${course.code} already exists`});
  else {
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
  }
};

exports.updateCourse = async (req, res) => {
  const {course} = req.body;
  const courseExisted = await courseAlreadyExist(course.code);
  if (!courseExisted) return res.json({error: `Course with code: ${course.code} does not exist`});
  else {
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

exports.subscribeUserToCourses = async (req, res) => {
  const {courses, email} = req.body;
  const userExists = await userDocumentExistsWithEmail(email);
  if (!userExists) return res.json({error: 'User does not exist'});
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
  const userExists = await userDocumentExistsWithEmail(email);
  if (!userExists) return res.json({error: 'User does not exist'});
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
