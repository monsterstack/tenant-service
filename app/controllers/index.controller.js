'use strict';

const getIndex = (app) => {
  return (req, res) => {
    res.render('index');
  }
}

/* Public */
exports.getIndex = getIndex;
