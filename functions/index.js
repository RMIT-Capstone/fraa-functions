const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');

// routes
const COURSE_ROUTES = require('./routes/courses');

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
  unsubscribeStudentFromCourses,
} = require('./handlers/courses/https');
const {createAttendanceSession} = require('./handlers/attendance-session/https');

//middlewares
const courseValidator = require('./utils/middlewares/courses');

app.use(cors());

//TODO: check request parameters for users
//TODO: check auth headers when doing CRUD operations

// attendance session handlers
app.post('/create_attendance_session', createAttendanceSession);

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
app.post('/create_user', createUserInAuth);
app.post('/sign_in', signIn);
app.post('/generate_OTP', generateOTP);
app.post('/verify_OTP', verifyOTP);
app.post('/change_user_password', changeUserPassword);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
exports.onUserCreatedInAuth = functions.region('asia-northeast1').auth.user().onCreate(createUserInFirestore);
exports.onUserDeletedInAuth = functions.region('asia-northeast1').auth.user().onDelete(deleteUserInFirestore);
