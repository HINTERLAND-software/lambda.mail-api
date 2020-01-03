require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');

const { AWS_SES_REGION = 'eu-west-1', TEMPLATE_NAME = 'default-template' } = process.env;

const ses = new AWS.SES({ region: AWS_SES_REGION });

const params = {
  Template: {
    ...JSON.parse(
      fs.readFileSync(`./templates/${TEMPLATE_NAME}.json`, 'utf-8')
    ),
    HtmlPart: fs.readFileSync(`./templates/${TEMPLATE_NAME}.html`, 'utf-8'),
    TextPart: fs.readFileSync(`./templates/${TEMPLATE_NAME}.txt`, 'utf-8'),
  },
};

const updateTemplate = async params => {
  console.log('Attempting to update existing template.');
  const res = await ses.updateTemplate(params).promise();
  return { res, method: 'updateTemplate' };
};

const createTemplate = async params => {
  console.log('Attempting to create new template.');
  const res = await ses.createTemplate(params).promise();
  return { res, method: 'createTemplate' };
};

const upsert = async () => {
  try {
    const res = await updateTemplate(params);
    return res;
  } catch (error) {
    if (error.code !== 'TemplateDoesNotExist') throw error;
    console.log(error.message);
    return createTemplate(params);
  }
};

upsert()
  .then(console.log)
  .catch(console.error);
