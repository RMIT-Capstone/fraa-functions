const {db} = require('../../utils/admin');

// querysnapshot is an array of snapshots when queried
// if querysnapshot length is more than 0 (not empty)
// a document exist with given query parameters
exports.userDocumentExistsWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    return querySnapshot.size > 0;
  }
  catch (errorUserDocumentExistsWithEmail) {
    console.error(errorUserDocumentExistsWithEmail.message);
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
    querySnapshot.forEach(snapshot => {
      id = snapshot.id;
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

exports.deleteUserInFirestore = async userDocId => {
  return db
    .collection('users')
    .doc(userDocId)
    .delete();
};

exports.getOTPDocumentsByEmail = async email => {
  const querySnapshot = await db
    .collection('OTP')
    .where('email', '==', email)
    .orderBy('expiryTime', 'desc')
    .get();

  if (!querySnapshot || querySnapshot.size === 0) {
    return {error: `no OTP code found with ${email}`};
  }
  else {
    return querySnapshot.docs[0].data();
  }
};

exports.deleteOTPDocumentsByEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('OTP')
      .where('email', '==', email)
      .get();
    if (querySnapshot.size >= 1) {
      querySnapshot.forEach(snapshot => {
        snapshot.ref.delete();
      });
    }
  }
  catch (errorDeleteOTPDocuments) {
    console.error(errorDeleteOTPDocuments.message);
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

