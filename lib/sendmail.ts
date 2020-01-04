import { SES } from 'aws-sdk';
import { httpResponse, ConfigSet } from './misc';

const sortByKey = (a, b) => a.key.localeCompare(b.key);

/**
 * sendmail handler
 * @param {object} config
 * @param {string} recipient
 */
export default async (configSet: ConfigSet) => {
  const {
    translations,
    recipient,
    recipientForced,
    keys,
    config: {
      config: { domain, sesUser },
      validations,
    },
  } = configSet;

  const { partials, bools } = Object.entries(keys).reduce(
    (red, [k, v]) => {
      if (
        v === undefined ||
        v === '' ||
        validations.validationWhitelist.some(field => field === k)
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
              key: translations[k] || k,
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
          { key: translations[k] || k, value: translations[v] || v },
        ],
      };
    },
    { partials: [], bools: [] }
  );

  const templateData = {
    ...translations,
    ...keys,
    domain,
    from: keys.mail,
    partials: partials.sort(sortByKey),
    bools: bools.sort(sortByKey),
  };

  const params: SES.SendTemplatedEmailRequest = {
    Destination: { ToAddresses: [recipientForced || recipient] },
    ReplyToAddresses: [<string>keys.mail],
    Source: `${translations.form} <${sesUser}@${domain}>`,
    Template: process.env.TEMPLATE_NAME,
    TemplateData: JSON.stringify(templateData),
  };

  // send mail with defined transport object
  const result = {
    presendTimestamp: Date(),
    domain,
    keys,
    config: configSet,
    params: {
      ...params,
      TemplateData: templateData,
    },
  };

  try {
    const res = await new SES({ region: process.env.AWS_SES_REGION })
      .sendTemplatedEmail(params)
      .promise();
    return httpResponse(
      200,
      `Mail sent to ${params.Destination.ToAddresses[0]} (MessageId: "${res.MessageId}")`,
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
