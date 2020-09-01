const {db, admin} = require('../../../admin');

exports.getUserDocumentIdWithId = async email => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return {exists: false, id: null};
    }
    else {
      const documentId = querySnapshot.docs[0].id;
      return {exists: true, id: documentId};
    }
  }
  catch (errorUserAlreadyExistsWithEmail) {
    console.error(errorUserAlreadyExistsWithEmail);
    return {exists: false, id: null};
  }
};

exports.lecturerAlreadyExistsWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('lecturers')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return {exists: false, id: null};
    }
    else {
      const documentId = querySnapshot.docs[0].id;
      return {exists: true, id: documentId};
    }
  }
  catch (errorLecturerAlreadyExistsWithEmail) {
    console.error(errorLecturerAlreadyExistsWithEmail);
    return {exists: false, id: null};
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
    .collection('reset-password-otp')
    .where('email', '==', email)
    .orderBy('expiryTime', 'desc')
    .get();
  if (querySnapshot.empty) return {error: `no OTP code found with ${email}`};
  return querySnapshot.docs[0].data();
};

exports.deleteOTPDocumentsByEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('reset-password-otp')
      .where('email', '==', email)
      .get();
    if (!querySnapshot.empty) {
      querySnapshot.forEach(snapshot => {
        snapshot.ref.delete();
      });
    }
  }
  catch (errorDeleteOTPDocuments) {
    console.error(errorDeleteOTPDocuments.message);
  }
};

exports.getUserIdInFBAuthWithEmail = async email => {
  try {
    const userRecord = await admin
      .auth()
      .getUserByEmail(email);
    if (!userRecord) {
      return null;
    }
    return userRecord.uid;
  }
  catch (errorGetUserIdInFBAuthWithEmail) {
    console.error(errorGetUserIdInFBAuthWithEmail.message);
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

const stringIsEmpty = string => {
  if (!(typeof string === 'string')) return true;
  return string.trim() === '';
};

const isEmail = email => {
  let regEx;
  // eslint-disable-next-line no-useless-escape,max-len
  regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return Boolean(email.match(regEx));
};

exports.validateAccountData = (email, password) => {
  let errors = {};

  validateEmailData(email, errors);
  validatePasswordData(password, errors);

  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

const validateEmailData = (email, errors) => {
  if (stringIsEmpty(email)) {
    errors.email = 'Email must not be empty';
  }
  else if (!isEmail(email)) {
    errors.email = 'Invalid email address';
  }
};

const validatePasswordData = (password, errors) => {
  if (stringIsEmpty(password)) errors.password = 'Password must not be empty';
  else if (password.length < 6) errors.password = 'Password length must be more than 6 characters';
};


