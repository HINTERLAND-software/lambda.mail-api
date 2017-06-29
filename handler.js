'use strict';

const CallbackHandler = require('./lib/helpers/callback');
const sendmail = require('./lib/sendmail');

module.exports.sendmail = (event, context, callback) => {
  const callbackHandler = CallbackHandler(callback);
  return sendmail(event, context, callbackHandler.response);
};
