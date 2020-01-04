import { translations } from '../config';
import { APIGatewayProxyResult } from 'aws-lambda';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import parseEnvironment, {
  ParsedDomainConfigs,
  DomainConfig,
} from '../bin/parse-environment';
import { config as dotEnv } from 'dotenv';
import { KeyValuePairs } from '../handler';

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
  // log to cloudwatch if not test
  if (process.env.NODE_ENV !== 'test') {
    console.log(JSON.stringify({ statusCode, message, input }, null, 2));
  }
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

/**
 * Load config from file or environment
 *
 * @returns {ParsedDomainConfigs}
 */
const checkForConfig = (): ParsedDomainConfigs => {
  const envFile = resolve(__dirname, '..', '.env.json');
  if (existsSync(envFile)) {
    return JSON.parse(readFileSync(envFile, 'utf-8'));
  }
  dotEnv();
  return parseEnvironment(process.env);
};

/**
 * Get the fallback of the configuration
 *
 * @param {ParsedDomainConfigs} config
 * @returns {DomainConfig}
 */
const getFallback = (config: ParsedDomainConfigs): DomainConfig => {
  const [key] = Object.entries(config).find(([, value]) => value.index === 0);
  return config[key];
};

export declare type ConfigSet = {
  keys: KeyValuePairs;
  translations: KeyValuePairs;
  environment: string;
  recipient: string;
  recipientForced: string | undefined;
  config: DomainConfig;
};

/**
 * Get configuration set according to domain
 *
 * @param {string} domain
 * @param {KeyValuePairs} keys
 * @returns {ConfigSet}
 */
export const getConfig = (domain: string, keys: KeyValuePairs): ConfigSet => {
  const envConfig = checkForConfig();
  const fallback = getFallback(envConfig);
  const self = `${fallback.config.receiver}@${fallback.config.domain}`;

  const senderConfig = envConfig[domain];
  if (!senderConfig) throw new Error(`Domain "${domain}" not set up`);

  const { mail = self } = keys;
  const locales = translations[process.env.LOCALE] || translations.en;

  const environment =
    process.env.JEST_WORKER_ID !== undefined ? 'test' : process.env.STAGE;

  const {
    validations: { overrideFor = [] },
    config: { receiver },
  } = senderConfig;

  const recipient = `${receiver}@${domain}`;

  const overrideRecipient = overrideFor.some(o => (<string>mail).includes(o));
  let recipientForced;
  if (overrideRecipient || !environment.match(/(production|test)/i)) {
    recipientForced = self;
  }

  return {
    keys: { ...keys, mail },
    translations: locales,
    environment,
    recipient,
    recipientForced,
    config: senderConfig,
  };
};

class ResponseError extends Error {
  code: number;
}

export const validateRequest = (config: ConfigSet): void => {
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
