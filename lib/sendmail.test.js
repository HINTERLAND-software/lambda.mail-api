const AWS = require('aws-sdk');

const sendmail = require('./sendmail');
const { defaults, translations } = require('../config');

jest.mock('aws-sdk');

const config = {
  keys: { mail: 'foo@bar.com' },
  domain: 'example.com',
  user: 'user',
  locales: translations.de,
  validationFields: defaults.validationFields,
  recipientForced: 'forced-recip@johannroehl.de',
  recipient: 'recip@johannroehl.de',
};

describe('sendmail', () => {
  AWS.SES = class {
    sendTemplatedEmail() {
      return {
        promise: () => Promise.reject({ statusCode: 400, message: 'foobar' }),
      };
    }
  };
  test('should fail with 400', () => {
    return sendmail(config).then(res => {
      expect(res.statusCode).toBe(400);
      expect(res.headers).toEqual({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': '*',
      });
      const body = JSON.parse(res.body);
      delete body.input.presendTimestamp;
      expect(body).toEqual({
        message: 'foobar',
        input: {
          domain: 'example.com',
          error: {
            statusCode: 400,
            message: 'foobar',
          },
          keys: {
            mail: 'foo@bar.com',
          },
          config: config,
          params: {
            Destination: {
              ToAddresses: ['forced-recip@johannroehl.de'],
            },
            ReplyToAddresses: ['foo@bar.com'],
            Source: 'Kontaktformular <user@example.com>',
            TemplateData: {
              partials: [
                {
                  key: 'Absender',
                  value: 'foo@bar.com',
                },
              ],
              domain: 'example.com',
              from: 'foo@bar.com',
              ...translations.de,
              mail: 'foo@bar.com',
            },
          },
        },
      });
    });
  });
  test('should return successfully', () => {
    AWS.SES = class {
      sendTemplatedEmail() {
        return {
          promise: () => Promise.resolve({ statusCode: 200, message: 'yay' }),
        };
      }
    };
    return sendmail(config).then(res => {
      expect(res.statusCode).toBe(200);
      expect(res.headers).toEqual({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': '*',
      });
      const body = JSON.parse(res.body);
      delete body.input.presendTimestamp;
      expect(body).toEqual({
        message: {
          statusCode: 200,
          message: 'yay',
        },
        input: {
          domain: 'example.com',
          keys: {
            mail: 'foo@bar.com',
          },
          config: config,
          params: {
            Destination: {
              ToAddresses: ['forced-recip@johannroehl.de'],
            },
            ReplyToAddresses: ['foo@bar.com'],
            Source: 'Kontaktformular <user@example.com>',
            TemplateData: {
              partials: [
                {
                  key: 'Absender',
                  value: 'foo@bar.com',
                },
              ],
              domain: 'example.com',
              from: 'foo@bar.com',
              ...translations.de,
              mail: 'foo@bar.com',
            },
          },
        },
      });
    });
  });
});
