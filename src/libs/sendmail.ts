import { SES } from 'aws-sdk';
import { parsePartialsAndBooleans } from './parse';
import { KeyValuePairs, ParsedConfig } from './types';

const sendMail = (
  params: SES.SendTemplatedEmailRequest
): Promise<SES.SendTemplatedEmailResponse> => {
  return new SES({ region: process.env.AWS_SES_REGION })
    .sendTemplatedEmail(params)
    .promise();
};

export type Result = {
  presendTimestamp: string;
  domain: string;
  params: Omit<SES.SendTemplatedEmailRequest, 'TemplateData'> & {
    TemplateData: {
      partials: KeyValuePairs[];
      booleans: KeyValuePairs[];
      domain: string;
    };
  };
  config: ParsedConfig;
};

export default async (
  parsedConfig: ParsedConfig
): Promise<{ result: Result; response: SES.SendTemplatedEmailResponse }> => {
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

  const response = await sendMail(params);
  return { result, response };
};
