# Mail API

AWS Lambda used to process mail requests sent by POST request and forward them using AWS SES.

Please read [serverless.yml](./serverless.yml) to see what exactly is set up during deployment.

## Update/Insert SSM parameters

> AWS credentials need to be set up as environment variables

Specify configuration in [.config.json](./.config.json) file in project root directory.
You can use [.config.example.json](./.config.example.json) as the base for the configuration, more information about the configuration properties can be found in the comments.

```bash
npm run upsert:ssm
```

## Set up SES

1. Set ENV variables

    ```bash
    export ENV="development"
    export AWS_PROFILE="${ENV}"
    export AWS_SES_REGION="<aws-ses-region>"
    export NOTIFICATION_EMAIL="<email>"
    ```

2. Verify email(s)

    ```bash
    aws ses verify-email-identity --email-address user@example.com --region ${AWS_SES_REGION}
    # or
    VERIFIED_MAILS=$(cat .config.json | jq -cr '.configs[] | "\(.config.sesUser)@\(.config.domain)"')
    while read line; do
      echo "Verifying \"${line}\""
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
    export TOPIC_ARN=`aws sns create-topic --name ses-mail-api-topic --region "${AWS_SES_REGION}" --query TopicArn --output text`
    # Subscribe to topic to receive rejected mail notifications
    aws sns subscribe --topic-arn "${TOPIC_ARN}" --protocol email --notification-endpoint "${NOTIFICATION_EMAIL}" --region "${AWS_SES_REGION}"

    # Wait for email to ${NOTIFICATION_EMAIL} and confirm subscription

    # Create ses configuration set
    export CS_NAME=ses-configuration-mail-api
    aws ses create-configuration-set --configuration-set Name="${CS_NAME}" --region "${AWS_SES_REGION}"
    aws ses create-configuration-set-event-destination --configuration-set-name "${CS_NAME}" --region "${AWS_SES_REGION}" --event-destination "{\"Name\": \"ses-sns-mail-api\", \"Enabled\": true, \"MatchingEventTypes\": [\"renderingFailure\", \"reject\", \"bounce\", \"complaint\"], \"SNSDestination\": {\"TopicARN\": \"${TOPIC_ARN}\"}}"
    ```
