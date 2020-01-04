import { config } from 'dotenv';
import { SES } from 'aws-sdk';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '../lib/utils';

config();

const {
  AWS_SES_REGION = 'eu-west-1',
  TEMPLATE_NAME = 'default-template',
} = process.env;

const ses = new SES({ region: AWS_SES_REGION });

const getTemplate = fileEnding =>
  readFileSync(
    resolve(__dirname, '..', 'templates', `${TEMPLATE_NAME}.${fileEnding}`),
    'utf-8'
  );

const params: SES.UpdateTemplateRequest = {
  Template: {
    ...JSON.parse(getTemplate('json')),
    HtmlPart: getTemplate('html'),
    TextPart: getTemplate('txt'),
  },
};

const updateTemplate = async (params: SES.UpdateTemplateRequest) => {
  Logger.log('Attempting to update existing template.');
  const res = await ses.updateTemplate(params).promise();
  return { method: 'updateTemplate', ...res };
};

const createTemplate = async (params: SES.UpdateTemplateRequest) => {
  Logger.log('Attempting to create new template.');
  const res = await ses.createTemplate(params).promise();
  return { method: 'createTemplate', ...res };
};

const upsert = async () => {
  try {
    const res = await updateTemplate(params);
    return res;
  } catch (error) {
    if (error.code !== 'TemplateDoesNotExist') throw error;
    Logger.log(error.message);
    return createTemplate(params);
  }
};

upsert()
  .then(Logger.log)
  .catch(Logger.error);
