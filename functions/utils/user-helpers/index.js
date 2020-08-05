const stringIsEmpty = string => {
  if (!(typeof string === 'string')) return true;
  return string.trim() === '';
};

const isEmail = email => {
  let regEx;
  // eslint-disable-next-line no-useless-escape,max-len
  regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return Boolean(email.match(regEx));
};

exports.validateAccountData = data => {
  let errors = {};

  validateEmailData(data.email, errors);
  validatePasswordData(data.password, errors);

  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

const validateEmailData = (email, errors) => {
  if (stringIsEmpty(email)) {
    errors.email = 'Email must not be empty';
  }
  else if (!isEmail(email)) {
    errors.email = 'Invalid email address';
  }
};

const validatePasswordData = (password, errors) => {
  if (stringIsEmpty(password)) errors.password = 'Password must not be empty';
  else if (password.length < 6) errors.password = 'Password length must be more than 6 characters';
};
