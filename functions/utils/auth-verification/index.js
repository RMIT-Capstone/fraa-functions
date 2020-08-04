const {admin, db} = require('../admin');
module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found!');
    return res.send({error: 'Unauthorized request'});
  }

  return admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection('users')
        .doc(req.user.email)
        .get();
    })
    .then(() => {
      return next();
    })
    .catch(err => {
      return res.send({error: err});
    });
};
