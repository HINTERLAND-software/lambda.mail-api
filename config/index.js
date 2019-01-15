const translations = require('./translations');

module.exports = {
  forced: ['@johannroehl.de', 'roehl.johann@gmail.com'],
  domains: [
    {
      domain: 'johannroehl.de',
      user: 'no-reply',
      endpoint: 'admin+mailer',
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
    user: 'no-reply',
    endpoint: 'info',
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
  translations,
};
