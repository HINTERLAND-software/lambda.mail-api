module.exports = callback => ({
  /**
   *
   * @param {number} statusCode
   * @param {string} message
   * @param {any} input
   */
  response: (statusCode, message, input = '') => {
    const response = {
      statusCode,
      body: JSON.stringify({
        message,
        input
      })
    };
    if (statusCode >= 300) {
      return callback(response);
    }
    return callback(null, response);
  }
});
