const QRCode = require('qrcode');
exports.generateQrCode = (req, res) => {
  return QRCode.toDataURL(JSON.stringify(req.body.content), (error, url) => {
    if (error) {
      res.send(error);
    }
    res.send(url);
  });
};
