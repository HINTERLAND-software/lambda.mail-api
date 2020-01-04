import { httpResponse, Logger } from './utils';

describe('httpResponse', () => {
  test('returns http success response', () => {
    const response = httpResponse(200, 'test', { foo: 'bar' });
    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': '*',
      },
      body: JSON.stringify({
        message: 'test',
        input: { foo: 'bar' },
      }),
    });
  });
  test('returns http error response', () => {
    const response = httpResponse(400, 'test', { foo: 'bar' });
    expect(response).toEqual({
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': '*',
      },
      body: JSON.stringify({
        message: 'test',
        input: { foo: 'bar' },
      }),
    });
  });
});

describe('Logger', () => {
  let spyLog;
  let spyWarn;
  let spyInfo;
  let spyError;
  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log');
    spyWarn = jest.spyOn(console, 'warn');
    spyInfo = jest.spyOn(console, 'info');
    spyError = jest.spyOn(console, 'error');
  });
  test('calls only console.error if run in test', () => {
    Logger.log('log');
    Logger.warn('warn');
    Logger.info('info');
    Logger.error('error');
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyError).toHaveBeenCalledWith('error');
  });

  test('calls console methods', () => {
    process.env.NODE_ENV = 'dev';
    Logger.log('log');
    Logger.warn('warn');
    Logger.info('info');
    Logger.error('error');
    expect(spyLog).toHaveBeenCalledWith('log');
    expect(spyWarn).toHaveBeenCalledWith('warn');
    expect(spyInfo).toHaveBeenCalledWith('info');
    expect(spyError).toHaveBeenCalledWith('error');
  });
});
