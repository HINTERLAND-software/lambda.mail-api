const { getConfig, httpResponse, VARIANTS } = require('./misc');
const { defaults, domains } = require('../config');

describe('misc.js', () => {
  describe('getConfig', () => {
    test('returns correct config johannroehl.de', () => {
      const config = getConfig('johannroehl.de', 'foo@bar.xyz');
      expect(config).toEqual({
        ...domains[0],
        variant: VARIANTS.CLEAN,
        environment: 'test',
        recipient: 'admin+mailer@johannroehl.de',
        receiver: 'foo@bar.xyz',
      });
    });
    test('returns correct config for heidpartner.com', () => {
      const config = getConfig('heidpartner.com', 'foo@bar.xyz');
      expect(config).toEqual({
        domain: 'heidpartner.com',
        user: defaults.user,
        validationFields: defaults.validationFields,
        variant: VARIANTS.CLEAN,
        environment: 'test',
        endpoint: 'service',
        recipient: 'service@heidpartner.com',
        receiver: 'foo@bar.xyz',
      });
    });
    test('returns default config for foo@bar.com', () => {
      const config = getConfig('bar.xyz', 'foo@bar.xyz');
      expect(config).toEqual({
        ...domains[0],
        variant: VARIANTS.FALLBACK,
        environment: 'test',
        recipient: 'admin+mailer@johannroehl.de',
        receiver: 'foo@bar.xyz',
      });
    });
    test('returns forced config for foo@bar.com', () => {
      const config = getConfig('bar.xyz', 'admin@johannroehl.de');
      expect(config).toEqual({
        ...domains[0],
        variant: VARIANTS.FORCED,
        environment: 'test',
        recipient: 'admin+mailer@johannroehl.de',
        receiver: 'admin@johannroehl.de',
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
