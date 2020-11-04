import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import 'source-map-support/register';

import { getConfig, prepareConfig, validateRequest } from './lib/misc';
import sendmail from './lib/sendmail';
import { Logger, httpResponse, getEnvironment } from './lib/utils';
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

export const config: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { domain } = event.pathParameters;

    const configuration = await getConfig(domain);
    const env = getEnvironment();

    return httpResponse(200, 'Configuration results', {
      env,
      configuration,
    });
  } catch (error) {
    Logger.error(error);
    return httpResponse(error.statusCode, error.message, error);
  }
};
