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
  beforeEach(() => {
    jest.spyOn(parse, 'parsePartialsAndBooleans').mockReturnValue(<any>{});
  });
  test('should return successfully', () => {
    delete config.recipientForced;
    return sendmail(<any>config).then(({ result }) => {
      delete result.presendTimestamp;
      expect(result).toEqual({
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
      });
    });
  });
});
