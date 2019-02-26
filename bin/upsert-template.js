const AWS = require('aws-sdk');
const fs = require('fs');

const params = {
  Template: {
    TemplateName: 'api-mail-template' /* required */,
    SubjectPart: '{{domain}}: {{header}} {{by}} {{name}} ({{mail}})',
    HtmlPart: fs.readFileSync('./templates/template.html', 'utf-8'),
    TextPart: JSON.stringify(
      fs.readFileSync('./templates/template.txt', 'utf-8')
    ),
  },
};

const ses = new AWS.SES({ region: 'eu-west-1' });

ses
  .getTemplate({ TemplateName: params.Template.TemplateName })
  .promise()
  .then(() => 'updateTemplate')
  .catch(err => {
    if (err.code === 'TemplateDoesNotExist') return 'createTemplate';
    throw err;
  })
  .then(method =>
    ses[method](params)
      .promise()
      .then(res => ({ res, method }))
  )
  .then(({ res, method }) => {
    console.log({ method, res });
  })
  .catch(err => console.error({ err }));
