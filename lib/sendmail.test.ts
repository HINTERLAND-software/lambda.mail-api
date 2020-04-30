import * as misc from './misc';
// import * as AWS from 'aws-sdk';
const AWS = require('aws-sdk');

jest.mock('aws-sdk');

import sendmail from './sendmail';
import { translations } from '../config';

const config = {
  keys: { mail: 'foo@bar.com', foo: true, bar: 'false' },
  translations: translations.en,
  recipient: 'mail@johannroehl.de',
  recipientForced: 'forced@johannroehl.de',
  config: {
    config: { domain: 'johannroehl.de', sesUser: 'no-reply' },
    validations: { validationWhitelist: [] },
  },
};

describe('sendmail', () => {
  beforeEach(() => {
    jest.spyOn(misc, 'parsePartialsAndBooleans').mockReturnValue(<any>{});
  });
  test('should fail with 400', () => {
    AWS.SES = class {
      sendTemplatedEmail() {
        return {
          promise: () => Promise.reject({ statusCode: 400, message: 'foobar' }),
        };
      }
    };
    return sendmail(<any>config).then((res) => {
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
          error: {
            statusCode: 400,
            message: 'foobar',
          },
          domain: 'johannroehl.de',
          params: {
            Destination: {
              ToAddresses: ['forced@johannroehl.de'],
            },
            ReplyToAddresses: ['foo@bar.com'],
            Source: 'Contact form <no-reply@johannroehl.de>',
            TemplateData: {
              ...translations.en,
              mail: 'foo@bar.com',
              foo: true,
              bar: 'false',
              domain: 'johannroehl.de',
            },
          },
          config,
        },
      });
    });
  });
  test('should return successfully', () => {
    delete config.recipientForced;
    AWS.SES = class {
      sendTemplatedEmail() {
        return {
          promise: () => Promise.resolve({ statusCode: 200, message: 'yay' }),
        };
      }
    };
    return sendmail(<any>config).then((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.headers).toEqual({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': '*',
      });
      const body = JSON.parse(res.body);
      delete body.input.presendTimestamp;

      expect(body).toEqual({
        message: 'Mail sent to mail@johannroehl.de (MessageId: "undefined")',
        input: {
          domain: 'johannroehl.de',
          params: {
            Destination: {
              ToAddresses: ['mail@johannroehl.de'],
            },
            ReplyToAddresses: ['foo@bar.com'],
            Source: 'Contact form <no-reply@johannroehl.de>',
            TemplateData: {
              ...translations.en,
              mail: 'foo@bar.com',
              foo: true,
              bar: 'false',
              domain: 'johannroehl.de',
            },
          },
          config,
        },
      });
    });
  });
});
