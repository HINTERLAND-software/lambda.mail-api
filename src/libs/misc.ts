import { SSM } from 'aws-sdk';
import { Config, KeyValueMap, ParsedConfig, Translations } from './types';
import { getEnvironment } from './utils';

export const fetchSSM = async (path: string): Promise<string | undefined> => {
  const { AWS_REGION: region, AWS_SSM_PREFIX: prefix } = process.env;
  const ssm = new SSM({ region });
  const result = await ssm
    .getParameter({ Name: `${prefix}${path}`, WithDecryption: true })
    .promise();
  return result.Parameter.Value;
};

export const fetchConfig = (domain: string): Promise<string> => {
  return fetchSSM(`/config/${domain}`);
};

export const parseConfig = (config: string): Config => {
  let parsed: Config;
  try {
    parsed = JSON.parse(config) as Config;
  } catch (error) {
    throw new Error('Misshaped domain config');
  }
  return parsed;
};

export const getConfig = async (domain: string): Promise<Config> => {
  const configString = await fetchConfig(domain);
  const config = parseConfig(configString);

  if (!config.config.domain) {
    throw new Error(`No configuration found for domain "${domain}"`);
  }
  return config;
};

export const fetchTranslations = (locale: string): Promise<string> => {
  return fetchSSM(`/translations/${locale}`);
};

export const parseTranslations = (translations: string): Translations => {
  let parsed: Translations;
  try {
    parsed = JSON.parse(translations) as Translations;
  } catch (error) {
    throw new Error('Misshaped translation set');
  }
  return parsed;
};

export const getTranslations = async (
  locale: string
): Promise<Translations> => {
  const translationsString = await fetchTranslations(locale);
  const translations = parseTranslations(translationsString);

  if (!translations || Object.keys(translations).length <= 0) {
    throw new Error(`No translations found for locale "${locale}"`);
  }
  return translations;
};

export const getOverrides = (
  overrideFor: Array<string>,
  mail: string,
  fallback: string
) => {
  const overrideRecipient = overrideFor.some((override) =>
    (mail as string).includes(override)
  );
  if (overrideRecipient || !getEnvironment().match(/(production|test)/i)) {
    return fallback;
  }
};

export const prepareConfig = async (
  domain: string,
  keys: KeyValueMap
): Promise<ParsedConfig> => {
  const { config, locale, fallback, overrideFor, validations } =
    await getConfig(domain);
  const translations = await getTranslations(locale);

  const { mail = fallback } = keys;

  const recipient = `${config.receiver}@${config.domain}`;
  const recipientForced = getOverrides(overrideFor, `${mail}`, fallback);

  return {
    keys: { ...keys, mail },
    translations,
    validations,
    recipient,
    recipientForced,
    config,
  };
};

class ResponseError extends Error {
  code: number;
}

export const validateRequest = (
  config: ParsedConfig,
  isAuthorized: boolean = true
): void => {
  const {
    keys,
    validations: { blacklist, required },
  } = config;
  const error = new ResponseError();

  // honeypot triggered
  const invalidField = blacklist.filter((field) => keys[field]);
  if (invalidField.length) {
    error.message = `Invalid field "${invalidField.join('", "')}" used`;
    error.code = 200;
    throw error;
  }

  // missing required fields
  const missingFields = required.filter((field) => !keys[field]);
  if (missingFields.length) {
    error.message = `No "${missingFields.join('", "')}" field specified`;
    error.code = 400;
    throw error;
  }

  if (!isAuthorized) {
    error.message = `Unauthorized`;
    error.code = 401;
    throw error;
  }
};
