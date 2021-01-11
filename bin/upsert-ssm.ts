import { SSM } from 'aws-sdk';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '../src/libs/utils';
import { Config, Defaults, Settings, Translations } from '../src/libs/types';

config();

const { AWS_REGION, ENV } = process.env;

const ssm = new SSM({ region: AWS_REGION });

const { name } = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8')
);
const PREFIX = `/${name}/${ENV}`;

const upsertParameter = async (
  name: string,
  value: string,
  overrides: any = {}
): Promise<any> => {
  const params: SSM.PutParameterRequest = {
    Type: 'SecureString',
    Overwrite: true,
    Name: name,
    Value: value,
    Tier: 'Standard',
    ...overrides,
  };
  return {
    Name: name,
    Type: params.Type,
    ...(await ssm.putParameter(params).promise()),
  };
};

const upsertDomains = async (
  { validations, config, ...rest }: Config,
  defaults: Defaults
): Promise<any> => {
  const sanitizedConfig: Config = {
    ...defaults,
    ...rest,
    config,
    validations: {
      ...defaults.validations,
      ...validations,
    },
  };
  return upsertParameter(
    `${PREFIX}/config/${config.domain}`,
    JSON.stringify(sanitizedConfig)
  );
};

const upsertTranslations = async (
  locale: string,
  translations: Translations
): Promise<any> => {
  return upsertParameter(
    `${PREFIX}/translations/${locale}`,
    JSON.stringify(translations),
    { Type: 'String' }
  );
};

const upsert = async () => {
  const configString = readFileSync(
    resolve(__dirname, '../.config.json'),
    'utf-8'
  );
  const { defaults, configs, dictionary } = JSON.parse(
    configString
  ) as Settings;

  return {
    configs: await Promise.all(
      configs.map((config) => upsertDomains(config, defaults))
    ),
    translations: await Promise.all(
      Object.entries(dictionary).map(([locale, translations]) =>
        upsertTranslations(locale, translations)
      )
    ),
  };
};

upsert().then(Logger.log).catch(Logger.error);
