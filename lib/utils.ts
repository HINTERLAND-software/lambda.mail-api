import { APIGatewayProxyResult } from 'aws-lambda';
import { filterXSS } from 'xss';

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

export class Logger {
  static log(message?: any, ...optionalParams: any[]) {
    process.env.NODE_ENV !== 'test' && console.log(message, ...optionalParams);
  }
  static info(message?: any, ...optionalParams: any[]) {
    process.env.NODE_ENV !== 'test' && console.info(message, ...optionalParams);
  }
  static warn(message?: any, ...optionalParams: any[]) {
    process.env.NODE_ENV !== 'test' && console.warn(message, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }
}

export const sanitizeString = (source: string): string => {
  return filterXSS(source);
};

export const getEnvironment = () => {
  const { STAGE, NODE_ENV = 'development' } = process.env;
  return STAGE || NODE_ENV;
};
