const AWS = require('aws-sdk');

const { httpResponse } = require('./misc');
const { translations } = require('../config');

/**
 * sendmail handler
 * @param {object} config
 * @param {object} keys
 * @param {string} recipient
 */
module.exports = async (config, keys) => {
  const { locale = 'de', mail } = keys;
  const { domain, user, recipient } = config;
  const locales = translations[locale];

  const partials = Object.entries(keys).reduce((red, [k, v]) => {
    if (v === undefined) return red;
    return [...red, { key: locales[k] || k, value: locales[v] || v }];
  }, []);

  const templateData = { partials, ...locales, domain, from: mail, ...keys };

  const params = {
    Destination: { ToAddresses: [recipient] },
    ReplyToAddresses: [mail],
    Source: `${user} <${user}@${domain}>`,
    Template: process.env.TEMPLATE,
    TemplateData: JSON.stringify(templateData),
  };

  // send mail with defined transport object
  const result = {
    presendTimestamp: Date(),
    domain,
    keys,
    config,
    params: { ...params, TemplateData: templateData },
  };

  try {
    const res = await new AWS.SES({ region: 'eu-west-1' })
      .sendTemplatedEmail(params)
      .promise();
    return httpResponse(200, res, result);
  } catch (error) {
    console.error(error);
    return httpResponse(error.statusCode || 400, error.message, {
      error,
      ...result,
    });
  }
};
