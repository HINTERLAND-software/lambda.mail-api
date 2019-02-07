# Mail API

[![Circle CI](https://circleci.com/gh/jroehl/lambda.mail-api/tree/master.svg?style=shield&circle-token=f6de3240c2da0ef7594cf3749b404adf7541d8d3)](https://circleci.com/gh/jroehl/lambda.mail-api/tree/master)

AWS Lambda to process sent mail requests and forward them through a smtp mailer to the different recipients

## Set up domain [eu-west-1]

1. Go to [aws console > ses](https://eu-west-1.console.aws.amazon.com/ses/home?region=eu-west-1) and register new domain.
2. Add DNS records to domain
   (If email is supposed to receive mails add `example.com MX 10 inbound-smtp.eu-west-1.amazonaws.com`)

```bash
export AWS_PROFILE=jrdev-routing
export AWS_REGION=eu-west-1

# Verify email[s]
aws ses verify-email-identity --email-address user@example.com --region $AWS_REGION
# or
while read mail; do
  echo "Verifying \"$mail\""
  aws ses verify-email-identity --email-address $mail --region $AWS_REGION
done < ./verified_mails

# update or create template
npm run upsert:template

# create topic if it does not exist
export TOPIC_ARN=`aws sns create-topic --name ses-mailing-topic --region $AWS_REGION --query 'TopicArn'`
# subscribe to topic
aws sns subscribe --topic-arn $TOPIC_ARN --protocol email --notification-endpoint <email> --region $AWS_REGION

# create ses configuration set
export CS_NAME=ses-configuration
aws ses create-configuration-set --configuration-set Name=$CS_NAME --region $AWS_REGION
aws ses create-configuration-set-event-destination --configuration-set-name $CS_NAME --region $AWS_REGION --event-destination "{\"Name\": \"ses-sns-renderingfailure\", \"Enabled\": true, \"MatchingEventTypes\": [\"renderingFailure\", \"reject\", \"bounce\", \"complaint\"], \"SNSDestination\": {\"TopicARN\": \"$TOPIC_ARN\"}}"

```