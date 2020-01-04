import { config } from 'dotenv';
import { camelCase } from 'change-case';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

enum EnvVars {
  Config = 'config',
  Validations = 'validations',
}

const envVars = {
  [EnvVars.Config]: ['DOMAIN', 'RECEIVER', 'SES_USER'],
  [EnvVars.Validations]: [
    'OVERRIDE_FOR',
    'VALIDATION_BLACKLIST',
    'VALIDATION_WHITELIST',
    'VALIDATION_REQUIRED',
  ],
};

declare type KeyValueMap = {
  [property: string]: string;
};

export declare type Config = {
  domain: string;
  receiver: string;
  sesUser: string;
};

export declare type Validations = {
  overrideFor: string[];
  validationBlacklist: string[];
  validationWhitelist: string[];
  validationRequired: string[];
};

export declare type DomainConfig = {
  index: number;
  config: Config;
  validations: Validations;
};

export declare type ParsedDomainConfigs = {
  [property: string]: DomainConfig;
};

const initParse = (env: KeyValueMap) => (
  envVar: EnvVars,
  i: number
): Config | Validations => {
  const keys = envVars[envVar];

  const parsed = keys.reduce((parsed, key) => {
    const keyIndex = `${key}_${i}`;
    const value = env[keyIndex] || env[key];

    if (!value) return parsed;

    const property = camelCase(keyIndex.replace(`_${i}`, ''));

    return {
      ...parsed,
      [property]: envVar === EnvVars.Validations ? value.split(' ') : value,
    };
  }, {});

  return <Config | Validations>parsed;
};

const parse = (env): ParsedDomainConfigs => {
  const parseKeys = initParse(env);

  let results = {};
  let index = 0;
  while (true) {
    const config = <Config>parseKeys(EnvVars.Config, index);
    const validations = <Validations>parseKeys(EnvVars.Validations, index);

    const parsedConfigs = Object.keys(config).length;
    if (parsedConfigs !== envVars[EnvVars.Config].length) {
      parsedConfigs &&
        console.error(
          `Config for "${config.domain}" missing keys - please check environment`
        );
      break;
    }

    results = {
      ...results,
      [config.domain]: {
        index,
        config,
        validations,
      },
    };

    index++;
  }

  return results;
};

export default parse;

if (process.env.CREATE_CONFIG_FILE === '1') {
  config();
  const file = resolve(__dirname, '..', '.env.json');
  console.log(`Parsed environment variables saved to config file "${file}"`);
  writeFileSync(file, JSON.stringify(parse(process.env), null, 2));
}
