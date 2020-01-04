import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Handle the http response
 *
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [input='']
 * @returns {APIGatewayProxyResult}
 */
export const httpResponse = (
  statusCode: number,
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
      input,
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
