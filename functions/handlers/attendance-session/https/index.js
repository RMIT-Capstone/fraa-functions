const {db} = require('../../../utils/admin');

exports.createAttendanceSession = async (req, res) => {
  const {content: QRCodeContent} = req.body;
  try {
    await db
      .collection('attendance-session')
      .add(QRCodeContent);
    return res.json({message: 'attendance session created'});
  }
  catch (errorGenerateQrCode) {
    console.error(`Failed to generateQrCode: ${errorGenerateQrCode}`);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.getAttendanceSessionByCourseCode = async (req, res) => {
  const {courseCode} = req.body;
  try {
    let sessions = [];
    const querySnapshot = await db
      .collection('attendance-session')
      .where('courseCode', '==', courseCode)
      .orderBy('validOn')
      .limit(5)
      .get();
    querySnapshot.forEach(snapshot => {
      sessions.push(snapshot.data());
    });
    return res.json({sessions});
  }
  catch (errorGetAttendanceSessionByCourseCode) {
    console.error('Something went wrong with get attendance session by course code: ',
      errorGetAttendanceSessionByCourseCode);
    return res.json({error: 'Something went wrong. Try again'});
  }
};
