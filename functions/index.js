const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const QRCode = require('qrcode');

app.use(cors());

app.get('/generate_qr_code', (req, res) => {
  const data = [{
    content: 'Cop'
  }];
  QRCode.toDataURL(JSON.stringify(data), (error, url) => {
    if (error) res.send(error);
    res.send(url)
  })
  // res.send('Hello world!')
});

exports.api = functions.region('asia-northeast1').https.onRequest(app);
