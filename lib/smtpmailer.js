const nodemailer = require('nodemailer');

module.exports = class SmtpTransport {
  /**
   * Create instance of SmtpTransport
   *
   * @param {object} config
   * @memberof SmtpTransport
   */
  constructor(config) {
    this.smtpTransport = nodemailer.createTransport(config);
  }

  /**
   * Send Mail according to options
   *
   * @param {object} mailOptions
   * @param {string} recipient
   * @throws {error} smtpTransport error
   * @memberof SmtpTransport
   */
  async sendMail(mailOptions, recipient) {
    // send mail with defined transport object
    await this.smtpTransport.sendMail(mailOptions);
    this.smtpTransport.close();
    return `${Date()} | Mail sent to ${recipient}`;
  }
};
