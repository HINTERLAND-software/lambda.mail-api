const fs = require('fs');
const { domains, mailgun, translations } = require('../config');

/**
 * Create partials in template specified as key/value pairs
 *
 * @param {object} keys object with keys to be created in template
 * @param {object} type
 * @param {string} [locale='de'] translation set locale
 * @returns {string}
 */
const processTemplate = (keys, type, locale = 'de') => {
  const template = fs.readFileSync(type.template).toString();
  const partial = fs.readFileSync(type.partial).toString();
  const locales = translations[locale];
  const partials = Object.entries(keys).reduce((str, [key, value]) => {
    const translated = locales[key] || key;
    return `${str}${partial
      .replace('*|_KEY_|*', translated.key || translated)
      .replace('*|_VALUE_|*', translated.value || value)}`;
  }, '');
  const processed = template
    .replace('*|_PARTIALS_|*', partials)
    .replace('*|_FROM_|*', keys.mail)
    .replace('*|_HEADER_|*', locales.header)
    .replace('*|_REPLYBUTTON_|*', locales.replybutton)
    .replace('*|_REPLY_|*', locales.reply);

  // fs.writeFileSync(`./temp.${type.template.includes('.html') ? 'html' : 'txt'}`, processed);
  return processed;
};

/**
 * Handle the callback
 * @param {function} callback
 */
const callbackHandler = callback => (statusCode, message, input = '') => {
  const res = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*'
    },
    body: JSON.stringify({
      message,
      input
    })
  };
  // log to cloudwatch if not test
  if (process.env.NODE_ENV !== 'test') console.log(res);
  return callback(null, res);
};

/**
 * get smtp configuration according to domain
 *
 * @param {string} senderDomain
 * @returns {object}
 */
const getSMTPconfig = (senderDomain) => {
  const { fallback: _, domain: configDomain, ...auth } =
    domains.find(({ domain }) => domain === senderDomain) ||
    domains.find(({ fallback }) => fallback);

  return {
    configDomain,
    config: { ...mailgun, auth }
  };
};

module.exports = {
  callbackHandler,
  getSMTPconfig,
  processTemplate
};
