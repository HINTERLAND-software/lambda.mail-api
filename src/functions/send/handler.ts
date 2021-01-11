import 'source-map-support/register';

import { prepareConfig, validateRequest } from '@libs/misc';
import sendmail from '@libs/sendmail';
import { Logger } from '@libs/utils';
import { KeyValueMap, ParsedConfig } from '@libs/types';
import { middyfy } from '@libs/lambda';
import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';

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
    validateRequest(config);
    return sendmail(config);
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
