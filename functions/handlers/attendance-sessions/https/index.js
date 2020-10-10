const {db, admin} = require('../../../utils/admin');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');
const {sendErrorMessage} = require('../../../helpers/express-helpers');

exports.createAttendanceSession = async (req, res) => {
  const {content} = req.body;
  content.createdAt = new Date();
  const {validOn, expireOn} = content;
  content.validOn = new Date(validOn);
  content.expireOn = new Date(expireOn);
  try {
    await db
      .collection('attendance-sessions')
      .add(content);
    return res.json({success: 'Attendance session created.'});
  }
  catch (errorCreateAttendance) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createAttendanceSession: `, errorCreateAttendance);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getAttendanceSessionsInDateRangeOfCourses = async (req, res) => {
  const {courses, startTime, endTime} = req.body;
  try {
    let sessions = [];
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', new Date(startTime))
      .where('validOn', '<=', new Date(endTime))
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const {courseCode} = data;
      transformAttendanceSessionData(data, snapshot);
      if (courses.includes(courseCode)) sessions.push(data);
    });
    return res.json({sessions});
  }
  catch (errorGetAttendanceSessionByDateWithCourseCode) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getAttendanceSessionInDateRangeOfCourses: `,
      errorGetAttendanceSessionByDateWithCourseCode
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getDailyAttendanceSessionsOfCourses = async (req, res) => {
  const {courses} = req.body;
  try {
    let sessions = {};
    courses.map(course => sessions[`${course}`] = []);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', start)
      .where('validOn', '<=', end)
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const {courseCode: code} = data;
      for (const courseCode in sessions) {
        if (courseCode === code) sessions[courseCode].push(data);
      }
    });
    return res.json({sessions});
  }
  catch (errorGetTodaySessionsByCourseCode) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getTodaySessionsByCourseCode: `,
      errorGetTodaySessionsByCourseCode
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getMonthlyAttendanceSessionsOfCourses = async (req, res) => {
  const {courses, month} = req.body;
  try {
    let sessions = [];

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), month, 1);
    const lastDayOfMonth = new Date(today.getFullYear(), month + 1, 0);
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', firstDayOfMonth)
      .where('validOn', '<=', lastDayOfMonth)
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const {courseCode} = data;
      if (courses.includes(courseCode)) {
        transformAttendanceSessionData(data, snapshot);
        sessions.push(data);
      }
      // const {courseCode: code} = data;
      // transformAttendanceSessionData(data, snapshot);
      // for (const courseCode in sessions) {
      //   if (courseCode === code) sessions[courseCode].push(data);
      // }
    });
    return res.json({sessions});
  }
  catch (errorGetMonthlyAttendanceSessionOfUser) {
    console.error('Something went wrong with getMonthlyAttendanceSessions: ', errorGetMonthlyAttendanceSessionOfUser);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.registerStudentToAttendanceSession = async (req, res) => {
  const {email, sessionId} = req.body;
  try {
    await db
      .collection('attendance-sessions')
      .doc(sessionId)
      .update({
        attendees: admin.firestore.FieldValue.arrayUnion(email)
      });
    return res.json({success: 'User registered.'});
  }
  catch (errorRegisterStudentToAttendanceSession) {
    console.error(
      'Something went wrong with registerStudentToAttendanceSession: ',
      errorRegisterStudentToAttendanceSession
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const transformAttendanceSessionData = (data, snapshot) => {
  const {createdAt, expireOn, validOn} = data;
  data.createdAt = createdAt.toDate();
  data.expireOn = expireOn.toDate();
  data.validOn = validOn.toDate();
  data.id = snapshot.id;
};
