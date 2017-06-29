const CallbackHandler = require('./callback');

test('Callback returns the right types', (done) => {
  const callback = CallbackHandler((err, res) => {
    expect(err).toBeNull();
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('string');
    done();
  });
  callback.response(200, 'Test', { foo: 'bar' });
});

test('Callback returns error', (done) => {
  const callback = CallbackHandler((err, res) => {
    expect(err).not.toBeNull();
    expect(err.statusCode).toBe(400);
    expect(typeof err.body).toBe('string');
    done();
  });
  callback.response(400, 'Test', { foo: 'bar' });
});
