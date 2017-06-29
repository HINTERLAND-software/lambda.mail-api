const fs = require('fs');
const path = require('path');
const { getSMTPconfig, processTemplate } = require('./misc');

const testDomain = domain => ({
  smtp: getSMTPconfig(domain),
  domain
});

const defaultDomain = 'johannroehl.de';

test('GetSMTPconfig returns correct config johannroehl.de', () => {
  const { smtp: { configDomain, config }, domain } = testDomain(defaultDomain);
  expect(configDomain).toBe(domain);
  expect(config.auth.user).toContain(domain);
  expect(config.default).toBeUndefined();
  expect(config.domain).toBeUndefined();
});

test('GetSMTPconfig returns correct config for heidpartner.com', () => {
  const { smtp: { configDomain, config }, domain } = testDomain('heidpartner.com');
  expect(configDomain).toBe(domain);
  expect(config.auth.user).toContain(domain);
  expect(config.default).toBeUndefined();
  expect(config.domain).toBeUndefined();
});

test('GetSMTPconfig returns default config for foo@bar.com', () => {
  const { smtp: { configDomain, config } } = testDomain('foo@bar.com');
  expect(configDomain).toBe(defaultDomain);
  expect(config.auth.user).toContain(defaultDomain);
  expect(config.default).toBeUndefined();
  expect(config.domain).toBeUndefined();
});

test('ProcessTemplate returns error', () => {
  const processedTemplate = processTemplate(
    { name: 'foo', message: 'bar' },
    '../../templates/mail.template.txt'
  );
  expect(processedTemplate).toBe(fs.readFileSync(path.resolve(__dirname, '../../tests/mail.txt')).toString());
});
