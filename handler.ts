import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import 'source-map-support/register';

import { prepareConfig, validateRequest } from './lib/misc';
import sendmail from './lib/sendmail';
import { Logger, httpResponse } from './lib/utils';
import { KeyValueMap, ParsedConfig } from './types';

export const send: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
