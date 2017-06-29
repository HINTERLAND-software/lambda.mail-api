const sendmail = require('./sendmail');

const resultMailOptions = JSON.stringify({ from: 'no-reply@johannroehl.de',
  to: 'roehl.johann@gmail.com',
  subject: 'NEW MAIL from johannroehl.de contact form - foo@bar.com',
  text: 'NEW MAIL from foo@bar.com\\n\nSENDER bar foo | foo@bar.com \\n\nMESSAGE test run\\n\n\\n\nCONTACTBY  ',
  html: '<h2 style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">NEW MAIL</h2>\n<table>\n  <tr>\n    <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">\n      FROM\n    </td>\n    <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">\n      bar foo | foo@bar.com \n    </td>\n  </tr>\n  <tr>\n    <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">\n      MESSAGE\n    </td>\n    <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">\n      test run\n    </td>\n  </tr>\n  \n  <tr>\n    <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">\n      CONTACT\n    </td>\n    <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">\n       \n    </td>\n  </tr>\n</table>\n' });

jest.mock('./helpers/smtpmailer', () => class SmtpTransport {
  sendMail(mailOptions, recipient, callback = this.callback) {
    callback(200, `${Date()} | Mail sent to ${recipient}`, JSON.stringify(mailOptions));
  }
});

test('Sendmail send error message', (done) => {
  sendmail(undefined, undefined, (statusCode, message) => {
    expect(statusCode).toBe(400);
    expect(message).toBe('No "mail" "name" "message" field specified');
    done();
  });
});

test('Sendmail send different error message', (done) => {
  sendmail({ message: 'foo', name: 'bar' }, undefined, (statusCode, message) => {
    expect(statusCode).toBe(400);
    expect(message).toBe('No "mail" field specified');
    done();
  });
});

test('Sendmail should return successfully', (done) => {
  const res = sendmail(
    { message: 'test run', name: 'bar', surname: 'foo', mail: 'foo@bar.com' },
    undefined, (statusCode, message, result) => {
      expect(statusCode).toBe(200);
      expect(message).toContain('| Mail sent to roehl.johann@gmail.com');
      expect(result).toBe(resultMailOptions);
      done();
    });
  expect(res).toContain('foo@bar.com');
  expect(res).toContain('test run');
});
