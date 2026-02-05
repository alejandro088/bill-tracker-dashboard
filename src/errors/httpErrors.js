class HTTPError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends HTTPError {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

class NotFoundError extends HTTPError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends HTTPError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export { HTTPError, ValidationError, NotFoundError, UnauthorizedError };
