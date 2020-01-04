import { send } from './handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('./lib/misc', () => ({
  httpResponse: (...cb) => [...cb],
  getConfig: () => ({
    user: 'user',
    validationFields: {
      invalid: ['honeypot'],
      required: ['mail', 'name', 'message'],
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
    return send(
      <APIGatewayProxyEvent>{ body: '', pathParameters: {} },
      undefined,
      undefined
    ).then(([code, msg, input]) => {
      expect(code).toBe(400);
      expect(msg).toBe('No "mail", "name", "message" field specified');
      expect(input).toEqual({
        body: {},
        config: {
          domain: 'bar.xyz',
          user: 'user',
          validationFields: {
            invalid: ['honeypot'],
            required: ['mail', 'name', 'message'],
          },
        },
      });
    });
  });
  test('sent different error message', () => {
    return send({
      body: { message: 'foo', name: 'bar' },
      pathParameters: {},
    }).then(([code, msg, input]) => {
      expect(code).toBe(400);
      expect(msg).toBe('No "mail" field specified');
      expect(input).toEqual({
        body: { message: 'foo', name: 'bar' },
        config: {
          domain: 'bar.xyz',
          user: 'user',
          validationFields: {
            invalid: ['honeypot'],
            required: ['mail', 'name', 'message'],
          },
        },
      });
    });
  });
  test('trigger honeypot', () => {
    return send({
      body: { message: 'foo', mail: 'bar', honeypot: 'its a trap' },
      pathParameters: {},
    }).then(([code, msg, input]) => {
      expect(code).toBe(200);
      expect(msg).toBe('Invalid field "honeypot" used');
      expect(input).toEqual({
        body: {
          message: 'foo',
          honeypot: 'its a trap',
          mail: 'bar',
        },
        config: {
          domain: 'bar.xyz',
          user: 'user',
          validationFields: {
            invalid: ['honeypot'],
            required: ['mail', 'name', 'message'],
          },
        },
      });
    });
  });

  test('should return successfully', () => {
    return send({
      body: {
        message: 'test run',
        name: 'bar',
        surname: 'foo',
        mail: 'foo@bar.com',
        'dataprivacy-disclaimer': true,
        'processing-disclaimer': true,
      },
    }).then(({ statusCode, message, result }) => {
      expect(statusCode).toBe(200);
      expect(message).toBe('yay');
      expect(result).toEqual({
        config: {
          user: 'user',
          validationFields: {
            invalid: ['honeypot'],
            required: ['mail', 'name', 'message'],
          },
          domain: 'bar.xyz',
        },
        keys: {
          message: 'test run',
          'dataprivacy-disclaimer': true,
          'processing-disclaimer': true,
          name: 'bar foo',
          mail: 'foo@bar.com',
        },
        recipient: undefined,
      });
    });
  });
});
