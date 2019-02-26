const translations = require('./translations');

module.exports = {
  forced: ['@johannroehl.de', 'roehl.johann@gmail.com'], // receiving addresses that force the mail to be send to admin+mailer@johannroehl.de
  domains: [
    {
      domain: 'johannroehl.de',
      user: 'no-reply', // the user that is registered in aws sns
      endpoint: 'no-reply+mail-api', // the recipient of the mail
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
    },
    {
      domain: 'heidpartner.com',
      endpoint: 'service',
    },
    {
      domain: 'hasu-bau.de',
    },
    {
      domain: 'vh-gruppe.de',
    },
    {
      domain: 'ivm-meyer.de',
    },
    {
      domain: 'strassburg-passage.de',
    },
  ],
  defaults: {
    locale: 'de',
    user: 'no-reply',
    endpoint: 'info',
    validationFields: {
      ignore: ['receiver'],
      invalid: ['honeypot'],
      required: [
        'mail',
        'name',
        'message',
        'dataprivacy-disclaimer',
        'processing-disclaimer',
      ],
    },
  },
  translations,
};
