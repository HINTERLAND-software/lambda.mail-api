const AWS = require('aws-sdk');

const { httpResponse } = require('./misc');
const { defaults } = require('../config');

/**
 * sendmail handler
 * @param {object} config
 * @param {object} keys
 * @param {string} recipient
 */
module.exports = async config => {
  const { domain, user, locales, recipient, recipientForced, keys } = config;

  const { partials, bools } = Object.entries(keys).reduce(
    (red, [k, v]) => {
      if (
        v === undefined ||
        v === '' ||
        defaults.validationFields.ignore.some(field => field === k)
      ) {
        return red;
      }
      if (v === true || v === 'true' || v === false || v === 'false') {
        const bool = v === 'true' ? true : v === 'false' ? false : v;
        return {
          ...red,
          bools: [
            ...red.bools,
            {
              key: locales[k] || k,
              value: bool
                ? '<span style="color: green;">&#10004;</span>'
                : '<span style="color: red;">&#10060;</span>',
            },
          ],
        };
      }
      return {
        ...red,
        partials: [
          ...red.partials,
          { key: locales[k] || k, value: locales[v] || v },
        ],
      };
    },
    { partials: [], bools: [] }
  );

  const templateData = {
    partials: partials.sort((a, b) => a.key.localeCompare(b.key)),
    bools: bools.sort((a, b) => a.key.localeCompare(b.key)),
    ...locales,
    domain,
    from: keys.mail,
    ...keys,
  };

  const params = {
    Destination: { ToAddresses: [recipientForced || recipient] },
    ReplyToAddresses: [keys.mail],
    Source: `${locales.form} <${user}@${domain}>`,
    Template: process.env.TEMPLATE_NAME,
    TemplateData: JSON.stringify(templateData),
  };

  // send mail with defined transport object
  const result = {
    presendTimestamp: Date(),
    domain,
    keys,
    config,
    params: {
      ...params,
      TemplateData: templateData,
    },
  };

  try {
    const res = await new AWS.SES({ region: process.env.AWS_SES_REGION })
      .sendTemplatedEmail(params)
      .promise();
    return httpResponse(
      200,
      `Mail sent to ${params.Destination.ToAddresses[0]} (MessageId: "${
        res.MessageId
      }")`,
      result
    );
  } catch (error) {
    console.error(error);
    return httpResponse(error.statusCode || 400, error.message, {
      error,
      ...result,
    });
  }
};
