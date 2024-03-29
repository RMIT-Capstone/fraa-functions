const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateOTPCode = () => {
  const OTP_LENGTH = 6;
  return Array.apply(null, { length: OTP_LENGTH }).map(() => getRandomInt(0, 9)).join('');
};

const numberIsEmpty = number => {
  if (typeof number !== 'number') {
    return true;
  }
  // else if (!Number.isInteger(number)) {
  //   return true;
  // }
  return false;
};

const stringIsEmpty = string => {
  if (typeof string !== 'string' || !string) return true;
  return string.trim() === '';
};

const booleanIsMissing = bool => {
  return bool === undefined || typeof bool !== 'boolean';
};

const objectIsMissing = object => {
  return object === undefined || typeof object !== 'object';
};

const arrayIsMissing = array => {
  return array === undefined || !Array.isArray(array);
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
  numberIsEmpty,
  stringIsEmpty,
  booleanIsMissing,
  objectIsMissing,
  arrayIsMissing,
  isEmail,
};
