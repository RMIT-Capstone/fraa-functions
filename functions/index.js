const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const {generateQrCode} = require('./handlers/qr-code');

app.use(cors());
app.post('/generate_qr_code', generateQrCode);

exports.api = functions.region('asia-northeast1').https.onRequest(app);
