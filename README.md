# SSL Certificate Expiration to Slack

Verify the status of SSL certificate for one of more domains and post this to Slack. This is useful to monitor your own certificates but also certificates of external services you use.

## Deployment



## Configure Webtask

If you haven't configured Webtask on your machine run this first:

```
npm i -g wt-cli
wt init
```

> Requires at least node 0.10.40 - if you're running multiple version of node make sure to load the right version, e.g. "nvm use 0.10.40"

## Deployment

If you just want to run it once:

```
wt create https://raw.githubusercontent.com/sandrinodimattia/ssl-cert-expiration-to-slack/master/task.js \
    --name ssl-cert-expiration-to-slack \
    --secret DOMAINS="google.com;facebook.com;twitter.com" \
    --secret DAYS_THRESHOLD=90 \
    --secret SLACK_INCOMING_WEBHOOK_URL="https://hooks.slack.com/services/xxx"
```

> If the certificate is valid for more than DAYS_THRESHOLD, nothing will be posted to Slack.

If you want to run it on a schedule (run every day at 10 AM for example):

```
wt cron schedule \
    --name ssl-cert-expiration-to-slack \
    --secret DOMAINS="google.com;facebook.com;twitter.com" \
    --secret DAYS_THRESHOLD=90 \
    --secret SLACK_INCOMING_WEBHOOK_URL="https://hooks.slack.com/services/xxx"
    --json \
    "30 10 * * *" \
    https://raw.githubusercontent.com/sandrinodimattia/ssl-cert-expiration-to-slack/master/task.js
```

> If you decide you want to monitor more domains over time just rerun the command to replace your current job.
