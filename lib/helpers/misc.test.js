const fs = require('fs');
const path = require('path');
const { getSMTPconfig, processTemplate } = require('./misc');

const testDomain = domain => ({
  smtp: getSMTPconfig(domain),
  domain
});

const defaultDomain = 'johannroehl.de';

describe('misc.js', () => {
  describe('getSMTPconfig', () => {
    test('returns correct config johannroehl.de', () => {
      const { smtp: { configDomain, config }, domain } = testDomain(defaultDomain);
      expect(configDomain).toBe(domain);
      expect(config.auth.user).toContain(domain);
      expect(config.default).toBeUndefined();
      expect(config.domain).toBeUndefined();
    });
    test('returns correct config for heidpartner.com', () => {
      const { smtp: { configDomain, config }, domain } = testDomain('heidpartner.com');
      expect(configDomain).toBe(domain);
      expect(config.auth.user).toContain(domain);
      expect(config.default).toBeUndefined();
      expect(config.domain).toBeUndefined();
    });
    test('returns default config for foo@bar.com', () => {
      const { smtp: { configDomain, config } } = testDomain('foo@bar.com');
      expect(configDomain).toBe(defaultDomain);
      expect(config.auth.user).toContain(defaultDomain);
      expect(config.default).toBeUndefined();
      expect(config.domain).toBeUndefined();
    });
  });
  describe('processTemplate', () => {
    test('returns processed template', () => {
      const processedTemplate = processTemplate(
        { name: 'foo', message: 'bar' },
        '../../templates/mail.template.txt'
      );
      expect(processedTemplate).toBe(fs.readFileSync(path.resolve(__dirname, '../../tests/mail.txt')).toString());
    });
  });
});
