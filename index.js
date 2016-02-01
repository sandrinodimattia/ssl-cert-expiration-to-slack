const nconf = require('nconf');
nconf.argv()
  .env()
  .file({ file: './config.json' });

const task = require('./task');
const context = {
  data: {
    DOMAINS: nconf.get('DOMAINS'),
    DAYS_THRESHOLD: nconf.get('DAYS_THRESHOLD'),
    SLACK_INCOMING_WEBHOOK_URL: nconf.get('SLACK_INCOMING_WEBHOOK_URL')
  }
};

task(context, (err) => {
  if (err) {
    console.log(JSON.stringify(err, null, 2));
    return process.exit(1);
  }
});
