import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { prepareConfig, validateRequest } from '@libs/misc';
import sendmail from '@libs/sendmail';
import { KeyValueMap, ParsedConfig } from '@libs/types';
import { Logger } from '@libs/utils';
import 'source-map-support/register';
import schema from './schema';

export const send: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  let { body, pathParameters = {} } = event;
  const { domain } = pathParameters;

  const parsedBody: KeyValueMap =
    typeof body === 'string' ? JSON.parse(body) : body;

  let config: ParsedConfig;
  try {
    config = await prepareConfig(domain, parsedBody);

    const isAuthorized =
      !event.headers.origin ||
      event.headers.origin.includes(config.config.domain);
    validateRequest(config, isAuthorized);
    const { result, response } = await sendmail(config);
    return httpResponse(
      200,
      `Mail sent to ${result.params.Destination.ToAddresses[0]} (MessageId: "${response.MessageId}")`,
      result,
      isAuthorized
    );
  } catch (error) {
    Logger.error(error);
    return httpResponse(error.statusCode, error.message, {
      error,
      body: parsedBody,
      config,
    });
  }
};

export const main = middyfy(send);
