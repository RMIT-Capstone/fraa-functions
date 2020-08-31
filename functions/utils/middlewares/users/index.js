const USERS_ROUTES = require('../../../routes/users');
const {userAlreadyExistsWithEmail, validateAccountData} = require('./helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER || path === USERS_ROUTES.SIGN_IN) {
    const {email, password} = req.body;
    const {exists} = await userAlreadyExistsWithEmail(email);
    if (exists) {
      return res.json({error: `User already exists with email: ${email}`});
    }
    const {errors, valid} = validateAccountData(email, password);
    if (!valid) return res.json({errors});
  }

  if (path === USERS_ROUTES.GENERATE_OTP) {
    const {email} = req.body;
    const {exists} = await userAlreadyExistsWithEmail(email);
    if (!exists) return res.json({error: `User with email: ${email} does not exist`});
  }

  return next();
};
