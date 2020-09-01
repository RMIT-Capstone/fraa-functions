const {db, admin, firebase} = require('../../../utils/admin');
const {sendOTPToUser} = require('../../email');
const {
  getUserIdInFBAuthWithEmail,
  generateOTPCode,
  getOTPDocumentsByEmail,
  deleteOTPDocumentsByEmail,
} = require('../../../utils/middlewares/users/helper');

exports.onCreateUser = async (req, res) => {
  const {email, password, name, school, isLecturer} = req.body;
  console.log(isLecturer);
  try {
    const createUser = await Promise.all([
      isLecturer ? createLecturerInFirestore(email, name, school) : createUserInFirestore(email),
      createUserInAuth(email, password)]);
    // needs a better way to catch errors from the promises, may be map and catch ?
    const {error: errorCreateInFirestore} = createUser[0];
    const {error: errorCreateInFirebaseAuth, idToken} = createUser[1];
    if (errorCreateInFirestore) {
      console.error('Something went wrong with create user: ', errorCreateInFirestore);
      return res.json({error: 'Something went wrong. Try again'});
    }
    if (errorCreateInFirebaseAuth) {
      console.error('Something went wrong with create user: ', errorCreateInFirebaseAuth);
      return res.json({error: 'Something went wrong. Try again'});
    }
    return res.json({token: idToken});
  }
  catch (errorOnCreateUser) {
    console.error('Something went wrong with create user: ', errorOnCreateUser);
    return res.json({error: 'Something went wrong. Try again'});
  }
};

const createLecturerInFirestore = async (email, name, school) => {
  try {
    await db
      .collection('lecturers')
      .add({
        email,
        name: name.split(' ').map(letter => letter.toLowerCase()),
        school,
        createdAt: new Date(),
        firstTimePassword: true,
      });
    return {error: null};
  }
  catch (errorCreateLecturerInFirestore) {
    console.error('Something went wrong with create lecturer in Firestore: ', errorCreateLecturerInFirestore);
    return {error: errorCreateLecturerInFirestore};
  }
};

const createUserInFirestore = async email => {
  try {
    await db
      .collection('users')
      .add({
        email,
        createdAt: new Date(),
        firstTimePassword: true,
      });
    return {error: null};
  }
  catch (errorCreateUserInFirestore) {
    console.error('Something went wrong with create user in Firestore: ', errorCreateUserInFirestore);
    return {error: errorCreateUserInFirestore};
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
      console.error('Something went wrong with create user in auth: ', errorCreateUserInAuth);
      return {idToken: null, error: e};
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
      console.error('Something went wrong with sign in', errorSignIn);
      return res.json({error: 'Something went wrong. Try again.'});
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
    return res.json({success: 'OTP code created'});
  }
  catch (errorGenerateOTP) {
    console.error('Something went wrong with generate OTP: ', errorGenerateOTP);
    return res.json({error: 'Something went wrong. Try again.'});
  }

};

exports.verifyOTP = async (req, res) => {
  const {email, OTP: userOTP} = req.body;
  try {
    const otpDocumentSnapshot = await getOTPDocumentsByEmail(email);
    if (otpDocumentSnapshot.error) return res.json({error: otpDocumentSnapshot.error});
    else {
      const {OTP, expiryTime} = otpDocumentSnapshot;
      const now = new Date();
      console.log(OTP, expiryTime.toDate(), now.toISOString(), 'aaa');

      if (expiryTime.toDate() < now) {
        return res.json({error: 'OTP expired'});
      }
      if (OTP === userOTP) {
        await deleteOTPDocumentsByEmail(email);
        return res.json({success: 'valid OTP'});
      }
      else {
        return res.json({error: 'invalid OTP'});
      }
    }
  }
  catch (errorVerifyOTP) {
    console.error('Something went wrong with verify OTP: ', errorVerifyOTP);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};

exports.changeUserPassword = async (req, res) => {
  const {email, password} = req.body;
  try {
    const recordId = await getUserIdInFBAuthWithEmail(email);
    if (!recordId) return res.json({error: 'User does not exist'});
    await admin.auth().updateUser(recordId, {
      password: password
    });
    return res.json({success: 'password updated successfully'});
  }
  catch (errorChangeUserPassword) {
    console.error('Something went wrong with change user password: ', errorChangeUserPassword);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};
