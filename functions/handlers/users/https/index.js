const { db, admin, firebase } = require('../../../utils/admin');
const { sendOTPToUser } = require('../../email');
const {
  getUserIdInFBAuthWithEmail,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
} = require('../../../helpers/users-helpers');
const { generateOTPCode } = require('../../../helpers/utilities-helpers');
const { sendErrorMessage, sendSuccessMessage } = require('../../../helpers/express-helpers');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');
const { sendSuccessObject } = require('../../../helpers/express-helpers');

const onCreateUser = async (req, res) => {
  const { user, user: { email, password } } = req.body;
  try {
    const { idToken, error } = await createUserInAuth(email, password);
    if (error) {
      if (error === 'Email already in use')
        return sendErrorMessage(res, `${ERROR_MESSAGES.USER_ALREADY_EXISTS_WITH_EMAIL} ${email}`);
      else {
        console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} onCreateUser: `, error);
        return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
      }
    }
    const createResult = await createUserInFirestore(user);
    return sendSuccessObject(res, { idToken, user: createResult });
  } catch (errorOnCreateUser) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} onCreateUser: `, errorOnCreateUser);
    return res.json({ error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE });
  }
};

const createUserInAuth = async (email, password) => {
  try {
    const createAccount = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const idToken = await createAccount.user.getIdToken();
    return { idToken, error: null };
  } catch (errorCreateUserInAuth) {
    if (errorCreateUserInAuth.code === 'auth/email-already-in-use') {
      return { idToken: null, error: 'Email already in use' };
    } else {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createUserInAuth: `, errorCreateUserInAuth);
      return { idToken: null, error: errorCreateUserInAuth };
    }
  }
};

const createUserInFirestore = async (user) => {
  try {
    const { isLecturer } = user;

    isLecturer ? user.isLecturer = true : user.isLecturer = false;
    user.subscribedCourses = [];
    user.createdAt = new Date();
    user.firstTimePassword = true;
    user.verified = false;
    delete user.password;

    const result = await db
      .collection('users')
      .add(user);
    user.id = result.id;

    return user;

  } catch (errorCreateUserInFirestore) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} createUserInFirestore: `,
      errorCreateUserInFirestore,
    );
    return null;
  }
};

