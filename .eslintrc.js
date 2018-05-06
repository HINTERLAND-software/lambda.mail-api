module.exports = {
  extends: 'airbnb-base',
  rules: {
    'comma-dangle': 'off',
    strict: 'off'
  },
  plugins: ['jest'],
  env: {
    'jest/globals': true
  }
};
