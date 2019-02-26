'use strict';

const { httpResponse, getConfig } = require('./lib/misc');

const sendmail = require('./lib/sendmail');

const validateRequest = (config, body) => {
  const error = new Error();
  const {
    validationFields: { invalid, required },
  } = config;

  // honeypot triggered
  const invalidField = invalid.filter(field => body[field]);
  if (invalidField.length) {
    error.message = `Invalid field "${invalidField.join('", "')}" used`;
    error.statusCode = 200;
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

module.exports.send = async (event = {}) => {
  let { body, pathParameters } = event;
  body = typeof body === 'string' ? JSON.parse(body) : body;

  const domain =
    typeof pathParameters === 'string'
      ? JSON.parse(pathParameters).domain
      : pathParameters.domain;

  const { mail, name, surname, ...rest } = body;
  const keys = { ...rest, name: `${name} ${surname || ''}`, mail };

  let config;
  try {
    config = getConfig(domain, keys);
    validateRequest(config, body);
    return sendmail(config, keys);
  } catch (err) {
    console.error(err);
    return httpResponse(err.statusCode, err.message, { body, config });
  }
};
