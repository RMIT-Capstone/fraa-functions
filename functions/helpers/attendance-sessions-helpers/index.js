const { db } = require('../../utils/admin');

const getAttendanceSessionDocumentIdByDate = async date => {
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('validOn', '==', new Date(date))
      .get();

    if (querySnapshot.empty) return { id: null, error: null };
    else {
      const id = querySnapshot.docs[0].id;
      return { id, error: null };
    }
  } catch (errorGetAttendanceSessionDocumentIdByDate) {
    console.error(
      'Something went wrong with getAttendanceSessionDocumentIdByDate: ',
      errorGetAttendanceSessionDocumentIdByDate);
    return { id: null, error: errorGetAttendanceSessionDocumentIdByDate };
  }
};

const attendanceSessionExistsWithDocId = async docId => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(docId)
      .get();
    return { attendanceSessionExists: documentSnapshot.exists };
  } catch (errorAttendanceSessionExistsWithDocId) {
    console.error(
      'Something went wrong with attendanceSessionExistsWithDocId: ',
      errorAttendanceSessionExistsWithDocId);
    return errorAttendanceSessionExistsWithDocId;
  }
};

const userAlreadyRegisteredToAttendanceSession = async (email, sessionId) => {
  try {
    const documentSnapshot = await db
      .collection('attendance-sessions')
      .doc(sessionId)
      .get();

    const { attendees } = documentSnapshot.data();
    if (!attendees) return { attended: false };
    return { attended: Boolean(attendees.includes(email)) };
  } catch (errorUserAlreadyRegisteredToAttendanceSession) {
    console.error(
      'Something went wrong with userAlreadyRegisteredToAttendanceSession: ',
      errorUserAlreadyRegisteredToAttendanceSession);
    return errorUserAlreadyRegisteredToAttendanceSession;
  }
};

module.exports = {
  getAttendanceSessionDocumentIdByDate,
  attendanceSessionExistsWithDocId,
  userAlreadyRegisteredToAttendanceSession,
};
