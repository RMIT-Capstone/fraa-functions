class schemaError extends Error {
  constructor (message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}
class MissingObjectError extends Error {
  constructor (message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Must include ' + message;
  }
}

class CourseRetrieveError extends Error {
  constructor (message = 'Error retrieving course document id with code.') {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

class DuplicatedError extends Error {
  constructor (message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message + ' already exists';
  }
}

class NotExisted extends Error {
  constructor (message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message + ' is not existed';
  }
}

module.exports = {
  schemaError,
  MissingObjectError,
  CourseRetrieveError,
  DuplicatedError,
  NotExisted
};
