import { ParsedDomainConfigs } from '../bin/parse-environment';
import { translations } from '../config';
import * as misc from './misc';

const config = <ParsedDomainConfigs>{
  'johannroehl.de': {
    index: 1,
    config: {
      domain: 'johannroehl.de',
      receiver: 'no-reply',
      sesUser: 'mail',
    },
    validations: {
      overrideFor: ['@foobar.com'],
      validationBlacklist: ['honeypot'],
      validationWhitelist: ['receiver', 'honeypot'],
      validationRequired: ['required_0'],
    },
  },
  'foobar.com': {
    index: 2,
    config: {
      domain: 'foobar.com',
      receiver: 'no-reply',
      sesUser: 'service',
    },
    validations: {
      overrideFor: ['@johannroehl.de'],
      validationBlacklist: ['blacklist_1'],
      validationWhitelist: ['whitelist_1'],
      validationRequired: ['required_1'],
    },
  },
};

describe('getConfig', () => {
  beforeEach(() => {
    process.env.LOCALE = 'en';
    jest.spyOn(misc, 'parseConfig').mockReturnValue(config);
  });

  test('returns config', () => {
    const keys = { mail: 'foo@bar.com' };
    const cfg = misc.getConfig('johannroehl.de', keys);

    expect(cfg).toEqual({
      keys: keys,
      translations: translations.en,
      environment: 'test',
      recipient: 'no-reply@johannroehl.de',
      config: config['johannroehl.de'],
    });
  });

  test('returns config with fallback value', () => {
    const cfg = misc.getConfig('johannroehl.de', {});

    expect(cfg).toEqual({
      keys: {
        mail: 'no-reply@johannroehl.de',
      },
      translations: translations.en,
      environment: 'test',
      recipient: 'no-reply@johannroehl.de',
      config: config['johannroehl.de'],
    });
  });

  test('returns config with forced recipient', () => {
    const keys = { mail: 'forced@johannroehl.de' };
    const cfg = misc.getConfig('foobar.com', keys);

    expect(cfg).toEqual({
      keys: keys,
      translations: translations.en,
      environment: 'test',
      recipient: 'no-reply@foobar.com',
      recipientForced: 'no-reply@johannroehl.de',
      config: config['foobar.com'],
    });
  });

  test('returns config with locale set to de', () => {
    process.env.LOCALE = 'de';
    const keys = { mail: 'forced@johannroehl.de' };
    const cfg = misc.getConfig('foobar.com', keys);

    expect(cfg).toEqual({
      keys: keys,
      translations: translations.de,
      environment: 'test',
      recipient: 'no-reply@foobar.com',
      recipientForced: 'no-reply@johannroehl.de',
      config: config['foobar.com'],
    });
  });

  test('throws error for invalid domain', () => {
    const keys = { mail: 'foo@bar.xyz' };
    expect(() => misc.getConfig('bar.xyz', keys)).toThrowError(
      'Domain "bar.xyz" not set up'
    );
  });
});

describe('validateRequest', () => {
  test('pass if config is valid', () => {
    const config = {
      keys: { mail: 'foo@bar.xyz', name: 'foo' },
      config: {
        validations: {
          validationBlacklist: ['honeypot'],
          validationRequired: ['mail'],
        },
      },
    };
    expect(() => misc.validateRequest(<any>config)).not.toThrow();
  });

  test('throw if config has invalid fields', () => {
    const config = {
      keys: { mail: 'foo@bar.xyz', name: 'foo', honeypot: 'pooh' },
      config: {
        validations: {
          validationBlacklist: ['honeypot'],
          validationRequired: ['mail'],
        },
      },
    };
    expect(() => misc.validateRequest(<any>config)).toThrowError(
      'Invalid field "honeypot" used'
    );
  });

  test('throw if config has missing required fields', () => {
    const config = {
      keys: { name: 'foo' },
      config: {
        validations: {
          validationBlacklist: ['honeypot'],
          validationRequired: ['mail'],
        },
      },
    };
    expect(() => misc.validateRequest(<any>config)).toThrowError(
      'No "mail" field specified'
    );
  });
});

describe('parsePartialsAndBooleans', () => {
  test('parse, sort and sanitize partials and booleans', () => {
    const res = misc.parsePartialsAndBooleans(
      {
        mail: 'mail@johannroehl.de',
        empty: '',
        undef: undefined,
        name: 'Johann',
        ignored: 'ignored',
        stringTrue: 'true',
        stringFalse: 'false',
        boolTrue: true,
        boolFalse: false,
      },
      translations.en,
      ['ignored']
    );

    expect(res).toEqual({
      partials: [
        { key: 'Name', value: 'Johann' },
        { key: 'Sender', value: 'mail@johannroehl.de' },
      ],
      booleans: [
        {
          key: 'boolFalse',
          value: '<span style="color: red;">❌</span>',
        },
        {
          key: 'boolTrue',
          value: '<span style="color: green;">✅</span>',
        },
        {
          key: 'stringFalse',
          value: '<span style="color: red;">❌</span>',
        },
        {
          key: 'stringTrue',
          value: '<span style="color: green;">✅</span>',
        },
      ],
    });
  });
});
