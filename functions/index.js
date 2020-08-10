const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const {generateQrCode} = require('./handlers/qr-code');
const {
  createUserInAuth,
  signIn,
  createUserInFirestore,
  deleteUserInFirestore,
  generateOTP,
  verifyOTP,
  changeUserPassword
} = require('./handlers/users');

app.use(cors());
app.post('/generate_qr_code', generateQrCode);
app.post('/create_user', createUserInAuth);
app.post('/sign_in', signIn);
app.post('/generate_OTP', generateOTP);
app.post('/verify_OTP', verifyOTP);
app.post('/change_user_password', changeUserPassword);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
exports.onUserCreatedInAuth = functions.region('asia-northeast1').auth.user().onCreate(createUserInFirestore);
exports.onUserDeletedInAuth = functions.region('asia-northeast1').auth.user().onDelete(deleteUserInFirestore);
