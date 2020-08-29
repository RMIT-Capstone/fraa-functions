const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');

// routes
const COURSE_ROUTES = require('./routes/courses');
const ATTENDANCE_SESSION_ROUTES = require('./routes/attendance-session');

// handlers
const {createUserInFirestore, deleteUserInFirestore} = require('./handlers/users/background');
const {verifyOTP, generateOTP, signIn, createUserInAuth, changeUserPassword} = require('./handlers/users/https');
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
  getTodayAttendanceSessionsByCourseCode
} = require('./handlers/attendance-sessions/https');

//middlewares
const courseValidator = require('./utils/middlewares/courses');
const attendanceSessionValidator = require('./utils/middlewares/attendance-sessions');

app.use(cors());

//TODO: check request parameters for users
//TODO: check auth headers when doing CRUD operations

// attendance session handlers
app.post(`/${ATTENDANCE_SESSION_ROUTES.CREATE_ATTENDANCE_SESSION}`,
  attendanceSessionValidator,
  createAttendanceSession
);
app.post(`/${ATTENDANCE_SESSION_ROUTES.GET_ATTENDANCE_SESSIONS_BY_COURSE_CODE}`,
  attendanceSessionValidator,
  getAttendanceSessionsByCourseCode
);
app.post(`/${ATTENDANCE_SESSION_ROUTES.GET_MORE_ATTENDANCE_SESSIONS_BY_COURSE_CODE}`,
  attendanceSessionValidator,
  getMoreAttendanceSessionsByCourseCode
);
app.post(`/${ATTENDANCE_SESSION_ROUTES.GET_ATTENDANCE_SESSIONS_IN_DATE_RANGE}`,
  attendanceSessionValidator,
  getAttendanceSessionsInDateRangeWithCourseCode
);
app.post(`/${ATTENDANCE_SESSION_ROUTES.GET_TODAY_ATTENDANCE_SESSIONS}`,
  attendanceSessionValidator,
  getTodayAttendanceSessionsByCourseCode
);

//courses
app.post(`/${COURSE_ROUTES.CREATE_COURSE}`, courseValidator, createCourse);
app.post(`/${COURSE_ROUTES.GET_COURSES}`, getCourses);
app.post(`/${COURSE_ROUTES.GET_MORE_COURSES}`, courseValidator, getMoreCourses);
app.post(`/${COURSE_ROUTES.GET_COURSES_BY_NAME}`, courseValidator, getCoursesByName);
app.post(`/${COURSE_ROUTES.GET_MORE_COURSES_BY_NAME}`, courseValidator, getMoreCoursesByName);
app.post(`/${COURSE_ROUTES.GET_COURSE_BY_CODE}`, courseValidator, getCourseByCode);
app.post(`/${COURSE_ROUTES.UPDATE_COURSE}`, courseValidator, updateCourse);
app.post(`/${COURSE_ROUTES.DELETE_COURSE}`, courseValidator, deleteCourse);
app.post(`/${COURSE_ROUTES.SUBSCRIBE_COURSES}`, courseValidator, subscribeUserToCourses);
app.post(`/${COURSE_ROUTES.UNSUBSCRIBE_COURSES}`, courseValidator, unsubscribeStudentFromCourses);

// user handlers
app.post('/create_user', createUserInFirestore);
app.post('/sign_in', signIn);
app.post('/generate_OTP', generateOTP);
app.post('/verify_OTP', verifyOTP);
app.post('/change_user_password', changeUserPassword);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
exports.onUserCreatedInAuth = functions.region('asia-northeast1').auth.user().onCreate(createUserInFirestore);
exports.onUserDeletedInAuth = functions.region('asia-northeast1').auth.user().onDelete(deleteUserInFirestore);

exports.onUserCreatedInFirestore = functions
  .region('asia-northeast1')
  .firestore
  .document('users/{userId}')
  .onCreate(snapshot =>  createUserInAuth(snapshot));
