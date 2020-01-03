import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { httpResponse, getConfig } from './lib/misc';
import sendmail from './lib/sendmail';

class ResponseError extends Error {
  code: number;
}

const validateRequest = (config, body) => {
  const error = new ResponseError();
  const {
    validationFields: { invalid, required },
  } = config;

  // honeypot triggered
  const invalidField = invalid.filter(field => body[field]);
  if (invalidField.length) {
    error.message = `Invalid field "${invalidField.join('", "')}" used`;
    error.code = 200;
    throw error;
  }

  // missing required fields
  const requiredFields = required.filter(field => !body[field]);
  if (requiredFields.length) {
    error.message = `No "${requiredFields.join('", "')}" field specified`;
    error.code = 400;
    throw error;
  }
};

export const send: APIGatewayProxyHandler = async event => {
  let { body, pathParameters = {} } = event;
  const parsedBody = <object>(
    (typeof body === 'string' ? JSON.parse(body) : body)
  );

  const { domain } = pathParameters;

  const { mail, name, surname, ...rest } = <any>parsedBody;
  const keys = { ...rest, name: `${name} ${surname || ''}`, mail };

  let config;
  try {
    config = getConfig(domain, keys);
    validateRequest(config, parsedBody);
    return sendmail(config);
  } catch (err) {
    console.error(err);
    return httpResponse(err.statusCode, err.message, {
      body: parsedBody,
      config,
    });
  }
};
