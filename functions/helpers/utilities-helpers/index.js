const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateOTPCode = () => {
  const OTP_LENGTH = 6;
  return Array.apply(null, { length: OTP_LENGTH }).map(() => getRandomInt(0, 9)).join('');
};

const stringIsEmpty = string => {
  if (!(typeof string === 'string') || !string) return true;
  return string.trim() === '';
};

const isEmail = email => {
  let regEx;
  // eslint-disable-next-line no-useless-escape,max-len
  regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return Boolean(email.match(regEx));
};

module.exports = {
  getRandomInt,
  generateOTPCode,
  stringIsEmpty,
  isEmail,
};
