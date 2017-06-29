const SmtpTransport = require('./smtpmailer');
const { getSMTPconfig } = require('./misc');
const { domains, mailgun } = require('../../config');

test('SmtpTransport to be created', () => {
  const smtpTransport = new SmtpTransport(getSMTPconfig('johannroehl.de'), () => null);
  expect(smtpTransport).toBeInstanceOf(SmtpTransport);
});
