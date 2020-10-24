const {db} = require('../../../utils/admin');
const ERROR_MESSAGES = require('../../constants/ErrorMessages');

exports.onUserDeleteInAuth = (userRecord) => {
  return deleteUserRecordInFirestore(userRecord);
};

const deleteUserRecordInFirestore = async (record) => {
  const { email } = record;

  try {
    const querySnapshots = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    await querySnapshots.docs[0].ref.delete();
  }
  catch (errorDeleteUserRecordInFirestore) {
    console.error(
      `${ERROR_MESSAGES.GENERIC_CONSOLE_ERROR_MESSAGE} deleteUserRecordInFirestore`,
      errorDeleteUserRecordInFirestore
    );
  }
};
