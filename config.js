const path = require('path');

const copyright = `© 2013 - ${new Date().getFullYear()} jr | development`;

module.exports = {
  forced: ['@johannroehl.de', 'roehl.johann@gmail.com'],
  self: 'admin+mailer@johannroehl.de',
  domains: [
    {
      domain: 'heidpartner.com',
      user: 'no-reply@mg.heidpartner.com',
      pass: 'nmFPq8HpzezN9y=)wzXaMzbg'
    },
    {
      domain: 'hasu-bau.de',
      user: 'no-reply@mg.hasu-bau.de',
      pass: ''
    },
    {
      domain: 'vh-gruppe.de',
      user: 'no-reply@mg.vh-gruppe.de',
      pass: ',FpzbL=fatFQ49Ci'
    },
    {
      domain: 'ivm-meyer.de',
      user: 'no-reply@mg.ivm-meyer.de',
      pass: 'f}D6DtDGJFY9aPpLBThmcFa6kC.'
    },
    {
      domain: 'strassburg-passage.de',
      user: 'no-reply@mg.strassburg-passage.de',
      pass: 'oYRCpn]2JU*Gcg4T'
    },
    {
      fallback: true,
      domain: 'johannroehl.de',
      user: 'no-reply@johannroehl.de',
      pass: 'KtnGKUBd3RLgPyHgRoyfikjE',
      validationFields: {
        invalid: ['honeypot'],
        required: ['mail', 'name', 'message', 'dataprivacy-disclaimer', 'processing-disclaimer']
      }
    }
  ],
  mailgun: {
    port: 587,
    host: 'smtp.mailgun.org',
    tls: {
      rejectUnauthorized: false
    }
  },
  defaultValidationFields: {
    invalid: ['honeypot'],
    required: ['mail', 'name', 'message', 'dataprivacy-disclaimer', 'processing-disclaimer']
  },
  templates: {
    html: {
      template: path.resolve('./templates/template.html'),
      partial: path.resolve('./templates/partial.html')
    },
    txt: {
      template: path.resolve('./templates/template.txt'),
      partial: path.resolve('./templates/partial.txt')
    }
  },
  translations: {
    de: {
      name: 'Name',
      surname: 'Nachname',
      mail: 'Absender',
      message: 'Nachricht',
      receiver: 'Empfänger',
      subject: 'Betreff',
      recom: 'Empfehlung',
      phone: 'Telefonnummer',
      bymail: { key: 'Kontakt per Mail', value: 'Ja' },
      byphone: { key: 'Kontakt per Telefon', value: 'Ja' },
      header: 'Neuer Kontaktformular Eintrag',
      reply: '(Oder einfach die "antworten" Funktion des Email Programms nutzen)',
      replybutton: 'Antworten',
      locale: 'Sprache',
      language: 'Sprache',
      'dataprivacy-disclaimer': { key: 'Zustimmung Datenschutz erteilt', value: 'Ja' },
      'processing-disclaimer': { key: 'Zustimmung Datenverarbeitung erteilt', value: 'Ja' },
      by: 'von',
      copyright
    },
    en: {
      name: 'Name',
      surname: 'Surname',
      mail: 'Sender',
      message: 'Message',
      receiver: 'Receiver',
      subject: 'Subject',
      recom: 'Recommendation',
      phone: 'Phonenumber',
      bymail: { key: 'Contact by mail', value: 'Yes' },
      byphone: { key: 'Contact by phone', value: 'Yes' },
      header: 'New contact form entry',
      reply: '(Or just hit "reply" in your email client)',
      replybutton: 'Reply',
      locale: 'Language',
      language: 'Language',
      'dataprivacy-disclaimer': { key: 'Accepted data privacy disclaimer', value: 'Yes' },
      'processing-disclaimer': { key: 'Accepted data processing disclaimer', value: 'Yes' },
      by: 'by',
      true: 'Yes',
      false: 'No',
      copyright
    }
  }
};
