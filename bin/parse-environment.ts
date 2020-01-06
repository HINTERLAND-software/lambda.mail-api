import { config } from 'dotenv';
import { camelCase } from 'change-case';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { VALIDATIONS } from '../config';
import { Logger } from '../lib/utils';

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

const initParse = (env: KeyValueMap) => ({
  parseConfig: (i: number): Config => {
    const value = env[`CONFIG_${i}`];
    const config = <Config>{};
    if (value) {
      const [domain, sesUser, receiver] = value.split(' ');
      config.domain = domain;
      config.sesUser = sesUser;
      config.receiver = receiver;
    }
    return config;
  },
  parseValidations: (i: number): Validations => {
    return Object.entries(VALIDATIONS).reduce((parsed, [key, def]) => {
      const keyIndex = `${key}_${i}`;

      const value = env[keyIndex] || env[key] || def;
      if (!value) return parsed;

      const property = camelCase(keyIndex.replace(`_${i}`, ''));

      return {
        ...parsed,
        [property]: Array.isArray(value) ? value : value.split(' '),
      };
    }, <Validations>{});
  },
});

const parse = (env): ParsedDomainConfigs => {
  const { parseConfig, parseValidations } = initParse(env);

  let results = {};
  let index = 0;
  while (true) {
    const config = parseConfig(index);
    const validations = parseValidations(index);

    const parsedConfigs = Object.values(config).filter(Boolean).length;
    if (parsedConfigs !== 3) {
      if (parsedConfigs) {
        Logger.error(
          `Config for "${config.domain}" missing keys - please check environment variables`
        );
        index++;
        continue;
      } else {
        Logger.log(`Parsed ${index} configs`);
        break;
      }
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
  Logger.log(`Parsed environment variables saved to config file "${file}"`);
  // writeFileSync(file, JSON.stringify(parse(process.env), null, 2));
  const parsed = parse(process.env);
  writeFileSync(
    file,
    JSON.stringify(
      { config: parsed, string: `'${JSON.stringify(parsed)}'` },
      null,
      2
    )
  );
}
