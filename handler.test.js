const { sendmail } = require('./handler');

jest.mock('./lib/misc', () => ({
  callbackHandler: cb => cb,
  getSMTPconfig: () => ({ config: {} })
}));

jest.mock('./lib/sendmail', () => (smtpConfig, smtpTransport, keys, recipient) =>
  Promise.resolve({
    statusCode: 200,
    message: 'yay',
    result: {
      smtpConfig,
      keys,
      recipient
    }
  }));

describe('handler', () => {
  test('sent error message', (done) => {
    sendmail({ body: {} }, undefined, (statusCode, message) => {
      expect(statusCode).toBe(400);
      expect(message).toBe('No "mail", "name", "message", "dataprivacy-disclaimer", "processing-disclaimer" field specified');
      done();
    });
  });
  test('sent different error message', (done) => {
    sendmail({ body: { message: 'foo', name: 'bar' } }, undefined, (statusCode, message) => {
      expect(statusCode).toBe(400);
      expect(message).toBe('No "mail", "dataprivacy-disclaimer", "processing-disclaimer" field specified');
      done();
    });
  });
  test('invalid recipient', (done) => {
    sendmail(
      { body: { message: 'foo', name: 'bar', receiver: 'foobar' } },
      undefined,
      (statusCode, message) => {
        expect(statusCode).toBe(400);
        expect(message).toBe('Invalid recipient: "foobar"');
        done();
      }
    );
  });
  test('trigger honeypot', (done) => {
    sendmail(
      { body: { message: 'foo', name: 'bar', honeypot: 'its a trap' } },
      undefined,
      (statusCode, message) => {
        expect(statusCode).toBe(200);
        expect(message).toBe('Honey mail sent');
        done();
      }
    );
  });
  test('should return successfully', (done) => {
    sendmail(
      {
        body: {
          message: 'test run',
          name: 'bar',
          surname: 'foo',
          mail: 'foo@bar.com',
          'dataprivacy-disclaimer': true,
          'processing-disclaimer': true
        }
      },
      undefined,
      (statusCode, message, result) => {
        expect(statusCode).toBe(200);
        expect(message).toBe('yay');
        expect(result).toEqual({
          smtpConfig: { config: {} },
          keys: {
            message: 'test run',
            mail: 'foo@bar.com',
            'dataprivacy-disclaimer': true,
            'processing-disclaimer': true,
            name: 'bar foo'
          },
          recipient: 'admin+mailer@johannroehl.de'
        });
        done();
      }
    );
  });
  test('should return successfully with passed through mail', (done) => {
    sendmail(
      {
        body: {
          receiver: 'bar@heidpartner.com',
          message: 'test run',
          name: 'bar',
          surname: 'foo',
          mail: 'foo@bar.com',
          'dataprivacy-disclaimer': true,
          'processing-disclaimer': true
        }
      },
      undefined,
      (statusCode, message, result) => {
        expect(statusCode).toBe(200);
        expect(message).toBe('yay');
        expect(result.recipient).toBe('bar@heidpartner.com');
        done();
      }
    );
  });
  test('should return successfully with forced mail', (done) => {
    sendmail(
      {
        body: {
          receiver: 'roehl.johann@gmail.com',
          message: 'test run',
          name: 'bar',
          surname: 'foo',
          mail: 'foo@bar.com',
          'dataprivacy-disclaimer': true,
          'processing-disclaimer': true
        }
      },
      undefined,
      (statusCode, message, result) => {
        expect(statusCode).toBe(200);
        expect(message).toBe('yay');
        expect(result.recipient).toBe('admin+mailer@johannroehl.de');
        done();
      }
    );
  });
});
