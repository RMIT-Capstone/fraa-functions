const { db, admin } = require('../../../utils/admin');
const { sendErrorMessage, sendSuccessMessage } = require('../../../helpers/express-helpers');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');
const { getUserIdInFirestoreWithEmail } = require('../../../helpers/users-helpers');

const today = new Date();

exports.createAttendanceSession = async (req, res) => {
  const { content } = req.body;
  const { validOn, expireOn, courseId } = content;
  content.createdAt = new Date();
  content.validOn = new Date(validOn);
  content.expireOn = new Date(expireOn);
  content.attendees = [];
  delete content.courseId;
  try {
    await db
      .collection('attendance-sessions')
      .add(content);
    await db
      .collection('courses')
      .doc(courseId)
      .update({
        sessionCounts: admin.firestore.FieldValue.increment(1),
      });
    return res.json(content);
  } catch (errorCreateAttendance) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createAttendanceSession: `, errorCreateAttendance);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getAttendanceSessionsInDateRange = async (req, res) => {
  const { courses, startTime, endTime } = req.body;
  try {
    let sessions = [], markedDates = {};
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', new Date(startTime))
      .where('validOn', '<=', new Date(endTime))
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const { courseCode } = data;
      transformAttendanceSessionData(data, snapshot);
      if (courses.includes(courseCode)) sessions.push(data);
    });

    if (sessions.length !== 0) {
      markedDates = markAttendanceSessionsDate(sessions);
    }
    return res.json({ sessions, markedDates });
  } catch (errorGetAttendanceSessionByDateWithCourseCode) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getAttendanceSessionInDateRangeOfCourses: `,
      errorGetAttendanceSessionByDateWithCourseCode,
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getAttendanceSessionsInMonthRange = async (req, res) => {
  const { courses, startMonth, monthRange } = req.body;
  try {
    let sessions = [], markedDates = {};

    const firstDayOfStartMonth = new Date(today.getFullYear(), startMonth, 1, 0, 0, 0, 0);
    const lastDayOfEndMonth = new Date(today.getFullYear(), startMonth + monthRange - 1, 23, 59, 59, 59, 999);
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', firstDayOfStartMonth)
      .where('validOn', '<=', lastDayOfEndMonth)
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const { courseCode } = data;
      if (courses.includes(courseCode)) {
        transformAttendanceSessionData(data, snapshot);
        sessions.push(data);
      }
    });

    if (sessions.length !== 0) {
      markedDates = markAttendanceSessionsDate(sessions);
    }
    return res.json({ sessions, markedDates });
  } catch (errorGetAttendanceSessionsInMonthRange) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getAttendanceSessionsInMonthRange`,
      errorGetAttendanceSessionsInMonthRange,
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getDailyAttendanceSessions = async (req, res) => {
  const { courses } = req.body;
  try {
    let sessions = [], markedDates = {};

    const start = new Date().setHours(0, 0, 0, 0);
    const end = new Date().setHours(23, 59, 59, 999);
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', start)
      .where('validOn', '<=', end)
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const { courseCode } = data;
      if (courses.includes(courseCode)) {
        transformAttendanceSessionData(data, snapshot);
        sessions.push(data);
      }
    });

    if (sessions.length !== 0) {
      markedDates = markAttendanceSessionsDate(sessions);
    }
    return res.json({ sessions, markedDates });
  } catch (errorGetDailyAttendanceSessions) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getDailyAttendanceSessions: `,
      errorGetDailyAttendanceSessions,
    );
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getMonthlyAttendanceSessions = async (req, res) => {
  const { courses, month } = req.body;
  try {
    let sessions = [], markedDates = {};

    const firstDayOfMonth = new Date(today.getFullYear(), month, 1, 0, 0, 0, 0);
    const lastDayOfMonth = new Date(today.getFullYear(), month + 1, 0, 23, 59, 59, 999);
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '>=', firstDayOfMonth)
      .where('validOn', '<=', lastDayOfMonth)
      .orderBy('validOn')
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const { courseCode } = data;
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

    if (sessions.length !== 0) {
      markedDates = markAttendanceSessionsDate(sessions);
    }
    return res.json({ sessions, markedDates });
  } catch (errorGetMonthlyAttendanceSessions) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE}`, errorGetMonthlyAttendanceSessions);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.registerStudentToAttendanceSession = async (req, res) => {
  const { email, sessionId } = req.body;
  try {
    await db
      .collection('attendance-sessions')
      .doc(sessionId)
      .update({
        attendees: admin.firestore.FieldValue.arrayUnion(email),
      });

    const { userId, errorGetUserId } = await getUserIdInFirestoreWithEmail(email);
    if (errorGetUserId) {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE}`, errorGetUserId);
      return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }

    await db
      .collection('users')
      .doc(userId)
      .update({
        totalAttendedEventsCount: admin.firestore.FieldValue.increment(1),
      });
    return sendSuccessMessage(res, 'User registered');
  } catch (errorRegisterStudentToAttendanceSession) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE}`, errorRegisterStudentToAttendanceSession);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const transformAttendanceSessionData = (data, snapshot) => {
  const { createdAt, expireOn, validOn } = data;
  data.createdAt = createdAt.toDate();
  data.expireOn = expireOn.toDate();
  data.validOn = validOn.toDate();
  data.id = snapshot.id;
};

const markAttendanceSessionsDate = sessions => {
  let markedDates = {};
  sessions.forEach((session) => {
    const { validOn } = session;
    const eventDate = new Date(validOn).toISOString().split('T')[0];
    markedDates[eventDate] = {};
    markedDates[eventDate].marked = true;
    markedDates[eventDate].dotColor = '#E60028';
  });
  return markedDates;
};
