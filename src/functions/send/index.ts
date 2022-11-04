import type { AWS } from '@serverless/typescript';
import schema from './schema';

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        private: true,
        cors: true,
        path: 'send/{domain}',
        request: {
          parameters: {
            paths: {
              domain: true,
            },
          },
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
} as AWS['functions'][string];
