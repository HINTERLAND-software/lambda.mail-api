'use strict';

const { callbackHandler } = require('./lib/helpers/misc');
const sendmail = require('./lib/sendmail');

module.exports.sendmail = (event, context, callback) => {
  const response = callbackHandler(callback);
  return sendmail(event, context, response);
};
