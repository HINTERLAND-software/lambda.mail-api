import { config } from 'dotenv';
import { resolve } from 'path';
import parse from './parse-environment';

describe('parse', () => {
  test('returns parsed environment object', () => {
    const parsed = parse(config({ path: resolve(__dirname, 'env') }).parsed);
    expect(parsed).toEqual({
      'johannroehl.de': {
        index: 0,
        config: {
          domain: 'johannroehl.de',
          sesUser: 'no-reply',
          receiver: 'mail',
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
          sesUser: 'no-reply',
          receiver: 'service',
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
          sesUser: 'no-reply',
          receiver: 'bar',
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
          sesUser: 'no-reply',
          receiver: 'foo',
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
