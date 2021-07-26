import {
  KeyValueMap,
  KeyValuePairs,
  PartialsAndBooleans,
  Translations,
} from './types';
import { sanitizeString } from './utils';

const byKey = (a: KeyValuePairs, b: KeyValuePairs): number =>
  a.key.localeCompare(b.key);

const sanitize = ({ key, value }: KeyValuePairs): KeyValuePairs => ({
  key: sanitizeString(key),
  value: sanitizeString(`${value}`),
});

export const parsePartialsAndBooleans = (
  keys: KeyValueMap,
  translations: Translations,
  ignoredKeys: string[]
): PartialsAndBooleans => {
  const { partials, booleans } = Object.entries(keys).reduce(
    (partialsAndBooleans, [key, value]) => {
      if (
        value === undefined ||
        value === '' ||
        value === null ||
        ignoredKeys.some((ignored) => ignored === key)
      ) {
        return partialsAndBooleans;
      }

      const stringValue = `${value}`;

      if (stringValue === 'true' || stringValue === 'false') {
        return {
          ...partialsAndBooleans,
          booleans: [
            ...partialsAndBooleans.booleans,
            {
              key: translations[key] || key,
              value:
                stringValue === 'true'
                  ? '<span style="color: green;">&#9989;</span>'
                  : '<span style="color: red;">&#10060;</span>',
            },
          ],
        };
      }

      return {
        ...partialsAndBooleans,
        partials: [
          ...partialsAndBooleans.partials,
          {
            key: translations[key] || key,
            value: translations[stringValue] || value,
          },
        ],
      };
    },
    { partials: [], booleans: [] }
  );

  return {
    partials: partials.sort(byKey).map(sanitize),
    booleans: booleans.sort(byKey).map(sanitize),
  };
};
