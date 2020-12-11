const { db, admin } = require('../../utils/admin');

const userWithEmailExistsInFirestore = async (email) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { existsWithEmail: false, errorCheckExists: null };
    }
    return { existsWithEmail: true, errorCheckExists: null };
  } catch (errorCheckUserExistsWithEmail) {
    console.error('Something went wrong with userWithEmailExistsInFirestore: ', errorCheckUserExistsWithEmail);
    return { existsWithEmail: null, errorCheckExists: errorCheckUserExistsWithEmail };
  }
};

const userWithIdExistsInFirestore = async (id) => {
  try {
    const documentSnapshot = await db
      .collection('users')
      .doc(id)
      .get();

    if (documentSnapshot.exists) {
      return { existsWithId: true, errorCheckExists: null };
    }
    return { existsWithId: false, errorCheckExists: null };
  } catch (errorCheckUserExistsWithId) {
    console.error('Something went wrong with userWithIdExistsInFirestore: ', errorCheckUserExistsWithId);
    return { existsWithId: null, errorCheckExists: errorCheckUserExistsWithId };
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
  } catch (errorGetLatestOTPDocumentOfUser) {
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
  } catch (errorDeleteOTPDocuments) {
    console.error('Something went wrong with deleteOTPDocumentsByEmail', errorDeleteOTPDocuments);
    return { success: false };
  }
};

const getUserIdInFirestoreWithEmail = async (email) => {
  try {
    const querySnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return { userId: null, errorGetUserId: null };
    }
    return { userId: querySnapshot.docs[0].id, errorGetUserId: null };
  } catch (errorGetUserIdInFirestoreWithEmail) {
    console.error('Something went wrong with getUserIdInFirestoreWithEmail: ', errorGetUserIdInFirestoreWithEmail);
    return { userId: null, errorGetUserId: null };
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
  userWithEmailExistsInFirestore,
  userWithIdExistsInFirestore,
  getLatestOTPDocumentOfUser,
  deleteOTPDocumentsByEmail,
  getUserIdInFirestoreWithEmail,
  getUserIdInFBAuthWithEmail,
};
