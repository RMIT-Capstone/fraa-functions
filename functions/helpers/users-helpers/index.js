const { db, admin } = require("../../utils/admin");

const userWithEmailExistsInFirestore = async (email) => {
  try {
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (!querySnapshot.empty) return { userExists: true };
    else return { userExists: false };
  } catch (errorCheckUserExistsWithEmail) {
    console.error(
      "Something went wrong with userWithEmailExistsInFirestore: ",
      errorCheckUserExistsWithEmail
    );
    return errorCheckUserExistsWithEmail;
  }
};

const userWithIdExistsInFirestore = async (id) => {
  try {
    const documentSnapshot = await db.collection("users").doc(id).get();

    if (documentSnapshot.exists) return { existsWithId: true };
    else return { existsWithId: false };
  } catch (errorCheckUserExistsWithId) {
    console.error(
      "Something went wrong with userWithIdExistsInFirestore: ",
      errorCheckUserExistsWithId
    );
    return errorCheckUserExistsWithId;
  }
};

const getLatestOTPDocumentOfUser = async (email) => {
  try {
    const querySnapshot = await db
      .collection("reset-password-otp")
      .where("email", "==", email)
      .orderBy("expiryTime", "desc")
      .get();
    if (querySnapshot.empty) return null;
    else return { data: querySnapshot.docs[0].data() };
  } catch (errorGetLatestOTPDocumentOfUser) {
    console.error(
      "Something went wrong with getLatestOTPDocumentOfUser: ",
      errorGetLatestOTPDocumentOfUser
    );
    return errorGetLatestOTPDocumentOfUser;
  }
};

const deleteOTPDocumentsByEmail = async (email) => {
  try {
    const querySnapshot = await db
      .collection("reset-password-otp")
      .where("email", "==", email)
      .get();
    if (!querySnapshot.empty) {
      querySnapshot.forEach((snapshot) => {
        snapshot.ref.delete();
      });
    }
    return { success: true };
  } catch (errorDeleteOTPDocuments) {
    console.error(
      "Something went wrong with deleteOTPDocumentsByEmail",
      errorDeleteOTPDocuments
    );
    return { success: false };
  }
};

const getUserIdInFirestoreWithEmail = async (email) => {
  try {
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (querySnapshot.empty) {
      return { userId: null, errorGetUserId: null };
    }
    return { userId: querySnapshot.docs[0].id, errorGetUserId: null };
  } catch (errorGetUserIdInFirestoreWithEmail) {
    console.error(
      "Something went wrong with getUserIdInFirestoreWithEmail: ",
      errorGetUserIdInFirestoreWithEmail
    );
    return { userId: null, errorGetUserId: null };
  }
};

const getUserIdInFBAuthWithEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
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
