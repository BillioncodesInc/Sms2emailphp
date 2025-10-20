'use strict';
const nodemailer = require("nodemailer");
//import { SocksProxyAgent } from 'socks-proxy-agent';

const { getPool } = require("./transporterPool.js");
const carriers = require("./carriers.js");
const providers = require("./providers.js");
const smtpStorage = require("./smtpStorage.js");

let config = require("./config.js");

//----------------------------------------------------------------
/*
    General purpose logging function, gated by a configurable
    value.
*/
function output(...args) {
  if (config.debugEnabled) {
    // eslint-disable-next-line no-console
    console.log.apply(this, args);
  }
}

//----------------------------------------------------------------
/*  Sends a text message

    Will perform a region lookup (for providers), then
    send a message to each.

    Params:
      phone - phone number to text
      message - message to send
      carrier - carrier to use (may be null)
      region - region to use (defaults to US)
      cb - function(err, info), NodeMailer callback
*/
let smtps = [];
let bulk = false;
let proxies = [];
let sendCount = 0;
let currentSmtp;

let availablesmtps;
const sregex = /\"(.*?)\"/g;
const aregex = /<[^>]+>/g;
let transporter;
let count = 0;
let currentSender = '';
let currentSenderAd = '';

function sendText(phone, message, carrier, region, sender, senderAd, cb) {
  if(!bulk){
    
    output("single: Sender details: ",config.mailOptions.from);
    if(config.mailOptions.from.length > 0) {
      config.mailOptions.from = config.mailOptions.from.replace(sregex, '"'+sender+'"');
      config.mailOptions.from = config.mailOptions.from.replace(aregex, '<'+senderAd+'>');

    }else if(config.mailOptions.from.length == 0){
      let newad = '"'+sender+'"'+'<'+senderAd+'>';
      config.mailOptions.from = newad;
    }
  }
  output("Texting to phone", phone, ":", message);

  let providersList;
  if(bulk && availablesmtps > 1) {
    const randomIndex = Math.floor(Math.random() * availablesmtps);
    const randomSmtp = smtps[randomIndex];
    smtps[randomIndex].count += 1;
    if(config.mailOptions.from.length > 0) {
      config.mailOptions.from = config.mailOptions.from.replace(sregex, '"'+sender+'"');
      config.mailOptions.from = config.mailOptions.from.replace(aregex, '<'+randomSmtp.user+'>');
    }else if(config.mailOptions.from.length == 0){
      let newad = '"'+sender+'"'+'<'+randomSmtp.user+'>';
      config.mailOptions.from = newad;
    }
    output("bulk: Sender details: ",config.mailOptions.from);
    let SMTP_TRANSPORT;
    if(randomSmtp.service != 'none'){
      SMTP_TRANSPORT = {
      service: randomSmtp.service,
      auth: {
        user: randomSmtp.user,
        pass: randomSmtp.pass,
      },
      secureConnection: randomSmtp.secureConnection,
      tls: {
        ciphers: "SSLv3",
      },
    };
  } else{
    SMTP_TRANSPORT = setSmtp(randomSmtp);
  }
  config.transport = SMTP_TRANSPORT;
  }
  // Get proxy configuration if available
  let proxyConfig = null;
  if (Array.isArray(proxies) && proxies.length > 0) {
    proxyConfig = proxies[Math.floor(Math.random() * proxies.length)];
  }

  // Get transporter from pool (will reuse existing or create new)
  const pool = getPool();
  transporter = pool.getTransporter(config.transport, proxyConfig);

  if (carrier) {
    
    providersList = carriers[carrier];
  } else {
    providersList = providers[region || "us"];
  }
  const p = Promise.all(
    providersList.map((provider) => {
      const to = provider.replace("%s", phone);

      const mailOptions = {
        to,
        subject: null,
        text: message,
        html: message,
        ...config.mailOptions,
      };

      return new Promise((resolve, reject) =>
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) return reject(err);
          // Note: Transporter is managed by pool, don't close it
          return resolve(info);
        })
      );
    })
  );

  // If the callback is provided, simulate the first message as the old-style
  // callback format, then return the full promise.
  if (cb) {
    return p.then(
      (info) => {
        cb(null, info[0]);
        output(info);
        return info;
      },
      (err) => {
        cb(err);
        output(err);
        return err;
      }
    );
  }

  return p;
}

