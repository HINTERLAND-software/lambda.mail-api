import type { AWS } from '@serverless/typescript';

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  alarms: [
    {
      name: 'functionThrottles',
      enabled: false,
    },
    {
      name: 'functionDuration',
      enabled: false,
    },
    {
      name: 'functionErrors',
      enabled: false,
    },
    {
      name: 'statusCodeErrors',
      enabled: false,
    },
  ],
  events: [
    {
      http: {
        private: true,
        cors: true,
        path: '/config/{domain}',
        method: 'get',
      },
    },
  ],
} as AWS['functions'];
