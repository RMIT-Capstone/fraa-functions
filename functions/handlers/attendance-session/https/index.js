const {db} = require('../../../utils/admin');
const QRCode = require('qrcode');
const {courseAlreadyExist} = require('../../courses/helper');

exports.createAttendanceSession = async (req, res) => {
  const QRCodeContent = req.body.content;
  QRCodeContent.origin = 'FRAA-CheckIn';
  const {courseCode} = QRCodeContent;
  const courseExist = await courseAlreadyExist(courseCode);
  if (!courseExist) {
    return res.json({error: 'Course does not exist'});
  }
  else {
    try {
      await QRCode.toDataURL(JSON.stringify(req.body.content), (error, url) => {
        if (error) {
          console.error(error);
        }
        res.send(url);
      });
      return createAttendanceSessionInFirestore(QRCodeContent);
    }
    catch (errorGenerateQrCode) {
      console.error(`Failed to generateQrCode: ${errorGenerateQrCode}`);
      return res.json({error: 'Something went wrong. Try again.'});
    }
  }
};

const createAttendanceSessionInFirestore = async session => {
  try {
    const createRecord = await db
      .collection('attendance-session')
      .add(session);
    if (createRecord) {
      console.log('Successfully created attendance session');
    }
    else {
      console.error('Something went wrong with creating attendance session');
    }
  }
  catch (errorCreateAttendanceSession) {
    console.error(`Failed to create attendance session: ${errorCreateAttendanceSession}`);
  }
};
