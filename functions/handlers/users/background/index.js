const {deleteOTPDocumentsByEmail} = require('../helper');
const {deleteUserInFirestore} = require('../helper');
const {getUserDocumentIdByEmail} = require('../helper');
const {db} = require('../../../utils/admin');

exports.createUserInFirestore = async (req, res) => {
  try {
    const {email, password} = req.body;
    const createUser = await db
      .collection('users')
      .add({
        email,
        createdAt: new Date(),
        firstTimePassword: true,
      });
    if (createUser) {
      console.log(`User with email: ${user.email} created successfully`);
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
