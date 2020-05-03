export declare type Primitive = string | number | boolean;

export declare type KeyValueMap = {
  [property: string]: Primitive;
};

export declare type KeyValuePairs = {
  key: string;
  value: Primitive;
};

export declare interface PartialsAndBooleans {
  partials: Array<KeyValuePairs>;
  booleans: Array<KeyValuePairs>;
}

export declare interface Dictionary {
  [property: string]: Translations;
}

export declare interface Translations extends KeyValueMap {}

export declare interface Settings {
  dictionary: Dictionary;
  configs: Array<Config>;
  defaults: Defaults;
}

export declare interface Config extends Defaults {
  config: DomainConfig;
}

export declare interface DomainConfig {
  domain: string;
  sesUser: string;
  receiver: string;
}

export declare interface Defaults {
  locale: string;
  fallback: string;
  overrideFor: Array<string>;
  validations: Validations;
}

export declare interface Validations {
  blacklist: Array<string>;
  whitelist: Array<string>;
  required: Array<string>;
}

export declare interface ParsedConfig {
  keys: KeyValueMap;
  translations: Translations;
  recipient: string;
  recipientForced?: string;
  config: DomainConfig;
  validations: Validations;
}
