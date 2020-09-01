const {getUserDocumentIdByEmail} = require('../../../utils/middlewares/users/helper');
const {
  userAlreadySubscribedToCourse,
  courseAlreadyExistsWithCourseCode
} = require('../../../utils/middlewares/courses/helper');
const {db, admin} = require('../../../utils/admin');

exports.createCourse = async (req, res) => {
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');
  try {
    await db
      .collection('courses')
      .add(course);
    return res.json({success: 'Course created'});
  }
  catch (errorCreateCourse) {
    console.error('Something went wrong with create course: ', errorCreateCourse);
    return res.json({error: 'Something went wrong. Try again'});
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
  catch (errorGetCourses) {
    console.error('Something went wrong with get courses: ', errorGetCourses);
    return res.json({error: 'Something went wrong. Try again.'});
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
    console.error('Something went wrong with get more courses: ',errorGetMoreCourses);
    return res.json({error: 'Something went wrong. Try again.'});
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
    return res.json({error: 'Something went wrong. Try again'});
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
    return res.json({error: 'Something went wrong. Try again'});
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
    return res.json({error: 'Something went wrong. Try again'});
  }
};

exports.updateCourse = async (req, res) => {
  const {course} = req.body;
  course.name = course.name.toLowerCase().split(' ');
  try {
    const courseExistsWithCode = await courseAlreadyExistsWithCourseCode(course.code);
    await db
      .collection('courses')
      .doc(courseExistsWithCode.id)
      .update(course);
    return res.json({success: 'Course updated'});
  }
  catch (errorUpdateCourse) {
    console.error('Something went wrong with update course: ', errorUpdateCourse);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.deleteCourse = async (req, res) => {
  const {code} = req.body;
  try {
    const {id} = await courseAlreadyExistsWithCourseCode(code);
    await db
      .collection('courses')
      .doc(id)
      .delete();
    return res.json({success: 'Course deleted'});
  }
  catch (errorDeleteCourse) {
    console.error('Something went wrong with delete course: ', errorDeleteCourse);
    return res.json({error: 'Something went wrong. Try again.'});
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
      const {exists} = await courseAlreadyExistsWithCourseCode(course);
      if (exists) {
        const {id} = await courseAlreadyExistsWithCourseCode(course);
        // arrayUnion add element to array and avoid duplicate
        await db
          .collection('users')
          .doc(userDocId)
          .update({
            subscribedCourses: admin.firestore.FieldValue.arrayUnion(id)
          });
      } else {
        console.log(`Course with code: ${course} does not exist`);
      }
    }));

    return res.json({success: 'User subscribed to course(s)'});
  }
  catch (errorSubscribeUserToCourses) {
    console.error('Something went wrong with subscribe user to courses: ', errorSubscribeUserToCourses);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.unsubscribeStudentFromCourses = async (req, res) => {
  const {courses, email} = req.body;
  const userDocId = await getUserDocumentIdByEmail(email);

  try {
    await Promise.all(courses.map(async course => {
      const {exists} = await courseAlreadyExistsWithCourseCode(course);
      if (exists) {
        const {id} = await courseAlreadyExistsWithCourseCode(course);
        const userSubscribedToCourse = await userAlreadySubscribedToCourse(userDocId, id);
        if (userSubscribedToCourse) {
          await db
            .collection('users')
            .doc(userDocId)
            .update({
              subscribedCourses: admin.firestore.FieldValue.arrayRemove(id)
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
    return res.json({success: 'User unsubscribed from course(s)'});
  }
  catch (errorUnsubscribeUserFromCourses) {
    console.error('Sonmething went wrong with unsubscribe user from courses: ', errorUnsubscribeUserFromCourses);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};