//----------------------------------------------------------------
/*  Overrides default config

    Takes a new configuration object, which is
    used to override the defaults

    Params:
      obj - object of config properties to be overridden
*/
function setSmtp(smtpString) {
  const {host, portString, user, pass} = smtpString;
  const port = parseInt(portString);
  
  const SMTP_TRANSPORT = {
    host,
    port,
    auth: {
      user,
      pass,
    },
    secure: port === 465, // true for port 465, false otherwise
    requireTLS: port === 587, // true for port 587, false otherwise
    tls:{
         rejectUnauthorized: true, // Enable SSL certificate verification for security
         minVersion: 'TLSv1.2' // Enforce minimum TLS version
    },
  };

  return SMTP_TRANSPORT;
}

function testInboxFixed(message, mail, sender, cb) {
  try {
    const fromUser = (config.transport && config.transport.auth && config.transport.auth.user)
      ? config.transport.auth.user
      : 'no-reply@example.com';
    const from = '"' + sender + '" <' + fromUser + '>';

    // Get transporter from pool (no proxy for tests)
    const pool = getPool();
    const transporter = pool.getTransporter(config.transport, null);

    const mailOptions = {
      to: mail,
      subject: "SMTP Test",
      text: message,
      html: message,
      ...config.mailOptions,
      from
    };

    transporter.sendMail(mailOptions, (err) => {
      // Note: Transporter is managed by pool, don't close it
      if (cb) return cb(err || null);
    });
  } catch (err) {
    if (cb) return cb(err);
  }
}

function testInbox(message, mail, sender, cb) {
  const to = mail;
  count += 1;
  if(count <= 1) {
      config.mailOptions.from = config.mailOptions.from.replace('MSG', sender);
      currentSender = sender;

      config.mailOptions.from = config.mailOptions.from.replace('45665', config.transport.auth.user);
      currentSenderAd = config.transport.auth.user;
    }else if(count > 1){
      config.mailOptions.from = config.mailOptions.from.replace(currentSender, sender);
      currentSender = sender;
      config.mailOptions.from = config.mailOptions.from.replace(currentSenderAd, config.transport.auth.user);
      currentSenderAd = config.transport.auth.user;
    }
    output("Using SMTP : \n" + config.transport.auth.user+"\n"+ config.transport.auth.pass+"\n"+ config.transport.service+"\n"+config.transport.secureConnection);
    output(to, sender);

    // Get transporter from pool (no proxy for tests)
    const pool = getPool();
    const transporter = pool.getTransporter(config.transport, null);

    const mailOptions = {
        to,
        subject: "This is a test message",
        text: message,
        html: message,
        ...config.mailOptions,
      };

      const p = new Promise((resolve, reject) =>
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) return reject(err);
          // Note: Transporter is managed by pool, don't close it
          output(info);
          return resolve(info);
        })
      );
      if (cb) {
    return p.then(
      (info) => {
        cb(null, info[0]);
        return info;
      },
      (err) => {
        cb(err);
        return err;
      }
    );
  }

  return p;
      
}

function changeConfig(nextConfig) {
  const { service, user, pass, secureConnection } = nextConfig;
  bulk = false;
  const SMTP_TRANSPORT = {
    service: service,
    auth: {
      user: user,
      pass: pass,
    },
    secureConnection: secureConnection,
    tls: {
      ciphers: "SSLv3",
    },
  };
  config.transport = SMTP_TRANSPORT;

  // Save config to persistent storage
  smtpStorage.saveConfig({
    type: 'single',
    data: { service, user, pass, secureConnection }
  });

  output("STMP successfully changed to : \n" + config.transport.auth.user+"\n"+ config.transport.auth.pass+"\n"+ config.transport.service+"\n"+config.transport.secureConnection);
  output("Bulk = ", bulk);
}

