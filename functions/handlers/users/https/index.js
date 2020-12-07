const { db, admin, firebase } = require('../../../utils/admin');
const { sendOTPToUser } = require('../../email');
const {
  getUserIdInFBAuthWithEmail,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
} = require('../../../helpers/users-helpers');
const { generateOTPCode } = require('../../../helpers/utilities-helpers');
const { sendErrorMessage } = require('../../../helpers/express-helpers');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');

const onCreateUser = async (req, res) => {
  const { email, password, displayName, school, isLecturer } = req.body;
  try {
    const { idToken, error } = await createUserInAuth(email, password);
    if (error) {
      if (error === 'Email already in use')
        return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS} ${email}`);
      else {
        console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} onCreateUser: `, error);
        return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
      }
    }
    await createUserInFirestore(email, displayName, school, isLecturer);

    return res.status(200).json({ idToken });
  }
  catch (errorOnCreateUser) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} onCreateUser:`, errorOnCreateUser);
    return res.json({ error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE });
  }
};

const createUserInFirestore = async (email, displayName, school, isLecturer) => {
  try {
    const collection = isLecturer ? 'lecturers' : 'students';
    await db
      .collection(collection)
      .add({
        email,
        displayName,
        school,
        subscribedCourses: [],
        totalAttendedEventsCount: 0,
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
    return { idToken, error: null };
  }
  catch (errorCreateUserInAuth) {
    if (errorCreateUserInAuth.code === 'auth/email-already-in-use') {
      return { idToken: null, error: 'Email already in use' };
    }
    else {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createUserInAuth: `, errorCreateUserInAuth);
      return { idToken: null, error: errorCreateUserInAuth };
    }
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const signIn = await firebase.auth().signInWithEmailAndPassword(email, password);
    const idToken = await signIn.user.getIdToken();
    return res.json({ token: idToken });
  } catch (errorSignIn) {
    if (errorSignIn.code === 'auth/wrong-password') {
      return res.json({ error: 'Password is incorrect' });
    }
    else if (errorSignIn.code === 'auth/user-not-found') {
      return res.json({ error: 'User does not exist' });
    }
    else {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} signIn: `, errorSignIn);
      return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }
  }
};

const generateOTP = async (req, res) => {
  const { email } = req.body;
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
    return res.status(200).json({ success: 'OTP code created.' });
  }
  catch (errorGenerateOTP) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} generateOTP: `, errorGenerateOTP);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const verifyOTP = async (req, res) => {
  const { email, OTP: userOTP } = req.body;
  try {
    const { data } = await getLatestOTPDocumentOfUser(email);
    const { OTP, expiryTime } = data;
    const now = new Date();

    if (expiryTime.toDate() < now) {
      return res.json({ error: 'OTP expired.' });
    }
    if (OTP === userOTP) {
      const { success } = await deleteOTPDocumentsByEmail(email);
      if (success) return res.json({ success: 'Valid OTP.' });
      else return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }
    else {
      return res.json({ error: 'Invalid OTP.' });
    }
  }
  catch (errorVerifyOTP) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} verifyOTP: `, errorVerifyOTP);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const changeUserPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const recordId = await getUserIdInFBAuthWithEmail(email);
    await admin.auth().updateUser(recordId, {
      password: password,
    });
    return res.json({ success: 'Password updated successfully.' });
  } catch (errorChangeUserPassword) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} changeUserPassword: `, errorChangeUserPassword);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const getUserByEmail = async (req, res) => {
  const { email, isLecturer } = req.body;
  const collection = isLecturer ? 'lecturers' : 'students';
  try {
    const querySnapshot = await db
      .collection(collection)
      .where('email', '==', email)
      .get();

    const data = querySnapshot.docs[0].data();
    data.id = querySnapshot.docs[0].id;
    data.createdAt = data.createdAt.toDate();

    return res.json(data);
  } catch (errorGetUserByEmail) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getUserByEmail: `, errorGetUserByEmail);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const countUserMissedAndTotalAttendanceSessionsByCoursesAndSemester = async (req, res) => {
  const { email, courses, semester } = req.body;
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('semester', '==', semester)
      .get();

    let missedEventsCount = 0;
    let totalEventsCount = 0;
    const now = new Date();

    if (querySnapshot.empty) {
      return res.send({ missedEventsCount, totalEventsCount });
    }

    querySnapshot.forEach(snapshot => {
      const { attendees, validOn, courseCode } = snapshot.data();
      if (validOn.toDate() < now && !attendees.includes(email) && courses.includes(courseCode)) {
        missedEventsCount++;
      }
      if (courses.includes(courseCode)) {
        totalEventsCount++;
      }
    });

    return res.send({ missedEventsCount, totalEventsCount });
  } catch (errorCountMissedEvents) {
    console.error('Something went wrong with countMissedEvents: ', errorCountMissedEvents);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

module.exports = {
  onCreateUser,
  signIn,
  generateOTP,
  verifyOTP,
  changeUserPassword,
  getUserByEmail,
  countUserMissedAndTotalAttendanceSessionsByCoursesAndSemester,
};
