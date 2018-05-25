'use strict';

const { callbackHandler, getSMTPconfig } = require('./lib/misc');
const SmtpTransport = require('./lib/smtpmailer');
const {
  self, domains, fields, forced
} = require('./config');

const sendmail = require('./lib/sendmail');

module.exports.sendmail = (event, context, callback) => {
  const response = callbackHandler(callback);

  const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const {
    receiver = self, name, surname, domain, ...rest
  } = payload;

  const recipient =
    (process.env.STAGE === 'production' || process.env.NODE_ENV === 'test') &&
    !forced.find(f => receiver.includes(f))
      ? receiver
      : self;

  const keys = { ...rest, name: `${name}${surname ? ` ${surname}` : ''}` };

  // honeypot triggered
  const invalidField = fields.invalid.filter(field => payload[field]);
  if (invalidField.length) {
    console.log(`Invalid field "${invalidField.join('", "')}" used`);
    return response(200, 'Honey mail sent');
  }

  // wrong recipient
  const invalidRecipient = !domains.find(({ domain: d }) => d === recipient.split('@')[1]);
  if (invalidRecipient) {
    return response(400, `Invalid recipient: "${recipient}"`, event);
  }

  const requiredFields = fields.required.filter(field => !payload[field]);
  if (requiredFields.length) {
    return response(400, `No "${requiredFields.join('", "')}" field specified`);
  }

  const smtpConfig = getSMTPconfig(domain);
  const smtpTransport = new SmtpTransport(smtpConfig.config);

  sendmail(smtpConfig, smtpTransport, keys, recipient)
    .then(({ statusCode, message, result }) => response(statusCode, message, result))
    .catch(err => response(err.statusCode || 400, err.message, err));
};
