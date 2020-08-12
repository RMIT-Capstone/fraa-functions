const {courseAlreadyExist} = require('../helper');
const {db} = require('../../../utils/admin');

exports.createCourse = async (req, res) => {
  const course = req.body.course;
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
