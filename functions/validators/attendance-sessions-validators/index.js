const { db } = require('../../utils/admin');
const { stringIsEmpty } = require('../../helpers/utilities-helpers');
const { courseExistsWithDocumentId } = require('../../helpers/courses-helpers');
const ERROR_MESSAGES = require('../../handlers/constants/ErrorMessages');

// eslint-disable-next-line max-len
const validateCreateAttendanceSessionRequest = async (courseId, courseCode, courseName, lecturer, location, semester, validOn, expireOn) => {
  let error = {};
  if (stringIsEmpty(courseId)) error.courseId = `${ERROR_MESSAGES.MISSING_FIELD} courseId`;
  else if (stringIsEmpty(courseCode)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courseCode.`;
  else if (stringIsEmpty(courseName)) error.courseName = `${ERROR_MESSAGES.MISSING_FIELD} courseName.`;
  else if (stringIsEmpty(lecturer)) error.lecturer = `${ERROR_MESSAGES.MISSING_FIELD} lecturer.`;
  else if (stringIsEmpty(location)) error.location = `${ERROR_MESSAGES.MISSING_FIELD} location.`;
  else if (stringIsEmpty(semester)) error.semester = `${ERROR_MESSAGES.MISSING_FIELD} semester.`;
  else if (stringIsEmpty(validOn)) error.validOn = `${ERROR_MESSAGES.MISSING_FIELD} validOn.`;
  else {
    const { courseExistsWithDocId, courseExistsWithDocIdError } = await courseExistsWithDocumentId(courseId);
    if (courseExistsWithDocIdError) error.course = 'Error checking course exists.';
    if (!courseExistsWithDocId) error.course = `${ERROR_MESSAGES.COURSE_DOES_NOT_EXISTS_WITH_ID} ${courseId}.`;
    else {
      let sessions = [];
      const start = new Date(validOn).setHours(0, 0, 0, 0);
      const end = new Date(validOn).setHours(23, 59, 59, 999);
      const querySnapshot = await db
        .collection('attendance-sessions')
        .where('courseCode', '==', courseCode)
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
  if (stringIsEmpty(expireOn)) error.expireOn = `${ERROR_MESSAGES.MISSING_FIELD} expireOn.`;

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAttendanceSessionsInDateRangeRequest = (courses, startTime, endTime) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courseCode = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (stringIsEmpty(startTime)) error.startTime = `${ERROR_MESSAGES.MISSING_FIELD} startTime.`;
  if (stringIsEmpty(endTime)) error.endTime = `${ERROR_MESSAGES.MISSING_FIELD} endTime.`;
  if (startTime > endTime) error.time = 'Start time must be sooner than end time.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetAttendanceSessionsInMonthRangeRequest = (courses, startMonth, monthRange) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courses = `${ERROR_MESSAGES.MISSING_FIELD} courses.`;
  if (startMonth <= 0 || startMonth > 11) error.startMonth = `startMonth must be between 1 and 11`;
  if (monthRange <= 0 || monthRange > 6) {
    error.monthRange = 'monthRange must be at least 1 and maximum 6.';
  }
  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetDailyAttendanceSessionsRequest = (courses) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courses = 'Must include courses.';

  return { error, valid: Object.keys(error).length === 0 };
};

const validateGetMonthlyAttendanceSessionsRequest = (courses, month) => {
  let error = {};
  if (!courses || !Array.isArray(courses)) error.courses = 'Must include courses.';
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
