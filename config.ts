const copyright = `© 2013 - ${new Date().getFullYear()} jr | development`;

export const VALIDATIONS = {
  OVERRIDE_FOR: [],
  VALIDATION_BLACKLIST: ['honeypot'],
  VALIDATION_WHITELIST: ['receiver', 'domain'],
  VALIDATION_REQUIRED: [
    'mail',
    'name',
    'message',
    'dataprivacy-disclaimer',
    'processing-disclaimer',
  ],
};

export const translations = {
  de: {
    'dataprivacy-disclaimer': 'Zustimmung Datenschutz erteilt',
    'processing-disclaimer': 'Zustimmung Datenverarbeitung erteilt',
    by: 'von',
    bymail: 'Kontakt per Mail',
    byphone: 'Kontakt per Telefon',
    copyright,
    false: 'Nein',
    form: 'Kontaktformular',
    from: 'von',
    header: 'Neuer Kontaktformular Eintrag',
    language: 'Sprache',
    locale: 'Sprache',
    mail: 'Absender',
    message: 'Nachricht',
    name: 'Name',
    phone: 'Telefonnummer',
    receiver: 'Empfänger',
    recom: 'Empfehlung',
    reply: '(Oder einfach die "Antworten" Funktion des Email Programms nutzen)',
    replybutton: 'Antworten',
    subject: 'Betreff',
    surname: 'Nachname',
    true: 'Ja',
  },
  en: {
    'dataprivacy-disclaimer': 'Accepted data privacy disclaimer',
    'processing-disclaimer': 'Accepted data processing disclaimer',
    by: 'by',
    bymail: 'Contact by mail',
    byphone: 'Contact by phone',
    copyright,
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
