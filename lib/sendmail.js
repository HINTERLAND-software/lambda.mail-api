const SmtpTransport = require('./helpers/smtpmailer');
const { getSMTPconfig, processTemplate } = require('./helpers/misc');
const { self, domains } = require('../config');

/**
 * main handler
 */
module.exports = (event = {}, context, callback) => {
  let payload;
  try {
    payload = JSON.parse(event.body || event || {});
  } catch (error) {
    payload = event.body || event || {};
  }
  const {
    mail = '',
    name = '',
    message = '',
    surname = '',
    phone = '',
    bymail = '',
    byphone = '',
    recom = '',
    domain = '',
    honeypot,
    receiver = self
  } = payload;

  const recipient = process.env.STAGE === 'production' ? receiver : self;

  // honeypot triggered
  if (honeypot) return callback(200, 'Mail sent');

  // wrong recipient
  if (
    !recipient.match(new RegExp(`(${domains.map(({ d }) => d).join('|')}|roehl.johann@gmail.com)`))
  ) {
    return callback(400, `${recipient}: Invalid recipient`, event);
  }

  if (!mail || !name || !message) {
    return callback(
      400,
      `No ${mail ? '' : '"mail" '}${name ? '' : '"name" '}${
        message ? '' : '"message" '
      }field specified`,
      event
    );
  }

  const { config, configDomain } = getSMTPconfig(domain);
  const smtpTransport = new SmtpTransport(config);

  const replaceOptions = {
    mail,
    name,
    message,
    surname,
    phone,
    bymail: bymail ? `mail: ${mail}` : '',
    byphone: byphone ? `phone: ${phone}` : '',
    recom: recom ? `RECOMMENDATION ${recom}` : recom
  };

  // setup e-mail data with unicode symbols
  const mailOptions = {
    from: config.auth.user.replace('mg.', ''), // sender address
    to: recipient, // list of receivers
    subject: `NEW MAIL from ${configDomain} contact form - ${mail}`, // Subject line
    // replyTo: sender,
    // plaintext body
    text: processTemplate(replaceOptions, '../../templates/mail.template.txt'),
    // html body
    html: processTemplate(
      Object.assign({}, replaceOptions, {
        recom: recom
          ? processTemplate(replaceOptions, '../../templates/recom.template.html')
          : recom
      }),
      '../../templates/mail.template.html'
    )
  };

  // send mail with defined transport object
  const result = `${Date()} | ${configDomain} | message ${mail} ${name} ${surname} ${message}`;
  smtpTransport.sendMail(mailOptions, recipient, callback);
  console.log(result);
  return result;
};
