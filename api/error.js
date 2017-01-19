'use strict';

class Error {
  constructor(status, message) {
    this.status = status;
    this.message = message;
  }

  toJSON() {
    return {
      errorMessage: this.message
    };
  }

  writeResponse(res) {
    res.status(this.status).send(this.toJSON());
  }
}

module.exports = Error;
