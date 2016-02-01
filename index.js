const task = require('./task');
const context = {
  data: {
    DOMAINS: process.env.DOMAINS,
    DAYS_THRESHOLD: process.env.DAYS_TRESHOLD || 90,
    SLACK_INCOMING_WEBHOOK_URL: process.env.SLACK_INCOMING_WEBHOOK_URL
  }
};

task(context, (err) => {
  if (err) {
    console.log(JSON.stringify(err, null, 2));
    return process.exit(1);
  }
});
