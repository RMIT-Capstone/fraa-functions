const isEmpty = string => {
  if (!string) return true;
  return string.trim() === '';
};

const isEmail = email => {
  let regEx;
  // eslint-disable-next-line no-useless-escape
  regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return Boolean(email.match(regEx));
};

exports.validateAccountData = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Email must not be empty';
  }
  else if (!isEmail(data.email)) {
    errors.email = 'Invalid email address';
  }

  if (isEmpty(data.password)) {
    errors.password = 'Password cannot be empty';
  }
  else if (data.password.length < 6) {
    errors.password = 'Password length must be more than 6 characters';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};
