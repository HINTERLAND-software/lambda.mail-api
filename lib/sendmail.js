const AWS = require('aws-sdk');

const { httpResponse } = require('./misc');

/**
 * sendmail handler
 * @param {object} config
 * @param {object} keys
 * @param {string} recipient
 */
module.exports = async config => {
  const { domain, user, locales, recipient, recipientForced, keys } = config;

  const partials = Object.entries(keys)
    .reduce((red, [k, v]) => {
      if (v === undefined) return red;
      return [...red, { key: locales[k] || k, value: locales[v] || v }];
    }, [])
    .sort((a, b) => a.key.localeCompare(b.key));

  const templateData = {
    partials,
    ...locales,
    domain,
    from: keys.mail,
    ...keys,
  };

  const params = {
    Destination: { ToAddresses: [recipientForced || recipient] },
    ReplyToAddresses: [keys.mail],
    Source: `${locales.form} <${user}@${domain}>`,
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
