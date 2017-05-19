const self = 'roehl.johann@gmail.com';

const domains = [{
  domain: 'pavillon-am-ufer.de',
  user: 'no-reply@mg.pavillon-am-ufer.de',
  pass: 'RHtHgNzoWsC7*>Dhgm4JmyMD'
},
{
  domain: 'heidpartner.com',
  user: 'no-reply@mg.heidpartner.com',
  pass: 'nmFPq8HpzezN9y=)wzXaMzbg'
},
{
  default: true,
  domain: 'johannroehl.de',
  user: 'no-reply@mg.johannroehl.de',
  pass: 'KtnGKUBd3RLgPyHgRoyfikjE'
}
];

const mailgun = {
  port: 587,
  host: 'smtp.mailgun.org',
  tls: {
    rejectUnauthorized: false
  }
};

module.exports = {
  self,
  domains,
  mailgun
};
