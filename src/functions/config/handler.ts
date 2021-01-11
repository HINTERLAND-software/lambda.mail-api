import 'source-map-support/register';

import { getConfig } from '@libs/misc';
import { Logger, getEnvironment } from '@libs/utils';
import { middyfy } from '@libs/lambda';
import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';

export const config: ValidatedEventAPIGatewayProxyEvent<typeof Object> = async (
  event
) => {
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

export const main = middyfy(config);
