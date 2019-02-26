const { getConfig, httpResponse } = require('./misc');
const { defaults, translations, domains } = require('../config');

const response = {
  locale: 'de',
  validationFields: defaults.validationFields,
  locales: translations.de,
  environment: 'test',
};

describe('misc.js', () => {
  describe('getConfig', () => {
    test('returns correct config johannroehl.de', () => {
      const config = getConfig('johannroehl.de', {});
      expect(config).toEqual({
        ...response,
        ...domains[0],
        keys: {},
        mail: `${domains[0].endpoint}@johannroehl.de`,
        recipient: `${domains[0].endpoint}@johannroehl.de`,
        recipientForced: `${domains[0].endpoint}@johannroehl.de`,
      });
    });
    test('returns correct config for heidpartner.com', () => {
      const keys = { mail: 'foo@bar.xyz' };
      const config = getConfig('heidpartner.com', keys);
      expect(config).toEqual({
        ...response,
        domain: 'heidpartner.com',
        keys,
        user: defaults.user,
        validationFields: defaults.validationFields,
        endpoint: 'service',
        recipient: 'service@heidpartner.com',
        mail: 'foo@bar.xyz',
      });
    });
    test('throws error for domain bar.xyz', () => {
      const keys = { mail: 'foo@bar.xyz' };
      expect(() => getConfig('bar.xyz', keys)).toThrowError(
        'Domain "bar.xyz" not set up'
      );
    });
    test('returns forced config for heidparnter.com with mail admin@johannroehl.de', () => {
      const keys = { mail: 'admin@johannroehl.de' };
      const config = getConfig('heidpartner.com', keys);
      expect(config).toEqual({
        ...response,
        ...domains[0],
        keys,
        domain: 'heidpartner.com',
        endpoint: 'service',
        recipient: 'service@heidpartner.com',
        mail: 'admin@johannroehl.de',
        recipientForced: `${domains[0].endpoint}@johannroehl.de`,
      });
    });
  });
  describe('httpResponse', () => {
    test('returns http success response', () => {
      const response = httpResponse(200, 'test', { foo: 'bar' });
      expect(response).toEqual({
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': '*',
        },
        body: JSON.stringify({
          message: 'test',
          input: { foo: 'bar' },
        }),
      });
    });
    test('returns http error response', () => {
      const response = httpResponse(400, 'test', { foo: 'bar' });
      expect(response).toEqual({
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': '*',
        },
        body: JSON.stringify({
          message: 'test',
          input: { foo: 'bar' },
        }),
      });
    });
  });
});
