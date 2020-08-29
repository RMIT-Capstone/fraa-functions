const {db, admin, firebase} = require('../../../utils/admin');
const {sendOTPToUser} = require('../../email');
const {
  userDocumentExistsWithEmail,
  getUserIdInFBAuthWithEmail,
  generateOTPCode,
  getOTPDocumentsByEmail,
  validateAccountData
} = require('../helper');

exports.onCreateUser = async (req, res) => {
  const {email, password} = req.body;
  try {
    const createUser = await Promise.all([createUserInFirestore(req, res), createUserInAuth(req, res)]);
    console.log(createUser);
  }
  catch (errorOnCreateUser) {
    console.error('Something went wrong with create user: ', errorOnCreateUser);
    return res.json({error: 'Something went wrong. Try again'});
  }
};

exports.createUserInFirestore = async (email, password) => {
  try {

  }
};

exports.createUserInAuth = async (email, password) => {
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
      console.error(e.message);
      return res.json({error: 'Something went wrong. Try again.'});
    }
  }
};

exports.signIn = async (req, res) => {
  const {email, password} = req.body;
  const user = {
    email,
    password
  };
  const {valid, errors} = validateAccountData(user);
  if (!valid) return res.json({error: errors});

  try {
    const signIn = await firebase.auth().signInWithEmailAndPassword(user.email, user.password);
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
  const userExists = await userDocumentExistsWithEmail(email);

  if (!userExists) {
    return res.json({error: 'User does not exist'});
  }
  else {
    try {
      const OTP = generateOTPCode();
      const now = admin.firestore.Timestamp.now();
      const expiryTime = admin.firestore.Timestamp.fromMillis(now.toMillis() + (300 * 1000));
      await db.collection('reset-password-otp').add({
        email,
        OTP,
        expiryTime
      });
      await sendOTPToUser(email, OTP);
      return res.json({message: 'OTP code created'});
    }
    catch (errorGenerateOTP) {
      console.error(errorGenerateOTP.message);
      return res.json({error: 'Something went wrong. Try again.'});
    }
  }
};

exports.verifyOTP = async (req, res) => {
  const {email, userOTP} = req.body;
  const userExist = await userDocumentExistsWithEmail(email);

  if (!userExist) return res.json({error: 'User does not exist'});

  try {
    const otpDocumentSnapshot = await getOTPDocumentsByEmail(email);
    if (otpDocumentSnapshot.error) return res.json({error: otpDocumentSnapshot.error});
    else {
      const expiryTime = otpDocumentSnapshot.expiryTime.toDate().toString();
      const now = admin.firestore.Timestamp.now().toDate().toString();
      const OTP = otpDocumentSnapshot.OTP;

      if (expiryTime < now) {
        return res.json({error: 'OTP expired'});
      }
      if (OTP === userOTP) {
        return res.json({message: 'Valid OTP'});
      }
      else {
        return res.json({message: 'Invalid OTP'});
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
  const user = {
    email,
    password
  };
  const {valid, errors} = validateAccountData(user);

  if (!valid) return res.json({error: errors});

  try {
    const recordId = await getUserIdInFBAuthWithEmail(user.email);
    if (!recordId) return res.json({error: 'User does not exist'});
    await admin.auth().updateUser(recordId, {
      password: user.password
    });
    return res.json({message: 'Password updated successfully'});
  }
  catch (errorChangeUserPassword) {
    console.error(errorChangeUserPassword);
    return res.json({error: 'Something went wrong. Try again.'});
  }
};
