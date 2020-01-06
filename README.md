# Mail API

[![Circle CI](https://circleci.com/gh/jroehl/lambda.mail-api/tree/master.svg?style=shield&circle-token=f6de3240c2da0ef7594cf3749b404adf7541d8d3)](https://circleci.com/gh/jroehl/lambda.mail-api/tree/master)

AWS Lambda to process mail requests sent by POST request and forward them using AWS SES

## Getting started

Specify the domain configurations as [environment variables](#parse-environment-variables) and run `npm run parse:environment` before deploying the function or running it locally.

Please read [serverless.yml](./serverless.yml) to see what exactly is set up during deployment.

## Parse environment variables

Specify configuration in `.env` file in project root directory:

```bash
# Default values (override default values specified in `./config.ts` file)
## List values are specified as whitespace delimited strings
VALIDATION_WHITELIST="receiver honeypot" # THe mail will not contain whitelisted keys
VALIDATION_BLACKLIST="honeypot" # The payload of the request will be checked for blacklisted keys
VALIDATION_REQUIRED="mail name message dataprivacy-disclaimer processing-disclaimer" # The payload of the request will be checked for missing required keys
OVERRIDE_FOR="@foobar.com" # Override receiver mail when sender matches

# Configuration sets
## Have to be specified as follows, with incrementing indexes
CONFIG_0="johannroehl.de no-reply mail" # Domain SESUser(the user that is registered in aws sns) Receiver(the recipient of the mail)
VALIDATION_REQUIRED_0="required_0" # Override default values for specific configuration with corresponding index

# Additional environment variables you can use
LOCALE="en" # Some translations are available for 'en' and 'de'
PRODUCTION_DOMAIN=foo.com # The previously set up custom production domain (https://github.com/amplify-education/serverless-domain-manager)
DEV_DOMAIN=bar.com # The previously set up custom dev domain (https://github.com/amplify-education/serverless-domain-manager)
```

Parse the environment to `.env.json` file

```bash
npm run parse:environment
```

## Set up ses

1. Set ENV variables

```bash
export ENV=development
export AWS_PROFILE=${ENV}-profile
export AWS_SES_REGION=eu-west-1
export EMAIL=no-reply@johannroehl.de
```

2. Verify email(s)

```bash
aws ses verify-email-identity --email-address user@example.com --region $AWS_SES_REGION
# or
VERIFIED_MAILS=$(cat .env.json | jq -cr '.config[] | "\(.config.sesUser)@\(.config.domain)"')
while read line; do
  echo "Verifying \"$mail\""
  aws ses verify-email-identity --email-address ${line} --region ${AWS_SES_REGION}
done <<< ${VERIFIED_MAILS}
```

3. Update or create template

```bash
npm run upsert:template
```

4. If new setup on new account

```bash
# Create topic if it does not exist
export TOPIC_ARN=`aws sns create-topic --name ses-mail-api-topic --region ${AWS_SES_REGION} --query TopicArn`
# Subscribe to topic (respond to mail)
aws sns subscribe --topic-arn $TOPIC_ARN --protocol email --notification-endpoint ${EMAIL} --region ${AWS_SES_REGION}

# Create ses configuration set
export CS_NAME=ses-configuration-mail-api
aws ses create-configuration-set --configuration-set Name=${CS_NAME} --region ${AWS_SES_REGION}
aws ses create-configuration-set-event-destination --configuration-set-name ${CS_NAME} --region ${AWS_SES_REGION} --event-destination "{\"Name\": \"ses-sns-mail-api\", \"Enabled\": true, \"MatchingEventTypes\": [\"renderingFailure\", \"reject\", \"bounce\", \"complaint\"], \"SNSDestination\": {\"TopicARN\": ${TOPIC_ARN}}}"
```

## TODO

- Documenation
