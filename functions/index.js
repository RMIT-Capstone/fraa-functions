const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');

// routes
const COURSES_ROUTES = require('./routes/courses');
const ATTENDANCE_SESSIONS_ROUTES = require('./routes/attendance-sessions');
const USERS_ROUTES = require('./routes/users');

// handlers
const {
  onCreateUser,
  verifyOTP,
  generateOTP,
  signIn,
  changeUserPassword
} = require('./handlers/users/https');

const {
  createCourse,
  getCourses,
  getMoreCourses,
  getCourseByCode,
  getCoursesByName,
  getMoreCoursesByName,
  updateCourse,
  deleteCourse,
  subscribeUserToCourses,
  unsubscribeStudentFromCourses
} = require('./handlers/courses/https');

const {
  createAttendanceSession,
  getAttendanceSessionsByCourseCode,
  getMoreAttendanceSessionsByCourseCode,
  getAttendanceSessionsInDateRangeWithCourseCode,
  getTodayAttendanceSessionsByCourseCode,
  registerStudentToAttendanceSession
} = require('./handlers/attendance-sessions/https');

//middlewares
const coursesValidator = require('./utils/middlewares/courses');
const attendanceSessionsValidator = require('./utils/middlewares/attendance-sessions');
const usersValidator = require('./utils/middlewares/users');

app.use(cors());

//TODO: check auth headers when doing CRUD operations
//TODO: check missing fields in request headers

// attendance session handlers
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION}`,
  attendanceSessionsValidator,
  createAttendanceSession
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_BY_COURSE_CODE}`,
  attendanceSessionsValidator,
  getAttendanceSessionsByCourseCode
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_MORE_ATTENDANCE_SESSIONS_BY_COURSE_CODE}`,
  attendanceSessionsValidator,
  getMoreAttendanceSessionsByCourseCode
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE}`,
  attendanceSessionsValidator,
  getAttendanceSessionsInDateRangeWithCourseCode
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_TODAY_ATTENDANCE_SESSIONS}`,
  attendanceSessionsValidator,
  getTodayAttendanceSessionsByCourseCode
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.REGISTER_STUDENT_TO_ATTENDANCE_SESSION}`,
  attendanceSessionsValidator,
  registerStudentToAttendanceSession
);

//courses
app.post(`/${COURSES_ROUTES.CREATE_COURSE}`, coursesValidator, createCourse);
app.post(`/${COURSES_ROUTES.GET_COURSES}`, getCourses);
app.post(`/${COURSES_ROUTES.GET_MORE_COURSES}`, coursesValidator, getMoreCourses);
app.post(`/${COURSES_ROUTES.GET_COURSES_BY_NAME}`, coursesValidator, getCoursesByName);
app.post(`/${COURSES_ROUTES.GET_MORE_COURSES_BY_NAME}`, coursesValidator, getMoreCoursesByName);
app.post(`/${COURSES_ROUTES.GET_COURSE_BY_CODE}`, coursesValidator, getCourseByCode);
app.post(`/${COURSES_ROUTES.UPDATE_COURSE}`, coursesValidator, updateCourse);
app.post(`/${COURSES_ROUTES.DELETE_COURSE}`, coursesValidator, deleteCourse);
app.post(`/${COURSES_ROUTES.SUBSCRIBE_COURSES}`, coursesValidator, subscribeUserToCourses);
app.post(`/${COURSES_ROUTES.UNSUBSCRIBE_COURSES}`, coursesValidator, unsubscribeStudentFromCourses);

// user handlers
app.post(`/${USERS_ROUTES.CREATE_USER}`, usersValidator, onCreateUser);
app.post(`/${USERS_ROUTES.CREATE_LECTURER}`, usersValidator, onCreateUser);
app.post(`/${USERS_ROUTES.SIGN_IN}`, usersValidator, signIn);
app.post(`/${USERS_ROUTES.CHANGE_PASSWORD}`, usersValidator, changeUserPassword);
app.post(`/${USERS_ROUTES.GENERATE_OTP}`, usersValidator, generateOTP);
app.post(`/${USERS_ROUTES.VERIFY_OTP}`, usersValidator, verifyOTP);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
