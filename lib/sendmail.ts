import { SES } from 'aws-sdk';
import { httpResponse, Logger } from './utils';
import { ParsedConfig } from '../types';
import { parsePartialsAndBooleans } from './parse';

const sendMail = (
  params: SES.SendTemplatedEmailRequest
): Promise<SES.SendTemplatedEmailResponse> => {
  return new SES({ region: process.env.AWS_SES_REGION })
    .sendTemplatedEmail(params)
    .promise();
};

export default async (parsedConfig: ParsedConfig) => {
  const {
    translations,
    recipient,
    recipientForced,
    keys,
    validations,
    config: { domain, sesUser },
  } = parsedConfig;

  const partialsAndBooleans = parsePartialsAndBooleans(
    keys,
    translations,
    validations.whitelist
  );

  const templateData = {
    ...translations,
    ...keys,
    domain,
    ...partialsAndBooleans,
  };

  const params: SES.SendTemplatedEmailRequest = {
    Destination: { ToAddresses: [recipientForced || recipient] },
    ReplyToAddresses: [keys.mail as string],
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
    config: parsedConfig,
  };

  try {
    const res = await sendMail(params);
    return httpResponse(
      200,
      `Mail sent to ${params.Destination.ToAddresses[0]} (MessageId: "${res.MessageId}")`,
      result
    );
  } catch (error) {
    Logger.error(error);
    return httpResponse(error.statusCode, error.message, {
      error,
      ...result,
    });
  }
};
