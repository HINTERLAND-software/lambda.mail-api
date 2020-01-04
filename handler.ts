import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import 'source-map-support/register';

import {
  httpResponse,
  getConfig,
  ConfigSet,
  validateRequest,
} from './lib/misc';
import sendmail from './lib/sendmail';

export declare type KeyValuePairs = {
  [property: string]: string | number | boolean;
};

export const send: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let { body, pathParameters = {} } = event;
  const { domain } = pathParameters;

  const parsedBody: KeyValuePairs =
    typeof body === 'string' ? JSON.parse(body) : body;

  let config: ConfigSet;
  try {
    config = getConfig(domain, parsedBody);
    validateRequest(config);
    return sendmail(config);
  } catch (err) {
    console.error(err);
    return httpResponse(err.statusCode, err.message, {
      body: parsedBody,
      config,
    });
  }
};
