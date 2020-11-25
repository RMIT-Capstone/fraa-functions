const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const compression = require('compression');

app.use(cors());
app.use(compression());

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
  getUserByEmail,
  countUserMissedAttendanceSessionsByCoursesAndSemester,
  countUserTotalAttendanceSessionsByCoursesAndSemester,
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

// background functions
const { onUserDeleteInAuth } = require('./handlers/users/background');

//middlewares
const coursesValidator = require('./utils/middlewares/courses');
const attendanceSessionsValidator = require('./utils/middlewares/attendance-sessions');
const usersValidator = require('./utils/middlewares/users');

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

// courses-helpers
app.post(`/${COURSES_ROUTES.CREATE_COURSE}`, coursesValidator, createCourse);
app.post(`/${COURSES_ROUTES.GET_COURSES}`, getCourses);
app.post(`/${COURSES_ROUTES.GET_MORE_COURSES}`, coursesValidator, getMoreCourses);
app.post(`/${COURSES_ROUTES.GET_COURSES_BY_NAME}`, coursesValidator, getCoursesByName);
app.post(`/${COURSES_ROUTES.GET_MORE_COURSES_BY_NAME}`, coursesValidator, getMoreCoursesByName);
app.post(`/${COURSES_ROUTES.GET_COURSE_BY_CODE}`, coursesValidator, getCourseByCode);
app.post(`/${COURSES_ROUTES.UPDATE_COURSE}`, coursesValidator, updateCourse);
app.post(`/${COURSES_ROUTES.DELETE_COURSE}`, coursesValidator, deleteCourse);

// user handlers
app.post(`/${USERS_ROUTES.CREATE_USER}`, usersValidator, onCreateUser);
app.post(`/${USERS_ROUTES.SIGN_IN}`, usersValidator, signIn);
app.post(`/${USERS_ROUTES.CHANGE_PASSWORD}`, usersValidator, changeUserPassword);
app.post(`/${USERS_ROUTES.GENERATE_OTP}`, usersValidator, generateOTP);
app.post(`/${USERS_ROUTES.VERIFY_OTP}`, usersValidator, verifyOTP);
app.post(`/${USERS_ROUTES.GET_USER_BY_EMAIL}`, usersValidator, getUserByEmail);
app.post(`/${USERS_ROUTES.SUBSCRIBE_TO_COURSES}`, usersValidator, subscribeUserToCourses);
app.post(`/${USERS_ROUTES.UNSUBSCRIBE_FROM_COURSES}`, usersValidator, unsubscribeStudentFromCourses);
app.post(`/${USERS_ROUTES.REGISTER_TO_ATTENDANCE_SESSION}`, usersValidator, registerStudentToAttendanceSession);
app.post(`/${USERS_ROUTES.COUNT_MISSED_EVENTS}`, usersValidator, countUserMissedAttendanceSessionsByCoursesAndSemester);
app.post(`/${USERS_ROUTES.COUNT_TOTAL_EVENTS}`, usersValidator, countUserTotalAttendanceSessionsByCoursesAndSemester);

// user background functions
exports.onUserDeleteInAuth = functions.region('asia-northeast1').auth.user().onDelete(onUserDeleteInAuth);

// api
exports.api = functions.region('asia-northeast1').https.onRequest(app);
