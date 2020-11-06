const { db } = require('../../../utils/admin');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');

exports.onUserDeleteInAuth = (userRecord) => {
  return deleteUserRecordInFirestore(userRecord);
};

const deleteUserRecordInFirestore = async (record) => {
  const { email } = record;

  try {
    const studentsQuerySnapshot = await db
      .collection('students')
      .where('email', '==', email)
      .get();

    const lecturersQuerySnapshot = await db
      .collection('lecturers')
      .where('email', '==', email)
      .get();


    if (!lecturersQuerySnapshot.empty) {
      await lecturersQuerySnapshot.docs[0].ref.delete();
    }

    if (!studentsQuerySnapshot.empty) {
      await studentsQuerySnapshot.docs[0].ref.delete();
    }
  }
  catch (errorDeleteUserRecordInFirestore) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} deleteUserRecordInFirestore`,
      errorDeleteUserRecordInFirestore
    );
  }
};
