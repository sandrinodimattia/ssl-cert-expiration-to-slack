"use latest";

const fs = require('fs');
const async = require('async');
const https = require('https');
const moment = require('moment');
const request = require('request');

module.exports = (context, done) => {
  var required_settings = ['DOMAINS', 'DAYS_THRESHOLD', 'SLACK_INCOMING_WEBHOOK_URL'];
  var missing_settings = required_settings.filter((setting) => !context.data[setting]);
  if (missing_settings.length) {
    return done({ message: 'Missing settings: ' + missing_settings.join(', ') });
  }

  const verifyCertificate = (domain, cb) => {
    try {
      https.request({ host: domain, port: 443, method: 'get', path: '/', rejectUnauthorized: false }, (res) => {
        const cert = res.socket.getPeerCertificate();
        const valid_until = moment.utc(moment(Date.parse(cert.valid_to)));

        cb(null, {
          domain,
          valid_until,
          is_valid: valid_until.isAfter(moment()),
          days_remaining: Math.round(moment.duration(valid_until.diff(moment())).asDays())
        });
      }).on('error', (err) => {
        cb({ domain, message: err.message });
      }).end();
    }
    catch (e) {
      cb({ domain, message: e.message });
    }
  }

  const publishStatus = (domain, cb) => {
    verifyCertificate(domain, (err, details) => {
      if (err) {
        console.log('Error verifying certificate:', err.message);
        return cb();
      }

      if (details.days_remaining > context.data.DAYS_THRESHOLD) {
        console.log(`Skipping ${domain} which expires in ${details.days_remaining} days`);
        return cb();
      }

      var color = '#95A5A6';
      var message = `The certificate for '${details.domain}' will expire in ${details.days_remaining} days.`;
      if (details.days_remaining < 45) {
        color = '#FF9800';
        message = `Watch out! The certificate for '${details.domain}' will expire in ${details.days_remaining} days.`;
      } else if (details.days_remaining <= 0 || !details.is_valid) {
        color = '#F35A00';
        message = `Oh no! The certificate for '${details.domain}' expired!`;
      }

      var msg = {
        username: 'certs-bot',
        icon_emoji: ':earth_americas:',
        attachments: [{
          'color': color,
          'fallback': message,
          'text': `Certificate check for: ${details.domain}`,
          'fields': [
            { 'title': 'Valid Until', 'value': details.valid_until, 'short': true },
            { 'title': 'Days Remaining', 'value': details.days_remaining, 'short': true }
          ],
        }]
      };

      request.post({ url: context.data.SLACK_INCOMING_WEBHOOK_URL, form: { payload: JSON.stringify(msg) } }, (err, res, body) => {
        if (err) {
          console.log('Error posting to Slack:', err.message);
          return cb();
        }

        console.log(`Slack message posted for ${domain} which expires in ${details.days_remaining} days`);
        cb();
      });
    });
  };

  async.each(context.data.DOMAINS.split(';'), publishStatus, (err) => {
    done(err);
  });
};
