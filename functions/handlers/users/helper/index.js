const {db} = require('../../../utils/admin');

exports.userDocumentExists = async userDocumentID => {
  try {
    const documentSnapshot = await db
      .collection('users')
      .doc(userDocumentID)
      .get();
    return documentSnapshot.exists;
  }
  catch (errorUserDocumentExists) {
    console.error(errorUserDocumentExists.message);
    return null;
  }
};

exports.userDocumentExistsWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    return !querySnapshot.empty;
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
    .collection('reset-password-otp')
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
      .collection('reset-password-otp')
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

exports.validateAccountData = data => {
  let errors = {};

  validateEmailData(data.email, errors);
  validatePasswordData(data.password, errors);

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


