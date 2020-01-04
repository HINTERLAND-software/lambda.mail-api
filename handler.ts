import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { httpResponse, getConfig, ConfigSet } from './lib/misc';
import sendmail from './lib/sendmail';

export declare type KeyValuePairs = {
  [property: string]: string | number | boolean;
};

class ResponseError extends Error {
  code: number;
}

const validateRequest = (config: ConfigSet): void => {
  const {
    keys,
    config: {
      validations: { validationBlacklist, validationRequired },
    },
  } = config;
  const error = new ResponseError();

  // honeypot triggered
  const invalidField = validationBlacklist.filter(field => keys[field]);
  if (invalidField.length) {
    error.message = `Invalid field "${invalidField.join('", "')}" used`;
    error.code = 200;
    throw error;
  }

  // missing required fields
  const missingFields = validationRequired.filter(field => !keys[field]);
  if (missingFields.length) {
    error.message = `No "${missingFields.join('", "')}" field specified`;
    error.code = 400;
    throw error;
  }
};

export const send: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
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
