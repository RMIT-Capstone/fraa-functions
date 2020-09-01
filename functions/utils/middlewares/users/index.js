const USERS_ROUTES = require('../../../routes/users');
const {getUserDocumentIdWithId, lecturerAlreadyExistsWithEmail, validateAccountData} = require('./helper');

module.exports = async (req, res, next) => {
  const path = req.path.split('/')[1];

  if (path === USERS_ROUTES.CREATE_USER || path === USERS_ROUTES.SIGN_IN || path === USERS_ROUTES.CHANGE_PASSWORD) {
    const {email, password} = req.body;
    const {exists} = await getUserDocumentIdWithId(email);
    if (exists) return res.json({error: `User already exists with email: ${email}`});
    const {errors, valid} = validateAccountData(email, password);
    if (!valid) return res.json({errors});
  }

  if (path === USERS_ROUTES.GENERATE_OTP || path === USERS_ROUTES.VERIFY_OTP) {
    const {email} = req.body;
    const {exists} = await getUserDocumentIdWithId(email);
    if (!exists) return res.json({error: `User with email: ${email} does not exist`});
  }

  if (path === USERS_ROUTES.CREATE_LECTURER) {
    const {email, password, name, school} = req.body;
    if (!name) return res.json({error: 'Must include name'});
    if (!school) return res.json({error: 'Must include school'});
    const {exists: userExists} = await getUserDocumentIdWithId(email);
    if (userExists) return res.json({error: `User already exists with email: ${email}`});
    const {exists: lecturerExists} = await lecturerAlreadyExistsWithEmail(email);
    if (lecturerExists) return res.json({error: `Lecturer already exists with email: ${email}`});
    const {errors, valid} = validateAccountData(email, password);
    if (!valid) return res.json({errors});
  }

  return next();
};
