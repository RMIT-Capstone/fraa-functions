const {db, admin, firebase} = require('../../../utils/admin');
const {sendOTPToUser} = require('../../email');
const {
  getUserIdInFBAuthWithEmail,
  generateOTPCode,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
} = require('../../../helpers/users-helpers');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');
const {sendErrorMessage} = require('../../../helpers/express-helpers');

exports.onCreateUser = async (req, res) => {
  const {email, password, displayName, school, isLecturer} = req.body;
  try {
    const {idToken, error} = await createUserInAuth(email, password);
    if (error) {
      if (error === 'Email already in use')
        return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}`);
      else {
        console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} onCreateUser: `, error);
        return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
      }
    }
    await createUserInFirestore(email, displayName, school, isLecturer);

    return res.status(200).json({idToken});
  }
  catch (errorOnCreateUser) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} onCreateUser:`, errorOnCreateUser);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

const createUserInFirestore = async (email, displayName, school, isLecturer) => {
  try {
    const collection = isLecturer ? 'lecturers' : 'users';
    await db
      .collection(collection)
      .add({
        email,
        displayName,
        school,
        subscribedCourses: [],
        createdAt: new Date(),
        firstTimePassword: true,
      });
  }
  catch (errorCreateUserInFirestore) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createUserInFirestore: `,
      errorCreateUserInFirestore
    );
  }
};

const createUserInAuth = async (email, password) => {
  try {
    const createAccount = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const idToken = await createAccount.user.getIdToken();
    return {idToken, error: null};
  }
  catch (errorCreateUserInAuth) {
    if (errorCreateUserInAuth.code === 'auth/email-already-in-use') {
      return {idToken: null, error: 'Email already in use'};
    }
    else {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createUserInAuth: `, errorCreateUserInAuth);
      return {idToken: null, error: errorCreateUserInAuth};
    }
  }
};

exports.signIn = async (req, res) => {
  const {email, password} = req.body;
  try {
    const signIn = await firebase.auth().signInWithEmailAndPassword(email, password);
    const idToken = await signIn.user.getIdToken();
    return res.json({token: idToken});
  }
  catch (errorSignIn) {
    if (errorSignIn.code === 'auth/wrong-password') {
      return res.json({error: 'Password is incorrect'});
    }
    else if (errorSignIn.code === 'auth/user-not-found') {
      return res.json({error: 'User does not exist'});
    }
    else {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} signIn: `, errorSignIn);
      return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }
  }
};

exports.generateOTP = async (req, res) => {
  const {email} = req.body;
  try {
    const OTP = generateOTPCode();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const fiveMinutesFromNow = new Date(now);
    await db.collection('reset-password-otp').add({
      email,
      OTP,
      expiryTime: fiveMinutesFromNow,
    });
    await sendOTPToUser(email, OTP);
    return res.status(200).json({success: 'OTP code created.'});
  }
  catch (errorGenerateOTP) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} generateOTP: `, errorGenerateOTP);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.verifyOTP = async (req, res) => {
  const {email, OTP: userOTP} = req.body;
  try {
    const {data} = await getLatestOTPDocumentOfUser(email);
    const {OTP, expiryTime} = data;
    const now = new Date();

    if (expiryTime.toDate() < now) {
      return res.json({error: 'OTP expired.'});
    }
    if (OTP === userOTP) {
      const {success} = await deleteOTPDocumentsByEmail(email);
      if (success) return res.json({success: 'Valid OTP.'});
      else return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }
    else {
      return res.json({error: 'Invalid OTP.'});
    }
  }
  catch (errorVerifyOTP) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} verifyOTP: `, errorVerifyOTP);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.changeUserPassword = async (req, res) => {
  const {email, password} = req.body;
  try {
    const recordId = await getUserIdInFBAuthWithEmail(email);
    await admin.auth().updateUser(recordId, {
      password: password
    });
    return res.json({success: 'Password updated successfully.'});
  }
  catch (errorChangeUserPassword) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} changeUserPassword: `, errorChangeUserPassword);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

exports.getUserByEmail = async (req, res) => {
  const {email} = req.body;
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    const data = querySnapshot.docs[0].data();
    data.createdAt = data.createdAt.toDate();
    return res.json(data);
  }
  catch (errorGetUserByEmail) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getUserByEmail: `, errorGetUserByEmail);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};
