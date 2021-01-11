import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';
import { getEnvironment, Logger } from './utils';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

const pick = (input) => {
  if (getEnvironment() === 'production') {
    return {
      domain: input?.config?.config?.domain,
      presendTimestamp: input?.presendTimestamp,
    };
  }
  return input;
};

export const httpResponse = (
  statusCode: number = 400,
  message: string,
  input: any = ''
): APIGatewayProxyResult => {
  Logger.log(JSON.stringify({ statusCode, message, input }, null, 2));
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*',
    },
    body: JSON.stringify({
      message,
      input: pick(input),
    }),
  };
};
