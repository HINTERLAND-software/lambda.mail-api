import * as misc from './misc';
import { mockParameters } from './__mocks__/aws-sdk';

describe('misc.ts', () => {
  describe('prepareConfig', () => {
    it('should return the config', async () => {
      const keys = {
        mail: 'mail@foobaz.com',
      };
      const domain = 'hinterland.software';
      const result = await misc.prepareConfig(domain, keys);
      expect(result).toEqual({
        keys,
        translations: mockParameters.en,
        validations: mockParameters[domain].validations,
        config: mockParameters[domain].config,
        recipient: 'mail@hinterland.software',
        recipientForced: undefined,
      });
    });

    it('should return config with fallback', async () => {
      const keys = {};
      const domain = 'foobar.com';
      const result = await misc.prepareConfig(domain, keys);
      expect(result).toEqual({
        keys: {
          mail: mockParameters[domain].fallback,
        },
        translations: mockParameters.en,
        validations: mockParameters[domain].validations,
        config: mockParameters[domain].config,
        recipient: 'no-reply@foobar.com',
        recipientForced: mockParameters[domain].fallback,
      });
    });

    it('should return config with forced recipient', async () => {
      const keys = {
        mail: 'mail@hinterland.software',
      };
      const domain = 'foobar.com';
      const result = await misc.prepareConfig(domain, keys);
      expect(result).toEqual({
        keys,
        translations: mockParameters.en,
        validations: mockParameters[domain].validations,
        config: mockParameters[domain].config,
        recipient: 'no-reply@foobar.com',
        recipientForced: mockParameters[domain].fallback,
      });
    });

    it('throws error for invalid domain', () => {
      const keys = { mail: 'mail@hinterland.software' };
      const domain = 'foobaz';
      expect(misc.prepareConfig(domain, keys)).rejects.toEqual(
        new Error('ParameterNotFound')
      );
    });
  });

  describe('validateRequest', () => {
    test('pass if config is valid', () => {
      const config = {
        keys: { mail: 'foo@bar.xyz', name: 'foo' },
        validations: {
          blacklist: ['honeypot'],
          required: ['mail'],
        },
      };
      expect(() => misc.validateRequest(<any>config)).not.toThrow();
    });

    test('throw if config has invalid fields', () => {
      const config = {
        keys: { mail: 'foo@bar.xyz', name: 'foo', honeypot: 'pooh' },
        validations: {
          blacklist: ['honeypot'],
          required: ['mail'],
        },
      };
      expect(() => misc.validateRequest(<any>config)).toThrowError(
        'Invalid field "honeypot" used'
      );
    });

    test('throw if config has missing required fields', () => {
      const config = {
        keys: { name: 'foo' },
        validations: {
          blacklist: ['honeypot'],
          required: ['mail'],
        },
      };
      expect(() => misc.validateRequest(<any>config)).toThrowError(
        'No "mail" field specified'
      );
    });
  });
});
