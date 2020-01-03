import config from '../config';

const { domains, defaults, forced, translations } = config;

declare type HTTPResponse = {
  statusCode: Number;
  headers: {
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': string;
  };
  body: string;
};

/**
 * Handle the http response
 *
 * @param {Number} statusCode
 * @param {String} message
 * @param {any} [input='']
 * @returns {HTTPResponse}
 */
export const httpResponse = (
  statusCode: Number,
  message: String,
  input: any = ''
): HTTPResponse => {
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
 * @param {object} keys
 * @returns {object}
 */
export const getConfig = (senderDomain, keys) => {
  const [fallback] = domains;
  const self = `${fallback.endpoint}@${fallback.domain}`;

  const config = domains.find(({ domain }) => domain === senderDomain);
  if (!config) throw new Error(`Domain "${senderDomain}" not set up`);

  const { locale = defaults.locale, mail = self } = keys;
  const locales = translations[locale];

  const recipient = `${config.endpoint || defaults.endpoint}@${config.domain}`;

  const forceRecipient = forced.some(f => mail.includes(f));
  const environment =
    process.env.JEST_WORKER_ID !== undefined ? 'test' : process.env.STAGE;

  let recipientForced;
  if (forceRecipient || !environment.match(/(production|test)/i)) {
    recipientForced = self;
  }

  return {
    ...defaults,
    keys,
    locales,
    environment,
    recipient,
    recipientForced,
    mail,
    ...config,
  };
};
