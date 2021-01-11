import { parsePartialsAndBooleans } from './parse';

describe('parse.ts', () => {
  describe('parsePartialsAndBooleans', () => {
    test('parse, sort and sanitize partials and booleans', () => {
      const res = parsePartialsAndBooleans(
        {
          mail: 'mail@johannroehl.de',
          empty: '',
          undef: undefined,
          name: 'Johann',
          xss: '<div><script>alert("evil");</script></div>',
          ignored: 'ignored',
          stringTrue: 'true',
          stringFalse: 'false',
          boolTrue: true,
          boolFalse: false,
        },
        { name: 'Name', mail: 'Sender' },
        ['ignored']
      );

      expect(res).toEqual({
        partials: [
          { key: 'Name', value: 'Johann' },
          { key: 'Sender', value: 'mail@johannroehl.de' },
          {
            key: 'xss',
            value: '<div>&lt;script&gt;alert("evil");&lt;/script&gt;</div>',
          },
        ],
        booleans: [
          {
            key: 'boolFalse',
            value: '<span>&#10060;</span>',
          },
          {
            key: 'boolTrue',
            value: '<span>&#9989;</span>',
          },
          {
            key: 'stringFalse',
            value: '<span>&#10060;</span>',
          },
          {
            key: 'stringTrue',
            value: '<span>&#9989;</span>',
          },
        ],
      });
    });
  });
});
