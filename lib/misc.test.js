const fs = require('fs');
const path = require('path');

const { getSMTPconfig, processTemplate, callbackHandler } = require('./misc');
const { templates } = require('../config');

const testDomain = domain => ({
  smtp: getSMTPconfig(domain),
  domain
});

const defaultDomain = 'johannroehl.de';

describe('misc.js', () => {
  describe('getSMTPconfig', () => {
    test('returns correct config johannroehl.de', () => {
      const {
        smtp: { configDomain, config },
        domain
      } = testDomain(defaultDomain);
      expect(configDomain).toBe(domain);
      expect(config.auth.user).toContain(domain);
      expect(config.default).toBeUndefined();
      expect(config.domain).toBeUndefined();
    });
    test('returns correct config for heidpartner.com', () => {
      const {
        smtp: { configDomain, config },
        domain
      } = testDomain('heidpartner.com');
      expect(configDomain).toBe(domain);
      expect(config.auth.user).toContain(domain);
      expect(config.default).toBeUndefined();
      expect(config.domain).toBeUndefined();
    });
    test('returns default config for foo@bar.com', () => {
      const {
        smtp: { configDomain, config }
      } = testDomain('foo@bar.com');
      expect(configDomain).toBe(defaultDomain);
      expect(config.auth.user).toContain(defaultDomain);
      expect(config.default).toBeUndefined();
      expect(config.domain).toBeUndefined();
    });
  });
  describe('processTemplate', () => {
    test('returns processed template', () => {
      const processedTemplate = processTemplate({ name: 'foo', message: 'bar' }, templates.txt);
      expect(processedTemplate).toContain(fs.readFileSync(path.resolve(__dirname, '../test/mail.txt')).toString());
    });
  });
  describe('callbackHandler', () => {
    test('returns the right types', (done) => {
      const response = callbackHandler((err, res) => {
        expect(err).toBeNull();
        expect(res.statusCode).toBe(200);
        expect(typeof res.body).toBe('string');
        done();
      });
      response(200, 'Test', { foo: 'bar' });
    });
    test('returns error', (done) => {
      const response = callbackHandler((err, res) => {
        expect(err).toBeNull();
        expect(res).not.toBeNull();
        expect(res.statusCode).toBe(400);
        expect(typeof res.body).toBe('string');
        done();
      });
      response(400, 'Test', { foo: 'bar' });
    });
  });
});
