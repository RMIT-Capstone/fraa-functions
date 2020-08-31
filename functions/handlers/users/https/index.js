const {db, admin, firebase} = require('../../../utils/admin');
const {sendOTPToUser} = require('../../email');
const {
  getUserIdInFBAuthWithEmail,
  generateOTPCode,
  getOTPDocumentsByEmail,
  deleteOTPDocumentsByEmail,
} = require('../../../utils/middlewares/users/helper');

exports.onCreateUser = async (req, res) => {
  const {email, password} = req.body;
  try {
    const createUser = await Promise.all([createUserInFirestore(email), createUserInAuth(email, password)]);
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

const createUserInFirestore = async (email) => {
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
  catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      return {idToken: null, error: 'Email already in use'};
    }
    else {
      console.error('Something went wrong with create user in auth: ', e.message);
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
  catch (e) {
    if (e.code === 'auth/wrong-password') {
      return res.json({error: 'Password is incorrect'});
    }
    else if (e.code === 'auth/user-not-found') {
      return res.json({error: 'User does not exist'});
    }
    else {
      console.error(e.message);
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
    return res.json({message: 'OTP code created'});
  }
  catch (errorGenerateOTP) {
    console.error(errorGenerateOTP.message);
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
        return res.json({message: 'Valid OTP'});
      }
      else {
        return res.json({error: 'Invalid OTP'});
      }
    }
  }
  catch (errorVerifyOTP) {
    console.error(errorVerifyOTP.message);
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
    return res.json({message: 'Password updated successfully'});
  }
  catch (errorChangeUserPassword) {
    console.error(errorChangeUserPassword);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};
