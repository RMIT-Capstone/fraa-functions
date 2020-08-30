const USERS_ROUTES = require('../../../routes/users');
const {userAlreadyExistsWithEmail} = require('./helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER) {
    const {email} = req.body;
    const {exists} = userAlreadyExistsWithEmail(email);
    if (exists) return res.json({error: `User already exists with email: ${email}`});
  }

  return next();
};
