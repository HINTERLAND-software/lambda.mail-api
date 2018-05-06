const sendmail = require('./sendmail');
const fs = require('fs');

const resultMailOptions = {
  from: 'no-reply@johannroehl.de',
  to: 'roehl.johann@gmail.com',
  subject: 'johannroehl.de: Neuer Kontaktformular Eintrag von bar (foo@bar.com)',
  text: fs.readFileSync('./test/successful.txt').toString()
};

const config = {
  config: { auth: { user: resultMailOptions.from } },
  configDomain: 'johannroehl.de'
};
const payload = {
  message: 'test run',
  name: 'bar',
  surname: 'foo',
  mail: 'foo@bar.com'
};

describe('sendmail', () => {
  test('should fail with 400', (done) => {
    sendmail(
      config,
      {
        sendMail: jest.fn().mockRejectedValueOnce(new Error('foobar'))
      },
      payload,
      resultMailOptions.to
    ).then(({ statusCode, message, result }) => {
      expect(statusCode).toBe(400);
      expect(message).toBe('foobar');
      expect(result).toBeDefined();
      done();
    });
  });
  test('should return successfully', (done) => {
    sendmail(
      config,
      {
        sendMail: jest.fn().mockReturnValueOnce(`${Date()} | Mail sent to ${resultMailOptions.to}`)
      },
      payload,
      resultMailOptions.to
    ).then(({ statusCode, message, result }) => {
      expect(statusCode).toBe(200);
      expect(message).toContain('| Mail sent to roehl.johann@gmail.com');
      expect(result.html).toContain('<a href="mailto:foo@bar.com"');
      expect(result.html).toContain('<p>test run</p>');

      expect(result.from).toBe(resultMailOptions.from);
      expect(result.to).toBe(resultMailOptions.to);
      expect(result.subject).toBe(resultMailOptions.subject);
      expect(result.text).toBe(resultMailOptions.text);
      done();
    });
  });
});
