import { config } from 'dotenv';
import { resolve } from 'path';
import parse from './parse-environment';

config({ path: resolve(__dirname, '..', 'test', 'env') });

describe('parse', () => {
  test('returns parsed environment object', () => {
    const parsed = parse(process.env);
    expect(parsed).toEqual({
      'johannroehl.de': {
        index: 0,
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
        index: 1,
        config: {
          domain: 'foobar.com',
          receiver: 'no-reply',
          sesUser: 'service',
        },
        validations: {
          overrideFor: ['force_mail_1'],
          validationBlacklist: ['blacklist_1'],
          validationWhitelist: ['whitelist_1'],
          validationRequired: ['required_1'],
        },
      },
      'foo.com': {
        index: 2,
        config: {
          domain: 'foo.com',
          receiver: 'no-reply',
          sesUser: 'bar',
        },
        validations: {
          overrideFor: ['@foobar.com'],
          validationBlacklist: ['blacklist_2'],
          validationWhitelist: ['receiver', 'honeypot'],
          validationRequired: ['global', 'required'],
        },
      },
      'bar.com': {
        index: 3,
        config: {
          domain: 'bar.com',
          receiver: 'no-reply',
          sesUser: 'foo',
        },
        validations: {
          overrideFor: ['force_mail_3'],
          validationBlacklist: ['honeypot'],
          validationWhitelist: ['receiver', 'honeypot'],
          validationRequired: ['global', 'required'],
        },
      },
    });
  });
});