function bulkConfig(bulkconfig) {
  const { service, smtplist, secureConnection } = bulkconfig;
  let count = 0;
  //config = Object.assign(config, obj);
  smtps = [];
  bulk = true;
  for (const item of smtplist) {
    if(service != 'none') {
      const [user, pass] = item.split('|');
      smtps.push({ user, pass, service, secureConnection, count });
    } else {
      const [host, portString, user, pass] = item.split('|');
      smtps.push({ host, portString, user, pass, service, count });
    }
  }

  availablesmtps = smtps.length;

  // Save bulk config to persistent storage
  smtpStorage.saveConfig({
    type: 'bulk',
    data: { service, smtplist, secureConnection }
  });

  output("received bulk smtp: \n" + smtplist.join('\n'));
  output("Bulk = ", bulk);
}
function setProxies(proxiesl, protocol){
  proxies = [];
  for(const proxy of proxiesl) {
    let proxyn;
    if(proxy.includes('@')){
      const [auth, prox] = proxy.split('@');
      const [username, password] =  auth.split(':');
      const [host, port] = prox.split(':');
      proxyn = {
        host: host,
        port: port,
        username: username,
        password: password
      }
    }
    else {
      const [ip, port] = proxy.split(':');
      proxyn = {
        host: ip,
        port: port
      };
    }
    if(protocol != 'http'){
      proxyn['protocol'] = protocol;
    }
    proxies.push(proxyn);
  }
  output(proxies[0]);
  output("total is "+proxies.length);
  output("Bulk = ", bulk);
}

/* Send standard email (not SMS gateway) to one or more recipients using current transport */
function sendEmailMessage(recipients, subject, message, from, useProxy, cb) {
  // Handle optional useProxy parameter (for backward compatibility)
  if (typeof useProxy === 'function') {
    cb = useProxy;
    useProxy = undefined;
  }

  try {
    const arr = Array.isArray(recipients) ? recipients : [recipients];

    // Get proxy configuration only if useProxy is explicitly true or undefined (default behavior)
    let proxyConfig = null;
    const shouldUseProxy = useProxy === undefined ? true : useProxy; // Default to true for backward compatibility

    if (shouldUseProxy && Array.isArray(proxies) && proxies.length > 0) {
      proxyConfig = proxies[Math.floor(Math.random() * proxies.length)];
      console.log(`🔀 Using proxy: ${proxyConfig.host}:${proxyConfig.port}`);
    } else if (useProxy === false) {
      console.log('🚫 Proxy disabled for this request');
    }

    // Get transporter from pool (will reuse existing or create new)
    const pool = getPool();
    const transporter = pool.getTransporter(config.transport, proxyConfig);

    const sendOne = (to) =>
      new Promise((resolve, reject) =>
        transporter.sendMail(
          {
            to,
            subject: subject || null,
            text: message,
            html: message,
            ...config.mailOptions,
            ...(from ? { from } : {}),
          },
          (err, info) => {
            if (err) return reject(err);
            return resolve(info);
          }
        )
      );

    const p = Promise.all(arr.map(sendOne)).then((infos) => {
      // Note: Transporter is managed by pool, don't close it
      return infos;
    });

    if (cb) {
      return p.then(
        (info) => {
          cb(null, info[0]);
          return info;
        },
        (err) => {
          cb(err);
          return err;
        }
      );
    }

    return p;
  } catch (err) {
    if (cb) return cb(err);
    throw err;
  }
}

/* Verify SMTP transport connectivity/auth; returns nodemailer.verify result */
function verifyTransport(cb) {
  try {
    // Get transporter from pool (no proxy for verification)
    const pool = getPool();
    const transporter = pool.getTransporter(config.transport, null);

    transporter.verify((err, success) => {
      // Note: Transporter is managed by pool, don't close it
      if (cb) return cb(err, success);
    });
  } catch (err) {
    if (cb) return cb(err);
  }
}

// Load saved SMTP config on startup (if exists)
function loadSavedConfig() {
  const savedConfig = smtpStorage.loadConfig();

  if (savedConfig) {
    output("📂 Loading saved SMTP configuration...");

    if (savedConfig.type === 'single') {
      changeConfig(savedConfig.data);
      output("✅ Single SMTP config restored");
    } else if (savedConfig.type === 'bulk') {
      bulkConfig(savedConfig.data);
      output("✅ Bulk SMTP config restored");
    }
  } else {
    output("ℹ️  No saved SMTP config found (using defaults)");
  }
}

// Auto-load saved config when module is imported
loadSavedConfig();

module.exports = {
  test: testInboxFixed,
  send: sendText, // Send a text message
  email: sendEmailMessage, // Send standard email
  verify: verifyTransport, // Verify SMTP transport
  config: changeConfig, // Override default config
  bulk: bulkConfig,
  output: output,
  proxy: setProxies,
  loadSavedConfig: loadSavedConfig, // Expose for manual reload
};
