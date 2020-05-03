export const mockParameters = {
  'hinterland.software': {
    locale: 'de',
    fallback: 'no-reply+fallback@hinterland.software',
    overrideFor: ['@foobar.com'],
    validations: {
      blacklist: ['honeypot'],
      whitelist: ['receiver', 'honeypot'],
      required: ['required_0'],
    },
    config: {
      domain: 'hinterland.software',
      sesUser: 'no-reply',
      receiver: 'mail',
    },
  },
  'foobar.com': {
    locale: 'en',
    fallback: 'no-reply+fallback@hinterland.software',
    overrideFor: ['@hinterland.software'],
    validations: {
      blacklist: ['blacklist_1'],
      whitelist: ['whitelist_1'],
      required: ['required_1'],
    },
    config: {
      domain: 'foobar.com',
      receiver: 'no-reply',
      sesUser: 'service',
    },
  },
  en: {
    'dataprivacy-disclaimer': 'Accepted data privacy disclaimer',
    'processing-disclaimer': 'Accepted data processing disclaimer',
    by: 'by',
    bymail: 'Contact by mail',
    byphone: 'Contact by phone',
    copyright:
      '<a href="https://hinterland.software">© 2013 - 2020 HINTERLAND software</a>',
    false: 'No',
    form: 'Contact form',
    from: 'from',
    header: 'New contact form entry',
    language: 'Language',
    locale: 'Language',
    mail: 'Sender',
    message: 'Message',
    name: 'Name',
    phone: 'Phonenumber',
    receiver: 'Receiver',
    recom: 'Recommendation',
    reply: '(Or just hit "reply" in your email client)',
    replybutton: 'Reply',
    subject: 'Subject',
    surname: 'Surname',
    true: 'Yes',
  },
  de: {
    'dataprivacy-disclaimer': 'Accepted data privacy disclaimer',
    'processing-disclaimer': 'Accepted data processing disclaimer',
    by: 'by',
    bymail: 'Contact by mail',
    byphone: 'Contact by phone',
    copyright:
      '<a href="https://hinterland.software">© 2013 - 2020 HINTERLAND software</a>',
    false: 'No',
    form: 'Contact form',
    from: 'from',
    header: 'New contact form entry',
    language: 'Language',
    locale: 'Language',
    mail: 'Sender',
    message: 'Message',
    name: 'Name',
    phone: 'Phonenumber',
    receiver: 'Receiver',
    recom: 'Recommendation',
    reply: '(Or just hit "reply" in your email client)',
    replybutton: 'Reply',
    subject: 'Subject',
    surname: 'Surname',
    true: 'Yes',
  },
};

export class SSM {
  getParameter({ Name }) {
    const result = mockParameters[Name.split('/').pop()];
    if (!result) throw new Error('ParameterNotFound');
    return {
      promise: jest
        .fn()
        .mockResolvedValue({ Parameter: { Value: JSON.stringify(result) } }),
    };
  }
}

export class SES {
  sendTemplatedEmail(config) {
    if (config.Destination.ToAddresses[0] === 'invalid') {
      return {
        promise: jest
          .fn()
          .mockRejectedValue({ statusCode: 400, message: 'foobar' }),
      };
    }
    return {
      promise: jest.fn().mockResolvedValue({ statusCode: 200, message: 'yay' }),
    };
  }
}
