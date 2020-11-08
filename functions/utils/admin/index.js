const admin = require('firebase-admin');
const firebase = require('firebase');
const config = require('../../config/FirebaseConfig');

admin.initializeApp(config);
firebase.initializeApp(config);
const db = admin.firestore();
const bucket = admin.storage().bucket('fraa-capstone.appspot.com');

module.exports = { admin, firebase, db, bucket };
