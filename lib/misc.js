const { domains, defaults, forced } = require('../config');

const VARIANTS = {
  CLEAN: 'CLEAN',
  FORCED: 'FORCED',
  FALLBACK: 'FALLBACK',
};

const [fallback] = domains;
const self = `${fallback.endpoint}@${fallback.domain}`;

/**
 * Handle the http response
 * @param {string} statusCode
 * @param {string} message
 * @param {string} [input='']
 */
const httpResponse = (statusCode, message, input = '') => {
  const res = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*',
    },
    body: JSON.stringify({
      message,
      input,
    }),
  };
  // log to cloudwatch if not test
  if (process.env.NODE_ENV !== 'test') {
    console.log(JSON.stringify({ statusCode, message, input }, null, 2));
  }
  return res;
};

/**
 * get smtp configuration according to domain
 *
 * @param {string} senderDomain
 * @param {string} [receiver=self]
 * @returns {object}
 */
const getConfig = (senderDomain, receiver = self) => {
  let config = domains.find(({ domain }) => domain === senderDomain);
  let variant = VARIANTS.CLEAN;
  if (!config) {
    variant = VARIANTS.FALLBACK;
    config = fallback;
  }
  let recipient = `${config.endpoint}@${config.domain}`;

  const forceRecipient = forced.some(f => receiver.includes(f));
  const environment =
    process.env.JEST_WORKER_ID !== undefined ? 'test' : process.env.STAGE;

  if (forceRecipient || !environment.match(/(production|test)/i)) {
    variant = VARIANTS.FORCED;
    recipient = self;
  }

  return {
    ...defaults,
    ...config,
    environment,
    variant,
    recipient,
    receiver,
  };
};

module.exports = {
  httpResponse,
  getConfig,
  VARIANTS,
};
