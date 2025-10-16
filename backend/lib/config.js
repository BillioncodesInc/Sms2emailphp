const SENDMAIL_TRANSPORT = {
  // This transport uses the local sendmail installation.
  sendmail: true,
};

const SMTP_TRANSPORT = {
  service: process.env.SMTP_SERVICE || "",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  secureConnection: process.env.SMTP_SECURE || "true",
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: true, // Enable SSL verification
    minVersion: 'TLSv1.2'
  },
};

module.exports = {
  transport: SMTP_TRANSPORT,
  mailOptions: {
    from: process.env.MAIL_FROM || '"Sender" <noreply@example.com>',
    priority: 'high',
  },
  debugEnabled: process.env.DEBUG === 'true' || false,

  // Transporter Pool Configuration
  poolOptions: {
    maxPoolSize: parseInt(process.env.POOL_MAX_SIZE) || 10,
    maxMessagesPerConnection: parseInt(process.env.POOL_MAX_MESSAGES) || 100,
    idleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT) || 300000, // 5 minutes
    connectionTimeout: parseInt(process.env.POOL_CONNECTION_TIMEOUT) || 30000, // 30 seconds
    debugEnabled: process.env.POOL_DEBUG === 'true' || false, // Set to true for debugging
  }
};
