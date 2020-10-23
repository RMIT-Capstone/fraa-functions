const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');

// routes
const COURSES_ROUTES = require('./utils/routes/courses');
const ATTENDANCE_SESSIONS_ROUTES = require('./utils/routes/attendance-sessions');
const USERS_ROUTES = require('./utils/routes/users');

// handlers
// user handlers
const {
  onCreateUser,
  verifyOTP,
  generateOTP,
  signIn,
  changeUserPassword,
  getUserByEmail
} = require('./handlers/users/https');

// course handlers
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

// attendance session handlers
const {
  createAttendanceSession,
  getAttendanceSessionsInDateRange,
  getAttendanceSessionsInMonthRange,
  getDailyAttendanceSessions,
  getMonthlyAttendanceSessions,
  registerStudentToAttendanceSession
} = require('./handlers/attendance-sessions/https');

//middlewares
const coursesValidator = require('./utils/middlewares/courses');
const attendanceSessionsValidator = require('./utils/middlewares/attendance-sessions');
const usersValidator = require('./utils/middlewares/users');

app.use(cors());

//TODO: check auth headers when doing CRUD operations

// attendance session handlers
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.CREATE_ATTENDANCE_SESSION}`,
  attendanceSessionsValidator,
  createAttendanceSession
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE}`,
  attendanceSessionsValidator,
  getAttendanceSessionsInDateRange
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_ATTENDANCE_SESSIONS_IN_MONTH_RANGE}`,
  attendanceSessionsValidator,
  getAttendanceSessionsInMonthRange,
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_DAILY_ATTENDANCE_SESSION}`,
  attendanceSessionsValidator,
  getDailyAttendanceSessions
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.GET_MONTHLY_ATTENDANCE_SESSIONS}`,
  attendanceSessionsValidator,
  getMonthlyAttendanceSessions
);
app.post(`/${ATTENDANCE_SESSIONS_ROUTES.REGISTER_STUDENT_TO_ATTENDANCE_SESSION}`,
  attendanceSessionsValidator,
  registerStudentToAttendanceSession
);

//courses-helpers
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
app.post(`/${USERS_ROUTES.GET_USER}`, usersValidator, getUserByEmail);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
