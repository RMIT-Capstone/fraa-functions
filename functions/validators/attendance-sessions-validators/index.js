const { db } = require('../../utils/admin');
const { courseExistsWithDocumentId, invalidCourseArrayWithCourseCode } = require('../../helpers/courses-helpers');
const { checkSchema } = require("../../schema");
const SCHEMA = require("../../schema");
const ERROR = require("../../utils/errors");

const validateCreateAttendanceSessionRequest = async (validOn, expireOn, location, semester, course) => {
  const validate = checkSchema(SCHEMA.createAttendanceSessionRequest,
    { course, validOn, expireOn, location, semester });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const { courseExists } = await courseExistsWithDocumentId(course.courseId);
  if (!courseExists) throw new ERROR.NotExisted(course.courseId);
  let sessions = [];
  const start = new Date(validOn).setHours(0, 0, 0, 0);
  const end = new Date(validOn).setHours(23, 59, 59, 999);
  const querySnapshot = await db
    .collection('attendance-sessions')
    .where('course.courseCode', '==', course.courseCode)
    .get();
  if (!querySnapshot.empty) {
    querySnapshot.forEach(snapshot => {
      sessions.push(snapshot.data());
    });
    const filteredSession = sessions.filter(session => {
      const { validOn } = session;
      return validOn.toDate() > start && validOn.toDate() < end;
    });
    if (filteredSession.length !== 0) throw new Error('Cannot have 2 sessions in the same day with the same course.');
  }
};

const validateGetAttendanceSessionsInDateRangeRequest = async (courses, startTime, endTime) => {
  const validate = checkSchema(SCHEMA.getAttendanceSessionsInDateRangeRequest, { startTime, endTime, courses });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const invalidCourses = await invalidCourseArrayWithCourseCode(courses);
  if (invalidCourses.length > 0) throw new ERROR.NotExisted(invalidCourses);

};

const validateGetAttendanceSessionsInMonthRangeRequest = async (courses, startMonth, monthRange) => {
  const validate = checkSchema(SCHEMA.getAttendanceSessionsInMonthRangeRequest, { startMonth, monthRange, courses });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const invalidCourses = await invalidCourseArrayWithCourseCode(courses);
  if (invalidCourses.length > 0) throw new ERROR.NotExisted(invalidCourses);
};

const validateGetDailyAttendanceSessionsRequest = async (courses) => {
  const validate = checkSchema(SCHEMA.requiredCoursesArray, { courses });
  if (validate !== null) throw new ERROR.schemaError(validate);
  const invalidCourses = await invalidCourseArrayWithCourseCode(courses);
  console.log('dasd',invalidCourses);
  if (invalidCourses.length > 0) throw new ERROR.NotExisted(invalidCourses);
};

const validateGetMonthlyAttendanceSessionsRequest = async (courses, month) => {
  const validate = checkSchema(SCHEMA.getMonthlyAttendanceSessionsRequest, { month, courses });
  console.log(validate);
  if (validate !== null) throw new ERROR.schemaError(validate);
  const invalidCourses = await invalidCourseArrayWithCourseCode(courses);
  if (invalidCourses.length > 0) throw new ERROR.NotExisted(invalidCourses);
};

module.exports = {
  validateCreateAttendanceSessionRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateGetDailyAttendanceSessionsRequest,
  validateGetMonthlyAttendanceSessionsRequest,
};
