const { db, admin } = require('../../utils/admin');

// TODO: refactor this to accept email AND collection
const getStudentDocumentIdWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('students')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { studentDocId: null, studentDocIdError: null };
    } else {
      const documentId = querySnapshot.docs[0].id;
      return { studentDocId: documentId, studentDocIdError: null };
    }
  }
  catch (errorGetUserDocumentIdWithEmail) {
    console.error('Something went wrong with getUserDocumentIdWithEmail: ', errorGetUserDocumentIdWithEmail);
    return { studentDocId: null, studentDocIdError: errorGetUserDocumentIdWithEmail };
  }
};

const getLecturerDocumentIdWithEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('lecturers')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { lecturerDocId: null, lecturerDocIdError: null };
    }
    else {
      const documentId = querySnapshot.docs[0].id;
      return { lecturerDocId: documentId, lecturerDocIdError: null };
    }
  } catch (errorGetLecturerDocumentIdWithEmail) {
    console.error(
      'Something went wrong with getLecturerDocumentIdWithEmail: ', errorGetLecturerDocumentIdWithEmail);
    return { lecturerDocId: null, lecturerDocIdError: errorGetLecturerDocumentIdWithEmail };
  }
};

const userExistsWithEmail = async (email, collection) => {
  try {
    const querySnapshot = await db
      .collection(collection)
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { userExists: false, errorUserExists: null };
    }
    return { userExists: true, errorUserExists: null };
  } catch (errorUserExistsWithEmail) {
    console.error('Something went wrong with userExistsWithEmail: ', errorUserExistsWithEmail);
    return { userExists: null, errorUserExists: true };
  }
};

const userExistsWithId = async (id, collection) => {
  try {
    const documentSnapshot = await db
      .collection(collection)
      .doc(id)
      .get();

    if (documentSnapshot.exists) {
      return { userExists: true, userExistsError: null };
    }
    return { userExists: false, userExistsError: null };
  } catch (errorUserExistsWithId) {
    console.error('Something went wrong with userExistsWithId: ', errorUserExistsWithId);
    return { userExists: null, errorUserExistsWithId: true };
  }
};

const getLatestOTPDocumentOfUser = async email => {
  try {
    const querySnapshot = await db
      .collection('reset-password-otp')
      .where('email', '==', email)
      .orderBy('expiryTime', 'desc')
      .get();
    if (querySnapshot.empty) return { error: `no OTP code found with ${email}` };
    return { data: querySnapshot.docs[0].data(), error: null };
  }
  catch (errorGetLatestOTPDocumentOfUser) {
    console.error('Something went wrong with getLatestOTPDocumentOfUser: ', errorGetLatestOTPDocumentOfUser);
    return { data: null, error: errorGetLatestOTPDocumentOfUser };
  }
};

const deleteOTPDocumentsByEmail = async email => {
  try {
    const querySnapshot = await db
      .collection('reset-password-otp')
      .where('email', '==', email)
      .get();
    if (!querySnapshot.empty) {
      querySnapshot.forEach(snapshot => {
        snapshot.ref.delete();
      });
    }
    return { success: true };
  }
  catch (errorDeleteOTPDocuments) {
    console.error('Something went wrong with deleteOTPDocumentsByEmail', errorDeleteOTPDocuments);
    return { success: false };
  }
};

const getUserIdInFBAuthWithEmail = async email => {
  try {
    const userRecord = await admin
      .auth()
      .getUserByEmail(email);
    if (!userRecord) {
      return null;
    }
    return userRecord.uid;
  } catch (errorGetUserIdInFBAuthWithEmail) {
    console.error(errorGetUserIdInFBAuthWithEmail.message);
    return null;
  }
};

module.exports = {
  getStudentDocumentIdWithEmail,
  getLecturerDocumentIdWithEmail,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
  getUserIdInFBAuthWithEmail,
  userExistsWithEmail,
  userExistsWithId,
};
