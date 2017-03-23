'use strict';

const nodemailer = require('nodemailer');

const getCredentials = (domain) => {
  let pass;
  switch (domain) {
    case 'pavillon-am-ufer.de':
      pass = 'RHtHgNzoWsC7*>Dhgm4JmyMD';
      break;
    case 'heidpartner.com':
      pass = 'nmFPq8HpzezN9y=)wzXaMzbg';
      break;
    default:
      // no-reply@johannroehl.de
      pass = 'KtnGKUBd3RLgPyHgRoyfikjE';
  }
  return {
    user: `no-reply@mg.${domain || 'johannroehl.de'}`,
    pass
  };
};

module.exports.sendmail = (event = {}, context, callback) => {
  const {
    sender = '',
      mail = '',
      name = '',
      message = '',
      surname = '',
      phone = '',
      bymail = '',
      byphone = '',
      recom = '',
      domain = '',
      receiver = 'roehl.johann@gmail.com',
  } = event.body || {};

  console.log(event.headers);
  console.log(event.body);

  const response = {};

  if (!sender || !name || !message) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: `No ${sender ? '' : '"sender" '}${name ? '' : '"name" '}${message ? '' : '"message" '}field specified`,
      input: event
    });
    callback(null, response);
  } else {
    const auth = getCredentials(domain);
    const smtpTransport = nodemailer.createTransport(Object.assign({}, {
      port: 587,
      host: 'smtp.mailgun.org',
      tls: {
        rejectUnauthorized: false
      }
    }, {
      auth
    }));

    // setup e-mail data with unicode symbols
    const mailOptions = {
      from: auth.user.replace('mg.', ''), // sender address
      to: receiver, // list of receivers
      subject: `NEW MAIL from ${domain} contact form - ${sender}`, // Subject line
      // replyTo: sender,
      // plaintext body
      text: `NEW MAIL from ${mail}\n
            SENDER ${name} ${surname} | ${mail} ${phone}\n
            MESSAGE ${message}\n
            ${recom ? `RECOMMENDATION ${recom}<br>\n` : ''}
            CONTACTBY ${bymail ? `mail: ${mail}` : ''} ${byphone ? `phone: ${phone}` : ''}`,
      // html body
      html: `<h2 style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">NEW MAIL</h2>
            <table>
              <tr>
                <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">
                  FROM
                </td>
                <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">
                  ${name} ${surname} | ${mail} ${phone}
                </td>
              </tr>
              <tr>
                <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">
                  MESSAGE
                </td>
                <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">
                  ${message}
                </td>
              </tr>
              ${recom ? `<tr><td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">RECOMMENDATION</td><td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">${recom}</td></tr>` : ''}
              <tr>
                <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">
                  CONTACT
                </td>
                <td style="font-family: HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 100">
                  ${bymail ? `mail: ${mail}` : ''} ${byphone ? `phone: ${phone}` : ''}
                </td>
              </tr>
            </table>`
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, (err = {}) => {
      response.statusCode = err.responseCode || 200;
      response.body = JSON.stringify({
        message: err.message || `Mail sent to ${receiver}`,
        input: event,
      });
      response.headers = {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
      };
      // if you don't want to use this transport object anymore, uncomment following line
      smtpTransport.close(); // shut down the connection pool, no more messages
      callback(null, response);
    });
  }
};
