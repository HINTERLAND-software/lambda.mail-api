'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const { domains, self, mailgun } = require('./config.js');

/**
 * Replace all occurences of placeholders in template specified as key/value pairs
 *
 * @param {object} replaceOptions object with keys to be replaced in template
 * @param {string} templatePath path to template
 */
const processTemplate = (replaceOptions, templatePath) => {
  const template = fs.readFileSync(path.join(__dirname, templatePath)).toString();
  return Object.keys(replaceOptions)
    .reduce(
      (tmp, key) => tmp.replace(new RegExp(`@@${key.toUpperCase()}`, 'g'),
        replaceOptions[key]), template);
};

/**
 * get smtp configuration according to domain
 *
 * @param {string} senderDomain
 */
const getSMTPconfig = (senderDomain) => {
  const config =
    domains.filter(({ domain }) => domain === senderDomain)[0] ||
    domains.filter(domain => domain.default)[0];

  const configDomain = config.domain;

  delete config.domain;
  delete config.default;

  return { configDomain, config: Object.assign({}, mailgun, { auth: Object.assign({}, config) }) };
};

/**
 * main handler
 */
module.exports.sendmail = (event = {}, context, callback) => {
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
      receiver = self,
  } = event.body || event || {};

  const response = {};

  const recipient = process.env.STAGE === 'production' ? receiver : self;

  if (!mail || !name || !message) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: `No ${mail ? '' : '"mail" '}${name ? '' : '"name" '}${message ? '' : '"message" '}field specified`,
      input: event
    });
    callback(null, response);
  } else {
    const { config, configDomain } = getSMTPconfig(domain);
    const smtpTransport = nodemailer.createTransport(config);

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
      text: processTemplate(replaceOptions, '/templates/mail.template.txt'),
      // html body
      html: processTemplate(
        Object.assign({}, replaceOptions, {
          recom: recom ? processTemplate(replaceOptions,
            '/templates/recom.template.html') : recom
        }), '/templates/mail.template.html')
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, (err) => {
      smtpTransport.close(); // shut down the connection pool, no more messages

      response.statusCode = err === null ? 200 : err.responseCode;

      response.body = JSON.stringify({
        message: err === null ?
          `${Date()} | Mail sent to ${recipient}` : err.message
      });
      callback(null, response);
    });

    // log to cloudwatch
    console.log(
      `${Date()} | ${configDomain} | message ${mail} ${name} ${surname} ${message}`
    );
  }
};
