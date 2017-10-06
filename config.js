const self = 'roehl.johann@gmail.com';

const domains = [{
  domain: 'heidpartner.com',
  user: 'no-reply@mg.heidpartner.com',
  pass: 'nmFPq8HpzezN9y=)wzXaMzbg'
},
{
  domain: 'vh-gruppe.de',
  user: 'no-reply@mg.vh-gruppe.de',
  pass: ',FpzbL=fatFQ49Ci'
},
{
  default: true,
  domain: 'johannroehl.de',
  user: 'no-reply@johannroehl.de',
  pass: 'KtnGKUBd3RLgPyHgRoyfikjE'
}];

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
