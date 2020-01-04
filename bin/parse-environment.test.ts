import { config } from 'dotenv';
import { resolve } from 'path';
import parse from './parse-environment';

config({ path: resolve(__dirname, '..', 'test', 'env') });

describe('parse environment file', () => {
  test('returns parsed environment object', () => {
    const parsed = parse(process.env);
    expect(parsed).toEqual({
      'johannroehl.de': {
        index: 0,
        config: {
          domain: 'johannroehl.de',
          receiver: 'mail',
          sesUser: 'no-reply',
        },
        validations: {
          overrideFor: '@foobar.com',
          validationBlacklist: 'honeypot',
          validationRequired: 'required_0',
          validationWhitelist: 'receiver honeypot',
        },
      },
      'foobar.com': {
        index: 1,
        config: {
          domain: 'foobar.com',
          receiver: 'service',
          sesUser: 'no-reply',
        },
        validations: {
          overrideFor: 'force_mail_1',
          validationBlacklist: 'blacklist_1',
          validationRequired: 'required_1',
          validationWhitelist: 'whitelist_1',
        },
      },
      'foo.com': {
        index: 2,
        config: { domain: 'foo.com', receiver: 'bar', sesUser: 'no-reply' },
        validations: {
          overrideFor: '@foobar.com',
          validationBlacklist: 'blacklist_2',
          validationRequired:
            'mail name message dataprivacy-disclaimer processing-disclaimer',
          validationWhitelist: 'receiver honeypot',
        },
      },
      'bar.com': {
        index: 3,
        config: { domain: 'bar.com', receiver: 'foo', sesUser: 'no-reply' },
        validations: {
          overrideFor: 'force_mail_3',
          validationBlacklist: 'honeypot',
          validationRequired:
            'mail name message dataprivacy-disclaimer processing-disclaimer',
          validationWhitelist: 'receiver honeypot',
        },
      },
    });
  });
});
