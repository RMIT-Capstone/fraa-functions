const admin = require('firebase-admin');
const firebase = require('firebase');
const config = require('../../config');

admin.initializeApp(config);
firebase.initializeApp(config);
const db = admin.firestore();

module.exports = {admin, firebase, db};
