require('dotenv').config();
const changeCase = require('change-case');

const keys = {
  setup: ['DOMAIN', 'RECEIVER', 'USER'],
  config: [
    'FORCE_MAIL',
    'VALIDATION_BLACKLIST',
    'VALIDATION_REQUIRED',
    'VALIDATION_WHITELIST',
  ],
};

const initParse = env => (keys, i) => {
  return keys.reduce((parsed, key) => {
    const keyIndex = `${key}_${i}`;
    const value = env[keyIndex] || env[key];
    if (!value) return parsed;
    const property = changeCase.camelCase(keyIndex.replace(`_${i}`, ''));
    return {
      ...parsed,
      [property]: value.split(' '),
    };
  }, {});
};

const parse = () => {
  const parseKeys = initParse(process.env);

  let results = {};
  let index = 0;
  while (true) {
    const setup = parseKeys(keys.setup, index);
    const config = parseKeys(keys.config, index);
    if (Object.keys(setup).length !== keys.setup.length) break;
    results = {
      ...results,
      [setup.domain]: {
        index,
        setup,
        config,
      },
    };
    index = index + 1;
  }

  return results;
};

console.log(JSON.stringify(parse(), null, 2));

module.exports = parse;
