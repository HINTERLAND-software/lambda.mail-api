const { sendmail } = require('./handler');

jest.mock('./lib/misc', () => ({
  httpResponse: (...cb) => [...cb],
  getConfig: () => ({
    user: 'user',
    validationFields: {
      invalid: ['honeypot'],
      required: [
        'mail',
        'name',
        'message',
        'dataprivacy-disclaimer',
        'processing-disclaimer',
      ],
    },
    domain: 'bar.xyz',
  }),
}));

jest.mock('./lib/sendmail', () => (config, keys, recipient) => ({
  statusCode: 200,
  message: 'yay',
  result: {
    config,
    keys,
    recipient,
  },
}));

describe('handler', () => {
  test('sent error message', () => {
    return sendmail({ body: {} }).then(([code, msg, input]) => {
      expect(code).toBe(400);
      expect(msg).toBe(
        'No "mail", "name", "message", "dataprivacy-disclaimer", "processing-disclaimer" field specified'
      );
      expect(input).not.toBeDefined();
    });
  });
  test('sent different error message', () => {
    return sendmail({ body: { message: 'foo', name: 'bar' } }).then(
      ([code, msg, input]) => {
        expect(code).toBe(400);
        expect(msg).toBe(
          'No "mail", "dataprivacy-disclaimer", "processing-disclaimer" field specified'
        );
        expect(input).not.toBeDefined();
      }
    );
  });
  test('invalid recipient', () => {
    return sendmail({
      body: {
        message: 'foo',
        name: 'bar',
        receiver: 'foobar',
        mail: 'foo',
        'dataprivacy-disclaimer': true,
        'processing-disclaimer': true,
      },
    }).then(([code, msg, input]) => {
      expect(code).toBe(400);
      expect(msg).toBe('Invalid recipient: "foobar"');
      expect(input).not.toBeDefined();
    });
  });
  test('trigger honeypot', () => {
    return sendmail({
      body: { message: 'foo', name: 'bar', honeypot: 'its a trap' },
    }).then(([code, msg, input]) => {
      expect(code).toBe(200);
      expect(msg).toBe('Invalid field "honeypot" used');
      expect(input).not.toBeDefined();
    });
  });
  // test('should return successfully', done => {
  //   sendmail(
  //     {
  //       body: {
  //         message: 'test run',
  //         name: 'bar',
  //         surname: 'foo',
  //         mail: 'foo@bar.com',
  //         'dataprivacy-disclaimer': true,
  //         'processing-disclaimer': true,
  //       },
  //     },
  //     undefined,
  //     (statusCode, message, result) => {
  //       expect(statusCode).toBe(200);
  //       expect(message).toBe('yay');
  //       expect(result).toEqual({
  //         keys: {
  //           'dataprivacy-disclaimer': true,
  //           mail: 'foo@bar.com',
  //           message: 'test run',
  //           name: 'bar foo',
  //           'processing-disclaimer': true,
  //         },
  //         recipient: 'admin+mailer@johannroehl.de',
  //         smtpConfig: {
  //           config: {},
  //           validationFields: {
  //             invalid: ['honeypot'],
  //             required: [
  //               'mail',
  //               'name',
  //               'message',
  //               'dataprivacy-disclaimer',
  //               'processing-disclaimer',
  //             ],
  //           },
  //         },
  //       });
  //       done();
  //     }
  //   );
  // });
  // test('should return successfully with passed through mail', done => {
  //   sendmail(
  //     {
  //       body: {
  //         receiver: 'bar@heidpartner.com',
  //         message: 'test run',
  //         name: 'bar',
  //         surname: 'foo',
  //         mail: 'foo@bar.com',
  //         'dataprivacy-disclaimer': true,
  //         'processing-disclaimer': true,
  //       },
  //     },
  //     undefined,
  //     (statusCode, message, result) => {
  //       expect(statusCode).toBe(200);
  //       expect(message).toBe('yay');
  //       expect(result.recipient).toBe('bar@heidpartner.com');
  //       done();
  //     }
  //   );
  // });
  // test('should return successfully with forced mail', done => {
  //   sendmail(
  //     {
  //       body: {
  //         receiver: 'roehl.johann@gmail.com',
  //         message: 'test run',
  //         name: 'bar',
  //         surname: 'foo',
  //         mail: 'foo@bar.com',
  //         'dataprivacy-disclaimer': true,
  //         'processing-disclaimer': true,
  //       },
  //     },
  //     undefined,
  //     (statusCode, message, result) => {
  //       expect(statusCode).toBe(200);
  //       expect(message).toBe('yay');
  //       expect(result.recipient).toBe('admin+mailer@johannroehl.de');
  //       done();
  //     }
  //   );
  // });
});
