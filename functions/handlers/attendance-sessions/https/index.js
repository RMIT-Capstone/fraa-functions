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

exports.getAttendanceSessionsByCourseCode = async (req, res) => {
  const {courseCode} = req.body;
  try {
    let sessions = [];
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('courseCode', '==', courseCode)
      .orderBy('validOn')
      .limit(5)
      .get();

    querySnapshot.forEach(snapshot => {
      let data = snapshot.data();
      const {createdAt, expireOn, validOn} = data;
      data.createdAt = createdAt.toDate();
      data.expireOn = expireOn.toDate();
      data.validOn = validOn.toDate();
      data.id = snapshot.id;
      sessions.push(data);
    });
    return res.json({sessions});
  }
  catch (errorGetAttendanceSessionByCourseCode) {
    console.error('Something went wrong with get attendance session by course code: ',
      errorGetAttendanceSessionByCourseCode);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getMoreAttendanceSessionsByCourseCode = async (req, res) => {
  const {courseCode, startAfter} = req.body;
  try {
    let sessions = [];
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('courseCode', '==', courseCode)
      .orderBy('validOn')
      .startAfter(startAfter)
      .limit(5)
      .get();

    querySnapshot.forEach(snapshot => {
      sessions.push(snapshot.data());
    });
    return res.json({sessions});
  }
  catch (errorGetMoreAttendanceSessions) {
    console.error('Something went wrong with get more attendance session by course code: ',
      errorGetMoreAttendanceSessions);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getAttendanceSessionsInDateRangeWithCourseCode = async (req, res) => {
  const {courseCode, startTime, endTime} = req.body;
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
      const {createdAt, expireOn, validOn, courseCode: code} = data;
      data.createdAt = createdAt.toDate();
      data.expireOn = expireOn.toDate();
      data.validOn = validOn.toDate();
      data.id = snapshot.id;
      if (courseCode === code) sessions.push(data);
    });
    return res.json({sessions});
  }
  catch (errorGetAttendanceSessionByDateWithCourseCode) {
    console.error('Something went wrong with get attendance sessions by date with course code: ',
      errorGetAttendanceSessionByDateWithCourseCode);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.getTodayAttendanceSessionsByCourseCode = async (req, res) => {
  const {courseCode} = req.body;
  try {
    let sessions = [];
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
      const {createdAt, validOn, expireOn, courseCode: code} = data;
      data.createdAt = createdAt.toDate();
      data.validOn = validOn.toDate();
      data.expireOn = expireOn.toDate();
      data.id = snapshot.id;
      if (courseCode === code) sessions.push(data);
    });
    return res.json({sessions});
  }
  catch (errorGetTodaySessionsByCourseCode) {
    console.error(
      'Something went wrong with get today attendance session by course code: ',
      errorGetTodaySessionsByCourseCode);
    return res.json({error: errorGetTodaySessionsByCourseCode});
  }
};

// exports.getUserAttendanceSession = async (req, res) => {
//   const {email} = req.body;
// }

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
