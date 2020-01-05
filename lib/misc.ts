import { translations } from '../config';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import parseEnvironment, {
  ParsedDomainConfigs,
  DomainConfig,
} from '../bin/parse-environment';
import { config as dotEnv } from 'dotenv';
import { KeyValueMap } from '../handler';

/**
 * Load config from file or environment
 *
 * @returns {ParsedDomainConfigs}
 */
export const parseConfig = (): ParsedDomainConfigs => {
  const envFile = resolve(__dirname, '..', '.env.json');
  let parsedConfig: ParsedDomainConfigs;
  const { STRINGIFIED_CONFIG } = process.env;
  if (STRINGIFIED_CONFIG) {
    parsedConfig = JSON.parse(
      STRINGIFIED_CONFIG.slice(1, STRINGIFIED_CONFIG.length - 1)
    );
  } else if (existsSync(envFile)) {
    parsedConfig = JSON.parse(readFileSync(envFile, 'utf-8'));
  } else {
    dotEnv();
    parsedConfig = parseEnvironment(process.env);
  }
  if (!parsedConfig || !Object.keys(parsedConfig).length) {
    throw new Error('No domain configurations found');
  }
  return parsedConfig;
};

/**
 * Get the fallback (lowest index) of the configuration
 *
 * @param {ParsedDomainConfigs} config
 * @returns {DomainConfig}
 */
const getFallback = (config: ParsedDomainConfigs): DomainConfig => {
  const { value } = Object.values(config).reduce(
    (red, value) => {
      if (value.index > red.lowestIndex) return red;
      return { value, lowestIndex: value.index };
    },
    { value: null, lowestIndex: Object.keys(config).length }
  );
  if (!value) throw new Error('No fallback config found');
  return value;
};

export declare type ConfigSet = {
  keys: KeyValueMap;
  translations: KeyValueMap;
  environment: string;
  recipient: string;
  recipientForced: string | undefined;
  config: DomainConfig;
};

/**
 * Get configuration set according to domain
 *
 * @param {string} domain
 * @param {KeyValueMap} keys
 * @returns {ConfigSet}
 */
export const getConfig = (domain: string, keys: KeyValueMap): ConfigSet => {
  const envConfig = parseConfig();
  const fallback = getFallback(envConfig);
  const self = `${fallback.config.receiver}@${fallback.config.domain}`;

  const senderConfig = envConfig[domain];
  if (!senderConfig) throw new Error(`Domain "${domain}" not set up`);

  const { mail = self } = keys;
  const locales =
    translations[
      process.env.LOCALE ? process.env.LOCALE.toLowerCase() : 'en'
    ] || translations.en;

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

export declare type KeyValuePairs = {
  key: string;
  value: string | number | boolean;
};

declare type PartialsAndBooleans = {
  partials: KeyValuePairs[];
  booleans: KeyValuePairs[];
};

const sort = (array: KeyValuePairs[]): KeyValuePairs[] =>
  array.sort((a, b) => a.key.localeCompare(b.key));

export const parsePartialsAndBooleans = (
  keys: KeyValueMap,
  translations: KeyValueMap,
  ignoredKeys: string[]
): PartialsAndBooleans => {
  const { partials, booleans } = Object.entries(keys).reduce(
    (partialsAndBooleans, [k, v]) => {
      if (
        v === undefined ||
        v === '' ||
        v === null ||
        ignoredKeys.some(field => field === k)
      ) {
        return partialsAndBooleans;
      }

      if (v === true || v === 'true' || v === false || v === 'false') {
        const bool = v === 'true' ? true : v === 'false' ? false : v;
        return {
          ...partialsAndBooleans,
          booleans: [
            ...partialsAndBooleans.booleans,
            {
              key: translations[k] || k,
              value: bool
                ? '<span style="color: green;">&#10004;</span>'
                : '<span style="color: red;">&#10060;</span>',
            },
          ],
        };
      }

      return {
        ...partialsAndBooleans,
        partials: [
          ...partialsAndBooleans.partials,
          { key: translations[k] || k, value: translations[v] || v },
        ],
      };
    },
    { partials: [], booleans: [] }
  );

  return {
    partials: sort(partials),
    booleans: sort(booleans),
  };
};
