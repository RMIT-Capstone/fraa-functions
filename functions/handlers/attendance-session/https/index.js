const {db, bucket} = require('../../../utils/admin');
const QRCode = require('qrcode');

exports.createAttendanceSession = async (req, res) => {
  const {content: QRCodeContent} = req.body;
  const {validOn, courseCode} = QRCodeContent;
  QRCodeContent.origin = 'FRAA-CheckIn';

  try {
    const date = new Date(validOn);
    const month = formatMonth(date.getMonth() + 1);
    let dateFolderName = `${date.getDate()}_${month}_${date.getFullYear()}`;
    const base64String = await QRCode.toDataURL(JSON.stringify(QRCodeContent));
    const {url, error} = await uploadQRCodeToStorage(base64String, courseCode, dateFolderName);
    if (url) {
      QRCodeContent.QRCodeUrl = url;
      await createAttendanceSessionInFirestore(QRCodeContent);
    }
    if (error) {
      console.error(`Failed to generateQrCode: ${error}`);
      return res.json({error: 'Something went wrong. Try again.'});
    }

    return res.json({message: 'attendance session created'});
  }
  catch (errorGenerateQrCode) {
    console.error(`Failed to generateQrCode: ${errorGenerateQrCode}`);
    return res.json({error: 'Something went wrong. Try again.'});
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

const uploadQRCodeToStorage = async (QRCode, courseCode, date) => {
  const options = {
    destination: `${courseCode}/${date}/${new Date().toISOString()}.jpg`
  };
  const path = '/Users/trung/Desktop/fraa/fraa-functions/functions/handlers/attendance-session/https/output.jpg';
  QRCode = QRCode.replace(/^data:image\/png;base64,/, '');

  try {
    await require('fs').writeFile(path, QRCode,{encoding: 'base64'}, err => {
      console.error(err);
      return {url: null, error: err};
    });

    const uploadFile = await bucket.upload(path, options);
    const file = uploadFile[0];
    const metaData = await file.getMetadata();
    const fileMetaData = metaData[0];
    return {url: fileMetaData.mediaLink, error: null};
  }
  catch (errorUploadQRCodeToStorage) {
    console.error(errorUploadQRCodeToStorage);
    return {url: null, error: errorUploadQRCodeToStorage};
  }
};

const formatMonth = month => {
  if (month < 10) {
    return '0' + month;
  }
  return String(month);
};
