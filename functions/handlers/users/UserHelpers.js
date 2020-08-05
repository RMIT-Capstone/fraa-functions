const {db} = require('../../utils/admin');

exports.userDocumentExistsInFirestore = userId => {
  try {
    const userReference =  db.collection('users').doc(userId).get();
    return Boolean(userReference);
  }
  catch (e) {
    console.error(e);
    return null;
  }
};

exports.getUserDocumentIdByEmail = async email => {
  try {
    let id;
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();
    querySnapshot.forEach(doc => {
      id = doc.id;
    });
    if (id) {
      return id;
    }
    return null;
  }
  catch (e) {
    console.error(`Something went wrong with fetching user document ${e}`);
    return null;
  }
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.generateOTPCode = () => {
  const OTP_LENGTH = 6;
  return Array.apply(null, {length: OTP_LENGTH}).map(() => getRandomInt(0, 9)).join('');
};
