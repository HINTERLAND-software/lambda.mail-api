import { SES } from 'aws-sdk';
import { ConfigSet, parsePartialsAndBooleans } from './misc';
import { httpResponse, Logger } from './utils';

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

  const partialsAndBooleans = parsePartialsAndBooleans(
    keys,
    translations,
    validations.validationWhitelist
  );

  const templateData = {
    ...translations,
    ...keys,
    domain,
    ...partialsAndBooleans,
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
    params: {
      ...params,
      TemplateData: templateData,
    },
    config: configSet,
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
    Logger.error(error);
    return httpResponse(error.statusCode || 400, error.message, {
      error,
      ...result,
    });
  }
};
