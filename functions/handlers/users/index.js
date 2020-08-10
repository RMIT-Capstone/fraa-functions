const {db, firebase, admin} = require('../../utils/admin');
const {validateAccountData}  = require('../../utils/user-helpers');
const {
  userDocumentExistsWithEmail,
  getUserDocumentIdByEmail,
  getUserDataInFirebaseAuthentication,
  getOTPDocumentsByEmail,
  deleteOTPDocumentsByEmail,
  deleteUserInFirestore
} = require('./UserHelpers');
const {generateOTPCode} = require('./UserHelpers');

exports.createUserInAuth = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.password,
  };
  newUser.newAccount = true;
  const {errors, valid} = validateAccountData(newUser);

  if (!valid) return res.json({error: errors});
  try {
    const createAccount = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
    const idToken = await createAccount.user.getIdToken();
    if (idToken) {
      return res.json({token: idToken});
    }
    else {
      return res.json({error: 'Token generation failed. Check Firebase console.'});
    }
  }
  // Error message can be used as response, no need to console.error here.
  catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      return res.json({error: 'Email already in use.'});
    }
    else {
      console.error(e.message);
      return res.json({error: 'Something went wrong with createUserInAuth()'});
    }
  }
};

exports.signIn = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const {valid, errors} = validateAccountData(user);
  if (!valid) return res.json({error: errors});

  try {
    const signIn = await firebase.auth().signInWithEmailAndPassword(user.email, user.password);
    const idToken = await signIn.user.getIdToken();
    if (idToken) {
      return res.json({token: idToken});
    }
    else {
      return res.json({error: 'Token generation failed. Check Firebase console.'});
    }
  }
  // Error message can be used as response, no need to console.error here.
  catch (e) {
    if (e.code === 'auth/wrong-password') {
      return res.json({error: 'Password is incorrect'});
    }
    else if (e.code === 'auth/user-not-found') {
      return res.json({error: 'User does not exist'});
    }
    else {
      console.error(e.message);
      return res.json({error: 'Something went wrong with signIn()'});
    }
  }
};

exports.generateOTP = async (req, res) => {
  const email = req.body.email;
  const userExists = await userDocumentExistsWithEmail(email);

  if (!userExists) {
    return res.json({error: 'User does not exist'});
  }
  else {
    try {
      const OTP = generateOTPCode();
      const now = admin.firestore.Timestamp.now();
      await db.collection('OTP').add({
        email,
        OTP,
        expiryTime: admin.firestore.Timestamp.fromMillis(now.toMillis() + (300 * 1000)),
      });
      return res.json({message: 'OTP code created'});
    }
    catch (errorGenerateOTP) {
      console.log(errorGenerateOTP.message);
      return res.json({error: 'Something went wrong with generateOTP()'});
    }
  }
};

exports.verifyOTP = async (req, res) => {
  const email = req.body.email;
  const userOTP = req.body.OTP;
  const userExist = await userDocumentExistsWithEmail(email);

  if (!userExist) return res.json({error: 'User does not exist'});

  try {
    const otpDocumentSnapshot = await getOTPDocumentsByEmail(email);
    if (otpDocumentSnapshot.error) {
      return res.json({error: otpDocumentSnapshot.error});
    }
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
    return res.json({error: 'Something went wrong with verifyOTP()'});
  }
};

exports.changeUserPassword = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const {valid, errors} = validateAccountData(user);
  if (!valid) return res.json({error: errors});

  try {
    const record = await getUserDataInFirebaseAuthentication(user.email);
    await admin.auth().updateUser(record.uid, {
      password: user.password
    });
    return res.json({message: 'Password updated successfully'});
  }
  catch (errorChangeUserPassword) {
    console.error(errorChangeUserPassword);
    return res.json({error: 'Something went wrong with changeUserPassword()'});
  }
};

// background functions
exports.createUserInFirestore = async user => {
  try {
    const createUser = await db.collection('users').add({
      email: user.email,
      createdAt: new Date().toISOString(),
      firstTimePassword: true,
    });
    if (createUser) {
      console.log(`User with email: ${user.email} created successfully`);
    }
    else {
      console.error(`Something went wrong with creating ${user.email} in Firestore`);
    }
  }
  catch(errorCreateUserInFirestore) {
    console.error(`Failed to create user in Firestore: ${errorCreateUserInFirestore.message}`);
  }
};

exports.deleteUserInFirestore = async user => {
  try {
    const userDocId = await getUserDocumentIdByEmail(user.email);
    if (userDocId) {
      await Promise.all([deleteUserInFirestore(userDocId), deleteOTPDocumentsByEmail(user.email)]);
    }
  }
  catch (errorDeleteUserInFirestore) {
    console.error(`Failed to delete user in Firestore: ${errorDeleteUserInFirestore}`);
  }
};
