import type { AWS } from '@serverless/typescript';

import { send, config } from './src/functions';

const serverlessConfiguration: AWS = {
  service: '${file(./package.json):name}',
  frameworkVersion: '2',
  useDotenv: true,
  plugins: [
    'serverless-webpack',
    'serverless-plugin-aws-alerts',
    'serverless-domain-manager',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: '${env:AWS_REGION}' as AWS['provider']['region'],
    logRetentionInDays: 30,
    stage: '${opt:stage, env:ENV}', // you can override this via the CLI argument
    apiGateway: {
      minimumCompressionSize: 1024, // Enable gzip compression for responses > 1 KB
      shouldStartNameWithService: true,
      apiKeys: ['${self:service}-key-${self:provider.stage}'],
      usagePlan: {
        quota: { limit: 2000, period: 'MONTH' },
        throttle: { burstLimit: 10, rateLimit: 5 },
      },
    },
    environment: {
      // Service wide environment variables
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      STAGE: '${self:provider.stage}',
      TEMPLATE_NAME:
        '${file(./templates/${env:TEMPLATE_NAME, "default-template"}.json):TemplateName}',
      AWS_SES_REGION: '${env:AWS_SES_REGION, self:provider.region}',
      AWS_SSM_PREFIX: '/${self:service}/${self:provider.stage}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['ses:SendEmail', 'ses:SendTemplatedEmail'],
        Resource:
          'arn:aws:ses:${self:provider.environment.AWS_SES_REGION}:${env:AWS_ACCOUNT_ID}:*',
      },
      {
        Effect: 'Allow',
        Action: ['ssm:GetParameter'],
        Resource:
          'arn:aws:ssm:${self:provider.region}:${env:AWS_ACCOUNT_ID}:parameter${self:provider.environment.AWS_SSM_PREFIX}/*',
      },
      {
        Effect: 'Allow',
        Action: ['kms:Decrypt'],
        Resource:
          'arn:aws:kms:${self:provider.region}:${env:AWS_ACCOUNT_ID}:key/CMK',
      },
    ],
    lambdaHashingVersion: '20201221',
  },
  custom: {
    period: {
      development: 300,
      production: 60,
    },
    enabled: {
      development: false,
      production: true,
    },
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    customDomain: {
      basePath: 'lambda-mail',
      domainName: '${env:CUSTOM_DOMAIN}',
      createRoute53Record: false,
    },
    alerts: {
      topics: {
        alarm: {
          topic:
            'arn:aws:sns:eu-central-1:009255630476:alert-Topic-N47IM5J07MP7',
        },
      },
      definitions: {
        functionThrottles: {
          treatMissingData: 'notBreaching',
          period: '${self:custom.period.${self:provider.stage}}',
        },
        functionErrors: {
          treatMissingData: 'notBreaching',
          period: '${self:custom.period.${self:provider.stage}}',
        },
        functionInvocations: {
          threshold: 50,
          treatMissingData: 'notBreaching',
          period: '${self:custom.period.${self:provider.stage}}',
        },
        functionDuration: {
          threshold: 4000,
          treatMissingData: 'notBreaching',
          period: '${self:custom.period.${self:provider.stage}}',
        },
        statusCodeErrors: {
          metric: 'statusCodeErrors',
          threshold: 0,
          statistic: 'Sum',
          period: '${self:custom.period.${self:provider.stage}}',
          evaluationPeriods: 1,
          comparisonOperator: 'GreaterThanThreshold',
          pattern: '{$.statusCode != 200}',
          treatMissingData: 'missing',
        },
      },
      alarms: [
        {
          name: 'functionThrottles',
          enabled: '${self:custom.enabled.${self:provider.stage}}',
        },
        {
          name: 'functionErrors',
          enabled: true,
        },
        {
          name: 'functionInvocations',
          enabled: true,
        },
        {
          name: 'functionDuration',
          enabled: '${self:custom.enabled.${self:provider.stage}}',
        },
        {
          name: 'statusCodeErrors',
          enabled: true,
        },
      ],
    },
  },
  functions: { send, config },
};

module.exports = serverlessConfiguration;
