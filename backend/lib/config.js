'use strict';

const securityConfig = require('./securityConfig');

const SENDMAIL_TRANSPORT = {
  // This transport uses the local sendmail installation.
  sendmail: true
};

const SMTP_TRANSPORT = {
  service: process.env.SMTP_SERVICE || '',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  secureConnection: process.env.SMTP_SECURE || 'true'
};

const config = {
  transport: SMTP_TRANSPORT,
  mailOptions: {
    from: process.env.MAIL_FROM || '"Sender" <noreply@example.com>',
    priority: 'high'
  },
  debugEnabled: process.env.DEBUG === 'true' || false,
  poolOptions: {
    maxPoolSize: parseInt(process.env.POOL_MAX_SIZE, 10) || 10,
    maxMessagesPerConnection: parseInt(process.env.POOL_MAX_MESSAGES, 10) || 100,
    idleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT, 10) || 300000,
    connectionTimeout: parseInt(process.env.POOL_CONNECTION_TIMEOUT, 10) || 30000,
    debugEnabled: process.env.POOL_DEBUG === 'true' || false
  },
  sendmailTransport: SENDMAIL_TRANSPORT
};

function applyTlsPolicy() {
  const tlsPolicy = securityConfig.getTlsPolicy();
  config.transport.tls = {
    ciphers: 'SSLv3',
    rejectUnauthorized: !tlsPolicy.allowInvalidCertificates,
    minVersion: tlsPolicy.minVersion
  };
}

Object.defineProperty(config, 'tlsPolicy', {
  enumerable: true,
  get: () => securityConfig.getTlsPolicy()
});

applyTlsPolicy();
securityConfig.subscribe(applyTlsPolicy);

module.exports = config;