const deleteUserInAuth = async (req, res) => {
  const { email } = req.body;
  try {
    const recordId = await getUserIdInFBAuthWithEmail(email);
    await admin
      .auth()
      .deleteUser(recordId);
    return sendSuccessObject(res, { uid: recordId });
  } catch (errorDeleteUserInAuth) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} deleteUserInAuth: `, errorDeleteUserInAuth);
    return res.json({ error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE });
  }
};

const updateUser = async (req, res) => {
  const { user, user: { id, displayName, firstTimePassword, school, verified } } = req.body;
  try {
    await db
      .collection('users')
      .doc(id)
      .update({
        displayName,
        firstTimePassword,
        school,
        verified,
      });
    return sendSuccessObject(res, user);
  } catch (errorUpdateUser) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} updateUser: `, errorUpdateUser);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const getUserByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const { data, errorGetUser } = await getUserInFirestore(email);
    if (errorGetUser) {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getUserByEmail: `, errorGetUser);
      return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }
    return sendSuccessObject(res, { user: data });
  } catch (errorGetUserByEmail) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getUserByEmail: `, errorGetUserByEmail);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const getUserInFirestore = async (email) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    const data = querySnapshot.docs[0].data();
    data.id = querySnapshot.docs[0].id;
    data.createdAt = data.createdAt.toDate();

    return { data, errorGetUser: null };
  } catch (errorGetUserInFirestore) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getUserInFirestore: `, errorGetUserInFirestore);
    return { data: null, errorGetUser: errorGetUserInFirestore };
  }
};

const getAllUsers = async (req, res) => {
  const { isLecturer } = req.body;
  try {
    const querySnapshot = await db
      .collection('users')
      .where('isLecturer', '==', isLecturer)
      .get();

    const users = [];
    querySnapshot.forEach((snapshot) => {
      let data = snapshot.data();
      data.id = snapshot.id;
      data.createdAt = snapshot.createTime.toDate();
      users.push(data);
    });

    return sendSuccessObject(res, { users });
  } catch (errorGetAllStudents) {
    console.error('Something went wrong with getAllStudents: ', errorGetAllStudents);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const signIn = async (req, res) => {
  const { email, password, isLecturer } = req.body;
  try {
    const signIn = await firebase.auth().signInWithEmailAndPassword(email, password);
    const token = await signIn.user.getIdToken();
    const { data: user, errorGetUser } = await getUserInFirestore(email, isLecturer);

    if (errorGetUser) {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} getUserByEmail: `, errorGetUser);
      return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }

    return sendSuccessObject(res, { token, user });
  } catch (errorSignIn) {
    if (errorSignIn.code === 'auth/wrong-password') {
      return sendErrorMessage(res, 'Password is incorrect');
    } else if (errorSignIn.code === 'auth/user-not-found') {
      return sendErrorMessage(res, 'User does not exist');
    } else {
      console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} signIn: `, errorSignIn);
      return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    }
  }
};

const changeUserPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const recordId = await getUserIdInFBAuthWithEmail(email);
    await admin
      .auth()
      .updateUser(recordId, {
        password: password,
      });
    return sendSuccessMessage(res, 'Password changed successfully');
  } catch (errorChangeUserPassword) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} changeUserPassword: `, errorChangeUserPassword);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const generateOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const OTP = generateOTPCode();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const fiveMinutesFromNow = new Date(now);
    await db
      .collection('reset-password-otp')
      .add({
        email,
        OTP,
        expiryTime: fiveMinutesFromNow,
      });
    await sendOTPToUser(email, OTP);
    return sendSuccessMessage(res, 'OTP code generated');
  } catch (errorGenerateOTP) {
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
      return sendSuccessMessage(res, 'OTP expired');
    }
    if (OTP === userOTP) {
      const { success } = await deleteOTPDocumentsByEmail(email);
      if (success) return sendSuccessMessage(res, 'Valid OTP');
      else return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
    } else {
      return sendSuccessMessage(res, 'Invalid OTP');
    }
  } catch (errorVerifyOTP) {
    console.error(`${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} verifyOTP: `, errorVerifyOTP);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const countMissedAndTotalAttendanceSessions = async (req, res) => {
  const { email, courses, semester } = req.body;
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('semester', '==', semester)
      .get();

    let missed = 0;
    let total = 0;
    const now = new Date();

    if (querySnapshot.empty) {
      return res.send({ missed, total });
    }

    querySnapshot.forEach(snapshot => {
      const { attendees, validOn, courseCode } = snapshot.data();
      if (validOn.toDate() < now && !attendees.includes(email) && courses.includes(courseCode)) {
        missed++;
      }
      if (courses.includes(courseCode)) {
        total++;
      }
    });

    return res.send({ missed, total });
  } catch (errorCountMissedEvents) {
    console.error('Something went wrong with countMissedAndTotalAttendanceSessions: ', errorCountMissedEvents);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

const countMissedTotalAttendanceSessionsByCourses = async (req, res) => {
  const { email, courses, semester } = req.body;
  try {
    const querySnapshot = await db
      .collection('attendance-sessions')
      .where('semester', '==', semester)
      .get();
    let missed = {};
    let total = {};
    const now = new Date();

    if (querySnapshot.empty) {
      return res.send({ missed, total });
    }

    courses.forEach((course) => {
      missed[course] = 0;
      total[course] = 0;
    });

    querySnapshot.forEach(snapshot => {
      const { attendees, validOn, courseCode } = snapshot.data();
      if (validOn.toDate() < now && !attendees.includes(email) && courses.includes(courseCode)) {
        missed[courseCode] = missed[courseCode] + 1;
      }

      if (courses.includes(courseCode)) {
        total[courseCode] = total[courseCode] + 1;
      }
    });

    return res.send({ missed, total });
  } catch (errorCountMissedTotalAttendanceSessionsByCourse) {
    console.error('Something went wrong with countMissedTotalAttendanceSessionsByCourse: ',
      errorCountMissedTotalAttendanceSessionsByCourse);
    return sendErrorMessage(res, `${ERROR_MESSAGES.GENERIC_ERROR_MESSAGE}`);
  }
};

module.exports = {
  onCreateUser,
  deleteUserInAuth,
  updateUser,
  signIn,
  generateOTP,
  verifyOTP,
  changeUserPassword,
  getUserByEmail,
  getAllUsers,
  countMissedAndTotalAttendanceSessions,
  countMissedTotalAttendanceSessionsByCourses,
};
