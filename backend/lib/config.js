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
};
