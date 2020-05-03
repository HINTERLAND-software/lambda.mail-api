import * as parse from './parse';
import sendmail from './sendmail';
import { mockParameters } from './__mocks__/aws-sdk';

const config = {
  keys: { mail: 'foo@bar.com', foo: true, bar: 'false' },
  translations: mockParameters.en,
  recipient: 'mail@johannroehl.de',
  recipientForced: 'forced@johannroehl.de',
  config: { domain: 'johannroehl.de', sesUser: 'no-reply' },
  validations: { whitelist: [] },
};

describe('sendmail.ts', () => {
  describe('handler', () => {
    beforeEach(() => {
      jest.spyOn(parse, 'parsePartialsAndBooleans').mockReturnValue(<any>{});
    });
    test('should fail with 400', () => {
      config.recipientForced = 'invalid';
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
                ToAddresses: [config.recipientForced],
              },
              ReplyToAddresses: ['foo@bar.com'],
              Source: 'Contact form <no-reply@johannroehl.de>',
              TemplateData: {
                ...mockParameters.en,
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
                ...mockParameters.en,
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
});
