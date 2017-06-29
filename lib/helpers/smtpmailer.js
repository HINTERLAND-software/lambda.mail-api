const nodemailer = require('nodemailer');

module.exports = class SmtpTransport {

  /**
   * Create instance of SmtpTransport
   *
   * @param {object} config
   * @param {function} callback
   * @memberof SmtpTransport
   */
  constructor(config, callback) {
    this.smtpTransport = nodemailer.createTransport(config);
    this.callback = callback;
  }

  /**
   * Send Mail according to options
   *
   * @param {object} mailOptions
   * @param {string} recipient
   * @param {function} [callback=this.callback]
   * @memberof SmtpTransport
   */
  sendMail(mailOptions, recipient, callback = this.callback) {
    // send mail with defined transport object
    this.smtpTransport.sendMail(mailOptions, (err) => {
      this.smtpTransport.close(); // shut down the connection pool, no more messages
      callback(
        err === null ? 200 : err.responseCode,
        err === null ? `${Date()} | Mail sent to ${recipient}` : err.message
      );
    });
  }
};
