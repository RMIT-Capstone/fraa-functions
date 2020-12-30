const { db } = require('../../utils/admin');
const { stringIsEmpty } = require('../../helpers/utilities-helpers');
const { courseExistsWithDocumentId } = require('../../helpers/courses-helpers');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');
const { numberIsEmpty } = require('../../helpers/utilities-helpers');
const { arrayIsMissing } = require('../../helpers/utilities-helpers');
const { objectIsMissing } = require('../../helpers/utilities-helpers');

// eslint-disable-next-line max-len
const validateCreateAttendanceSessionRequest = async (validOn, expireOn, room, location, semester, course) => {
  let error = {};
  if (objectIsMissing(course)) error.course = `${ERROR_MESSAGES.MISSING_FIELD} course`;
  else {
    const { courseId, courseCode, courseName, lecturer } = course;
    if (stringIsEmpty(courseId)) error.courseId = `${ERROR_MESSAGES.MISSING_FIELD} courseId`;
    else if (stringIsEmpty(courseCode)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode`;
    else {
      const { courseExists, errorCheckExists } = await courseExistsWithDocumentId(courseId);
      if (errorCheckExists) error.course = 'Error checking course exists';
      if (!courseExists) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${courseId}`;
      else {
        let sessions = [];
        const start = new Date(validOn).setHours(0, 0, 0, 0);
        const end = new Date(validOn).setHours(23, 59, 59, 999);
        const querySnapshot = await db
          .collection('attendance-sessions')
          .where('course.courseCode', '==', courseCode)
          .get();

        if (!querySnapshot.empty) {
          querySnapshot.forEach(snapshot => {
            sessions.push(snapshot.data());
          });

          const filteredSession = sessions.filter(session => {
            const { validOn } = session;
            return validOn.toDate() > start && validOn.toDate() < end;
          });

          if (filteredSession.length !== 0) {
            error.invalidRequest = 'Cannot have 2 sessions in the same day with the same course.';
          }
        }
      }
    }

    if (stringIsEmpty(courseName)) error.courseName = `${ERROR_MESSAGES.MISSING_FIELD} courseName`;
    if (stringIsEmpty(lecturer)) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer`;
  }
  if (objectIsMissing(location)) error.room = `${ERROR_MESSAGES.MISSING_FIELD} room`;
  else {
    const { altitude, latitude, longitude } = location;
    if (numberIsEmpty(altitude)) error.altitude = `${ERROR_MESSAGES.MISSING_FIELD} altitude in location`;
    if (numberIsEmpty(latitude)) error.latitude = `${ERROR_MESSAGES.MISSING_FIELD} latitude in location`;
    if (numberIsEmpty(longitude)) error.longitude = `${ERROR_MESSAGES.MISSING_FIELD} longitude in location`;
  }
  if (stringIsEmpty(validOn)) error.validOn = `${ERROR_MESSAGES.MISSING_FIELD} validOn`;
  if (stringIsEmpty(expireOn)) error.expireOn = `${ERROR_MESSAGES.MISSING_FIELD} expireOn`;
  if (stringIsEmpty(room)) error.location = `${ERROR_MESSAGES.MISSING_FIELD} location`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAttendanceSessionsInDateRangeRequest = (courses, startTime, endTime) => {
  let error = {};
  if (arrayIsMissing(courses)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (stringIsEmpty(startTime)) error.startTime = `${ERROR_MESSAGES.MISSING_FIELD} startTime.`;
  if (stringIsEmpty(endTime)) error.endTime = `${ERROR_MESSAGES.MISSING_FIELD} endTime.`;
  if (startTime > endTime) error.time = 'Start time must be sooner than end time.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAttendanceSessionsInMonthRangeRequest = (courses, startMonth, monthRange) => {
  let error = {};
  if (arrayIsMissing(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (startMonth <= 0 || startMonth > 11) error.startMonth = `startMonth must be between 1 and 11`;
  if (monthRange <= 0 || monthRange > 6) {
    error.monthRange = 'monthRange must be at least 1 and maximum 6.';
  }
  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetDailyAttendanceSessionsRequest = (courses) => {
  let error = {};
  if (arrayIsMissing(courses)) error.courses = 'Must include courses.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMonthlyAttendanceSessionsRequest = (courses, month) => {
  let error = {};
  if (arrayIsMissing(courses)) error.courses = 'Must include courses.';
  if (!month) error.month = 'Must include month.';
  if (month < 0 || month > 11) error.month = 'Month must be between 0 and 11';

  return { error, valid: Object.keys(error).length === 0 };
};

module.exports = {
  validateCreateAttendanceSessionRequest,
  validateGetAttendanceSessionsInDateRangeRequest,
  validateGetAttendanceSessionsInMonthRangeRequest,
  validateGetDailyAttendanceSessionsRequest,
  validateGetMonthlyAttendanceSessionsRequest,
};
