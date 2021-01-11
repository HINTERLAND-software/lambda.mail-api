import { filterXSS } from 'xss';

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
