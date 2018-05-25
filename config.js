const path = require('path');

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
      domain: 'vh-gruppe.de',
      user: 'no-reply@mg.vh-gruppe.de',
      pass: ',FpzbL=fatFQ49Ci'
    },
    {
      fallback: true,
      domain: 'johannroehl.de',
      user: 'no-reply@johannroehl.de',
      pass: 'KtnGKUBd3RLgPyHgRoyfikjE'
    }
  ],
  mailgun: {
    port: 587,
    host: 'smtp.mailgun.org',
    tls: {
      rejectUnauthorized: false
    }
  },
  fields: {
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
      'dataprivacy-disclaimer': 'Zustimmung Datenschutz erteilt',
      'processing-disclaimer': 'Zustimmung Datenverarbeitung erteilt',
      by: 'von',
      true: 'Ja',
      false: 'Nein'
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
      'dataprivacy-disclaimer': 'Accepted data privacy disclaimer',
      'processing-disclaimer': 'Accepted data processing disclaimer',
      by: 'by',
      true: 'Yes',
      false: 'No'
    }
  }
};
