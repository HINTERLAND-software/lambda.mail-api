const { processTemplate } = require('./misc');
const { fields, templates, translations } = require('../config');

/**
 * sendmail handler
 * @param {object} smtpConfig
 * @param {object} smtpTransport
 * @param {object} keys
 * @param {string} recipient
 */
module.exports = async (smtpConfig, smtpTransport, keys, recipient) => {
  const { locale = 'de' } = keys;
  const { config, configDomain } = smtpConfig;
  // setup e-mail data with unicode symbols
  const mailOptions = {
    from: config.auth.user.replace('mg.', ''), // sender address
    to: recipient, // list of receivers
    subject: `${configDomain}: ${translations[locale].header} ${translations[locale].by} ${
      keys.name
    } (${keys.mail})`, // Subject line
    replyTo: keys.mail,
    text: processTemplate(keys, templates.txt, locale), // plaintext body
    html: processTemplate(keys, templates.html, locale) // html body
  };

  // send mail with defined transport object
  const result = `${Date()} | ${configDomain} | message "${fields.required
    .map(key => keys[key])
    .join('", "')}"`;

  try {
    const res = await smtpTransport.sendMail(mailOptions, recipient);
    return {
      statusCode: 200,
      message: res,
      result: process.env.NODE_ENV === 'test' ? mailOptions : result
    };
  } catch (error) {
    return { statusCode: error.statusCode || 400, message: error.message, result: error };
  }
};
