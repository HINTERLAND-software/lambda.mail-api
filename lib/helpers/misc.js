const fs = require('fs');
const path = require('path');
const { domains, mailgun } = require('../../config');

/**
 * Replace all occurences of placeholders in template specified as key/value pairs
 *
 * @param {object} replaceOptions object with keys to be replaced in template
 * @param {string} templatePath path to template
 */
const processTemplate = (replaceOptions, templatePath) => {
  const template = fs.readFileSync(path.join(__dirname, templatePath)).toString();
  return Object.keys(replaceOptions)
    .reduce(
      (tmp, key) => tmp.replace(new RegExp(`@@${key.toUpperCase()}`, 'g'),
        replaceOptions[key]), template);
};

/**
 * get smtp configuration according to domain
 *
 * @param {string} senderDomain
 */
const getSMTPconfig = (senderDomain) => {
  const config =
    domains.filter(({ domain }) => domain === senderDomain)[0] ||
    domains.filter(domain => domain.default)[0];

  const configDomain = config.domain;

  return {
    configDomain,
    config: Object.assign(
      {}, mailgun,
      {
        auth: Object.assign(
          {}, config, { domain: undefined, default: undefined }
        )
      })
  };
};

module.exports = {
  getSMTPconfig,
  processTemplate
};
