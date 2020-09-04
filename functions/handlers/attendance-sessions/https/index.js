const {db, admin} = require('../../../utils/admin');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');

exports.createAttendanceSession = async (req, res) => {
  const {content: QRCodeContent} = req.body;
  QRCodeContent.createdAt = new Date();
  const {validOn, expireOn} = QRCodeContent;
  QRCodeContent.validOn = new Date(validOn);
  QRCodeContent.expireOn = new Date(expireOn);
  try {
    await db
      .collection('attendance-sessions')
      .add(QRCodeContent);
    return res.json({success: 'Attendance session created.'});
  }
  catch (errorGenerateQrCode) {
    console.error(`Failed to generateQrCode: ${errorGenerateQrCode}`);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
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
    console.error('Something went wrong with get attendance sessions by date with course code: ',
      errorGetAttendanceSessionByDateWithCourseCode);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
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
      'Something went wrong with get today attendance session by course code: ',
      errorGetTodaySessionsByCourseCode);
    return res.json({error: `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`});
  }
};

exports.getMonthlyAttendanceSessionOfCourses = async (req, res) => {
  const {courses, month} = req.body;
  try {
    let sessions = {};
    courses.map(course => sessions[`${course}`] = []);

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
      const {courseCode: code} = data;
      transformAttendanceSessionData(data, snapshot);
      for (const courseCode in sessions) {
        if (courseCode === code) sessions[courseCode].push(data);
      }
    });
    return res.json({sessions});
  }
  catch (errorGetMonthlyAttendanceSessionOfUser) {
    console.error(
      'Something went wrong with get monthly attendance session: ',
      errorGetMonthlyAttendanceSessionOfUser);
    return res.json({error: `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`});
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
      'Something went wrong with register student to attendance session',
      errorRegisterStudentToAttendanceSession);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

const transformAttendanceSessionData = (data, snapshot) => {
  const {createdAt, expireOn, validOn} = data;
  data.createdAt = createdAt.toDate();
  data.expireOn = expireOn.toDate();
  data.validOn = validOn.toDate();
  data.id = snapshot.id;
};
