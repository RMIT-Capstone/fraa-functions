const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const {createUserInFirestore, deleteUserInFirestore} = require('./handlers/users/background');
const {verifyOTP, generateOTP, signIn, createUserInAuth, changeUserPassword} = require('./handlers/users/https');
const {createCourse, subscribeUserToCourses, unsubscribeStudentFromCourses} = require('./handlers/courses/https');
const {createAttendanceSession} = require('./handlers/attendance-session/https');

app.use(cors());

//TODO: check request parameters

// attendance session handlers
app.post('/create_attendance_session', createAttendanceSession);

//courses
app.post('/create_course', createCourse);
app.post('/subscribe_courses', subscribeUserToCourses);
app.post('/unsubscribed_courses', unsubscribeStudentFromCourses);

// user handlers
app.post('/create_user', createUserInAuth);
app.post('/sign_in', signIn);
app.post('/generate_OTP', generateOTP);
app.post('/verify_OTP', verifyOTP);
app.post('/change_user_password', changeUserPassword);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
exports.onUserCreatedInAuth = functions.region('asia-northeast1').auth.user().onCreate(createUserInFirestore);
exports.onUserDeletedInAuth = functions.region('asia-northeast1').auth.user().onDelete(deleteUserInFirestore);
