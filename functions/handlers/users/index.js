const {db, firebase} = require('../../utils/admin');
const {validateAccountData}  = require('../../utils/user-helpers');
// const {getUserDocumentIdByEmail} = require('./UserHelpers');
// const crypto = require('crypto');

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
      return res.json({error: e});
    }
  }
};

exports.createUserInFirestore = async user => {
  try {
    const createUser = await db
      .collection('users')
      .add({
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
  catch(e) {
    console.error(`Failed to create user in Firestore: ${e}`);
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
    const idToken = signIn.user.getIdToken();
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
    return res.json({error: e});
  }
};

// exports.generateOTP = async (req, res) => {
//   const email = req.body.email;
//   const id = await getUserDocumentIdByEmail(email);
//   if (!id) {
//     return res.json({error: 'user does not exist'});
//   }
//   else {
//     return res.json({id});
//   }
// };
