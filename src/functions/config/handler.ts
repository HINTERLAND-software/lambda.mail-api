import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { getConfig } from '@libs/misc';
import { getEnvironment, Logger } from '@libs/utils';
import 'source-map-support/register';

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
