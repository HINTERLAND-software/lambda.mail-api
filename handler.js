'use strict';

const { httpResponse, getConfig } = require('./lib/misc');
const { domains } = require('./config');

const sendmail = require('./lib/sendmail');

const validateRequest = (config, body) => {
  const error = new Error();
  const {
    validationFields: { invalid, required },
    recipient,
  } = config;

  // honeypot triggered
  const invalidField = invalid.filter(field => body[field]);
  if (invalidField.length) {
    error.message = `Invalid field "${invalidField.join('", "')}" used`;
    error.statusCode = 200;
  }

  // wrong recipient
  const invalidRecipient = !domains.find(
    ({ domain: d }) => d === recipient.split('@')[1]
  );
  if (invalidRecipient) {
    error.message = `Invalid recipient: "${recipient}"`;
  }

  // missing required fields
  const requiredFields = required.filter(field => !body[field]);
  if (requiredFields.length) {
    error.message = `No "${requiredFields.join('", "')}" field specified`;
  }
  if (error.message) {
    error.statusCode = error.statusCode || 400;
    throw error;
  }
};

module.exports.sendmail = async (event = {}) => {
  const body =
    typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const { receiver, name, surname, domain, ...rest } = body;
  const keys = { ...rest, name: `${name} ${surname || ''}` };
  const config = getConfig(domain, receiver);

  try {
    validateRequest(config, body);
    return sendmail(config, keys);
  } catch (err) {
    console.error(err);
    return httpResponse(err.statusCode, err.message, { body, config });
  }
};
