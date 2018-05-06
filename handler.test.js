const { sendmail } = require('./handler');

jest.mock('./lib/misc', () => ({
  callbackHandler: cb => cb,
  getSMTPconfig: () => ({ config: {} })
}));

jest.mock('./lib/sendmail', () => () =>
  Promise.resolve({ statusCode: 200, message: 'yay', result: {} }));

describe('handler', () => {
  test('sent error message', (done) => {
    sendmail({ body: {} }, undefined, (statusCode, message) => {
      expect(statusCode).toBe(400);
      expect(message).toBe('No "mail", "name", "message" field specified');
      done();
    });
  });
  test('sent different error message', (done) => {
    sendmail({ body: { message: 'foo', name: 'bar' } }, undefined, (statusCode, message) => {
      expect(statusCode).toBe(400);
      expect(message).toBe('No "mail" field specified');
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
          mail: 'foo@bar.com'
        }
      },
      undefined,
      (statusCode, message, result) => {
        expect(statusCode).toBe(200);
        expect(message).toBe('yay');
        expect(result).toBeDefined();
        done();
      }
    );
  });
});
