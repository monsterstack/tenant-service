'use strict';
const model = require('tenant-model').model;

class UserService {

  findUserById(id) {
    return model.findUser(id);
  }

  findUserByUsername(username) {
    return model.findUserByUsername(username);
  }

  saveUser(user) {
    return model.saveUser(user);
  }

  updateUser(user) {
    return model.updateUser(user);
  }
}

module.exports.UserService = UserService;
