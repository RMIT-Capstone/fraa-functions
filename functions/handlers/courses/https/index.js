const {getUserDocumentIdByEmail, userDocumentExistsWithEmail} = require('../../users/helper');
const {getCourseDocumentIdByCode} = require('../helper');
const {courseAlreadyExist, userAlreadySubscribedToCourse} = require('../helper');
const {db, admin} = require('../../../utils/admin');

exports.createCourse = async (req, res) => {
  const {course} = req.body;
  const courseExisted = await courseAlreadyExist(course.code);
  if (courseExisted) return res.json({error: 'Course already exists'});
  else {
    try {
      await db
        .collection('courses')
        .add(course);
      return res.json({message: 'Course created'});
    }
    catch (errorCreateCourse) {
      return res.json({error: 'Something went wrong. Try again'});
    }
  }
};

exports.subscribeUserToCourses = async (req, res) => {
  const {courses, email} = req.body;
  const userExists = await userDocumentExistsWithEmail(email);
  if (!userExists) return res.json({error: 'User does not exist'});
  const userDocId = await getUserDocumentIdByEmail(email);
  try {
    // use allSettled to avoid one rejection failing the whole thing and run promises in parallel
    // https://stackoverflow.com/questions/35612428/call-async-await-functions-in-parallel
    await Promise.allSettled(courses.map(async course => {
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
    await Promise.allSettled(courses.map(async course => {
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
      }
      else {
        console.log(`Course with code: ${course} does not exist`);
      }
    }));
    return res.json({message: 'User unsubscribed to course(s)'});
  }
  catch (errorUnsubscribeUserFromCourses) {
    console.error(errorUnsubscribeUserFromCourses.message);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};
