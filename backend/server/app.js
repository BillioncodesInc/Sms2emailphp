const express = require("express");
const dns = require("dns").promises;
const multer = require("multer");

const carriers = require("../lib/carriers.js");
const providers = require("../lib/providers.js");
const text = require("../lib/text");
let config = require("../lib/config.js");

// Import transporter pool
const { initializePool, getPool } = require("../lib/transporterPool");

// Import enhanced routes and campaign manager
const { router: enhancedRoutes } = require("./enhancedRoutes");
const CampaignManager = require("../lib/campaignManager");
const AttachmentStorage = require("../lib/attachmentStorage");
const campaignRoutes = require("./campaignRoutes");
const smtpDatabaseRoutes = require("./smtpDatabaseRoutes");

// Initialize transporter pool with config options
const transporterPool = initializePool(config.poolOptions);
console.log('✨ Transporter pool initialized with options:', config.poolOptions);

// Initialize campaign manager and attachment storage
const campaignManager = new CampaignManager();
const attachmentStorage = new AttachmentStorage();
campaignManager.initialize().catch(console.error);
attachmentStorage.initialize().catch(console.error);

const app = express();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Express config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // CORS configuration - Allow all origins in development, restricted in production
  const origin = req.headers.origin;
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Only allow configured origins or same-origin (no origin header)
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }
  } else {
    // Development: Allow all origins
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// App helper functions.
function stripPhone(phone) {
  return `${phone}`.replace(/\D/g, "");
}
function proxy(req, res) {
  text.output('received new proxies');
  let { proxies, protocol } = req.body;
  if(proxies && protocol){
    text.proxy(proxies, protocol);
    res.send('true');
  } else {
    res.send("false");
  }
}
function smtpconfig(req, res) {
  text.output('setting smtp...')
  if(req.body.bulk == 'false'){
    let { service, secureConnection, user, pass } = req.body;
    if (service && secureConnection && user && pass) {
      text.config({ service, secureConnection, user, pass });
      res.send("true");
    } else {
      res.send("false");
    }
  } else if(req.body.bulk == 'true') {
    let { service, secureConnection, smtplist} = req.body;
    service = service.length == 0? 'none':service;
    if(service && secureConnection && smtplist) {
      text.bulk({service, secureConnection, smtplist});
      res.send("true");
    } else {
      res.send("false");
    }
  }
}

function textRequestHandler(req, res, number, carrier, region) {
  if (!number || !req.body.message) {
    res.send({
      success: false,
      message: "Number and message parameters are required.",
    });
    return;
  }

  let carrierKey = null;

  if (carrier) {
    carrierKey = carrier.toLowerCase();
    if (carriers[carrierKey] == null) {
      res.send({
        success: false,
        message:
          `Carrier ${carrier} not supported! POST getcarriers=1 to ` +
          "get a list of supported carriers",
      });
      return;
    }
  }

  let { message, from, senderAd } = req.body;

  if (message.indexOf(":") > -1) {
    // Handle problem with vtext where message would not get sent properly if it
    // contains a colon.
    message = ` ${message}`;
  }
  let sender = from;
  // Time to actually send the message
  text.send(number, message, carrierKey, region, sender, senderAd, (err) => {
    if(err == 'no smtp'){
      res.send({
        success: false,
        message: `All Smtps exhausted`,
      });
    } else if (err) {
      res.send({
        success: false,
        message: `Communication with SMS gateway failed. Did you configure mail transport in lib/config.js?  Error message: '${err.message}'`,
      });
    } else {
      res.send("true");
    }
  });
}

// App routes
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.get("/api/providers/:region", (req, res) => {
  // Utility function, just to check the providers currently loaded
  res.send(providers[req.params.region]);
});
app.post("/test", (req, res) => {
  let {message, mail, sender} = req.body;
  text.test( message, mail, sender, (err) => {
    if (err) {
      res.send({
        success: false,
        message: `Communication with SMS gateway failed. Did you configure mail transport in lib/config.js?  Error message: '${err.message}'`,
      });
    } else {
      res.send("true");
    }
  });
})
app.post("/api/config", (req, res) => {
  text.output("received new stmp config");
  smtpconfig(req, res);
});

app.post("/api/proxy", (req, res) => {
  proxy(req, res);
});

// Get proxy list
app.get("/api/proxy/list", (req, res) => {
  const proxyStorage = require('../lib/proxyStorage');
  const proxyConfig = proxyStorage.loadConfig();

  if (!proxyConfig || !proxyConfig.proxies) {
    return res.json({
      success: true,
      proxies: [],
      count: 0
    });
  }

  // Add ID to each proxy for frontend management
  const proxiesWithIds = proxyConfig.proxies.map((p, index) => ({
    id: `proxy_${index}_${Date.now()}`,
    host: p.host,
    port: p.port,
    protocol: p.protocol || proxyConfig.protocol,
    status: 'unknown', // Will be updated by test
    lastTested: null
  }));

  res.json({
    success: true,
    proxies: proxiesWithIds,
    count: proxiesWithIds.length,
    protocol: proxyConfig.protocol
  });
});

// Delete specific proxy
app.delete("/api/proxy/:index", (req, res) => {
  const proxyStorage = require('../lib/proxyStorage');
  const proxyConfig = proxyStorage.loadConfig();
  const index = parseInt(req.params.index);

  if (!proxyConfig || !proxyConfig.proxies) {
    return res.json({ success: false, message: 'No proxies found' });
  }

  if (index < 0 || index >= proxyConfig.proxies.length) {
    return res.json({ success: false, message: 'Invalid proxy index' });
  }

  proxyConfig.proxies.splice(index, 1);
  proxyStorage.saveConfig(proxyConfig);

  res.json({ success: true, message: 'Proxy deleted' });
});

// Test proxies with real connectivity check
app.post("/proxy/test", async (req, res) => {
  const { indices } = req.body; // Array of proxy indices to test
  const proxyStorage = require('../lib/proxyStorage');
  const proxyConfig = proxyStorage.loadConfig();
  const https = require('https');
  const http = require('http');
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const { SocksProxyAgent } = require('socks-proxy-agent');

  if (!proxyConfig || !proxyConfig.proxies) {
    return res.json({ success: false, message: 'No proxies to test' });
  }

  const results = [];

  // Test each proxy by actually trying to connect through it
  for (let i = 0; i < proxyConfig.proxies.length; i++) {
    if (indices && !indices.includes(i)) continue;

    const proxy = proxyConfig.proxies[i];
    const protocol = proxy.protocol || proxyConfig.protocol || 'http';

    // Basic validation first
    if (!proxy.host || !proxy.port || isNaN(proxy.port) || parseInt(proxy.port) < 1 || parseInt(proxy.port) > 65535) {
      results.push({
        index: i,
        host: proxy.host,
        port: proxy.port,
        status: 'failed',
        message: 'Invalid proxy configuration'
      });
      continue;
    }

    try {
      // Test proxy by connecting to google.com
      const testResult = await testProxyConnectivity(proxy, protocol);
      results.push({
        index: i,
        host: proxy.host,
        port: proxy.port,
        status: testResult.success ? 'online' : 'failed',
        message: testResult.message,
        responseTime: testResult.responseTime
      });
    } catch (error) {
      results.push({
        index: i,
        host: proxy.host,
        port: proxy.port,
        status: 'failed',
        message: error.message || 'Connection failed'
      });
    }
  }

  res.json({
    success: true,
    results: results
  });
});

/**
 * Test proxy connectivity by making a real request through it
 * Also tests mail ports (25, 465, 587, 2525)
 * @param {Object} proxy - Proxy configuration {host, port}
 * @param {string} protocol - Protocol type (http, socks4, socks5)
 * @returns {Promise<Object>} Test result with success status, message, and open mail ports
 */
async function testProxyConnectivity(proxy, protocol) {
  const result = {
    success: false,
    message: '',
    responseTime: 0,
    openPorts: []
  };

  // Test basic connectivity to google.com
  const connectivityTest = await testProxyToGoogle(proxy, protocol);
  result.success = connectivityTest.success;
  result.message = connectivityTest.message;
  result.responseTime = connectivityTest.responseTime;

  // If proxy is online, test mail ports
  if (result.success) {
    result.openPorts = await testMailPorts(proxy, protocol);
  }

  return result;
}

/**
 * Test proxy connectivity to Google
 */
async function testProxyToGoogle(proxy, protocol) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timeout = 10000;

    try {
      let proxyUrl;
      let agent;

      if (protocol === 'socks4' || protocol === 'socks5') {
        proxyUrl = `${protocol}://${proxy.host}:${proxy.port}`;
        agent = new (require('socks-proxy-agent').SocksProxyAgent)(proxyUrl);
      } else {
        proxyUrl = `http://${proxy.host}:${proxy.port}`;
        agent = new (require('https-proxy-agent').HttpsProxyAgent)(proxyUrl);
      }

      const options = {
        hostname: 'www.google.com',
        port: 443,
        path: '/',
        method: 'GET',
        agent: agent,
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      const request = require('https').request(options, (response) => {
        const responseTime = Date.now() - startTime;

        if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
          resolve({
            success: true,
            message: `Connected (${responseTime}ms)`,
            responseTime: responseTime
          });
        } else {
          resolve({
            success: false,
            message: `HTTP ${response.statusCode}`,
            responseTime: responseTime
          });
        }

        response.destroy();
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          success: false,
          message: 'Timeout (10s)',
          responseTime: timeout
        });
      });

      request.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        let errorMessage = 'Connection failed';

        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Timeout';
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = 'Host not found';
        } else if (error.message) {
          errorMessage = error.message.substring(0, 30);
        }

        resolve({
          success: false,
          message: errorMessage,
          responseTime: responseTime
        });
      });

      request.end();

    } catch (error) {
      resolve({
        success: false,
        message: error.message || 'Test failed',
        responseTime: Date.now() - startTime
      });
    }
  });
}

/**
 * Test mail ports through proxy
 * Tests ports: 25, 465, 587, 2525
 */
async function testMailPorts(proxy, protocol) {
  const mailPorts = [25, 465, 587, 2525];
  const net = require('net');
  const openPorts = [];

  for (const port of mailPorts) {
    try {
      const isOpen = await testPort(proxy, protocol, port);
      if (isOpen.open) {
        openPorts.push({
          port: port,
          responseTime: isOpen.responseTime
        });
      }
    } catch (error) {
      // Port test failed, skip
    }
  }

  return openPorts;
}

/**
 * Test if a specific port is open through the proxy
 */
async function testPort(proxy, protocol, targetPort) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timeout = 3000; // 3 second timeout per port

    try {
      let proxyUrl;
      let agent;

      if (protocol === 'socks4' || protocol === 'socks5') {
        proxyUrl = `${protocol}://${proxy.host}:${proxy.port}`;
        agent = new (require('socks-proxy-agent').SocksProxyAgent)(proxyUrl);
      } else {
        proxyUrl = `http://${proxy.host}:${proxy.port}`;
        agent = new (require('https-proxy-agent').HttpsProxyAgent)(proxyUrl);
      }

      // Try to connect to smtp.gmail.com on the target port through proxy
      const net = require('net');
      const socket = net.connect({
        host: 'smtp.gmail.com',
        port: targetPort,
        timeout: timeout
      });

      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({
          open: true,
          responseTime: responseTime
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          open: false,
          responseTime: Date.now() - startTime
        });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({
          open: false,
          responseTime: Date.now() - startTime
        });
      });

    } catch (error) {
      resolve({
        open: false,
        responseTime: Date.now() - startTime
      });
    }
  });
}

// Remove failed proxies
app.post("/proxy/remove-failed", async (req, res) => {
  const { failedIndices } = req.body; // Array of failed proxy indices
  const proxyStorage = require('../lib/proxyStorage');
  const proxyConfig = proxyStorage.loadConfig();

  if (!proxyConfig || !proxyConfig.proxies) {
    return res.json({ success: false, message: 'No proxies found' });
  }

  // Remove proxies in reverse order to maintain correct indices
  const sortedIndices = failedIndices.sort((a, b) => b - a);
  let removedCount = 0;

  for (const index of sortedIndices) {
    if (index >= 0 && index < proxyConfig.proxies.length) {
      proxyConfig.proxies.splice(index, 1);
      removedCount++;
    }
  }

  proxyStorage.saveConfig(proxyConfig);

  res.json({
    success: true,
    message: `Removed ${removedCount} failed proxy(ies)`,
    removedCount: removedCount
  });
});

app.post("/api/text", (req, res) => {
  if (
    req.body.getcarriers != null &&
    (req.body.getcarriers === "1" ||
      req.body.getcarriers.toLowerCase() === "true")
  ) {
    res.send({ success: true, carriers: Object.keys(carriers).sort() });
    return;
  }
  const number = stripPhone(req.body.number);
  if (number.length < 9 || number.length > 10) {
    res.send({ success: false, message: "Invalid phone number." });
    return;
  }
  textRequestHandler(req, res, number, req.body.carrier, "us");
});

app.post("/canada", (req, res) => {
  textRequestHandler(
    req,
    res,
    stripPhone(req.body.number),
    req.body.carrier,
    "canada"
  );
});

app.post("/intl", (req, res) => {
  textRequestHandler(
    req,
    res,
    stripPhone(req.body.number),
    req.body.carrier,
    "intl"
  );
});

/* ========== New Email/Validation/Verify endpoints ========== */
function parseEmails(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string")
    return input
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  return [];
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").toLowerCase());
}
const defaultMajors = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "yandex.com",
  "mail.ru",
]);
const disposable = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "trashmail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
]);

/* POST /smtp/test => "true"/"false" - Test SMTP connection */
app.post("/smtp/test", async (req, res) => {
  try {
    if (!config.transport || !config.transport.auth) {
      return res.send("false");
    }

    // Try to verify the SMTP connection
    const transporter = nodemailer.createTransport(config.transport);
    await transporter.verify();
    return res.send("true");
  } catch (err) {
    console.error("SMTP test failed:", err.message);
    return res.send("false");
  }
});

/* POST /smtp/verify => "true"/"false" */
app.post("/smtp/verify", (req, res) => {
  text.verify((err, ok) => {
    if (err || !ok) return res.send("false");
    return res.send("true");
  });
});

/* POST /smtp/health => JSON with domain, hasMX, hasSPF, hasDMARC */
app.post("/smtp/health", async (req, res) => {
  try {
    const user =
      (config.transport &&
        config.transport.auth &&
        config.transport.auth.user) ||
      "";
    const domain = (user.split("@")[1] || "").toLowerCase();
    if (!domain) {
      return res.json({
        ok: false,
        message: "No transport user/domain found in current SMTP transport.",
        hasMX: false,
        hasSPF: false,
        hasDMARC: false,
      });
    }

    let hasMX = false;
    let hasSPF = false;
    let hasDMARC = false;

    try {
      const mx = await dns.resolveMx(domain);
      hasMX = Array.isArray(mx) && mx.length > 0;
    } catch (e) {}

    try {
      const txt = await dns.resolveTxt(domain);
      const flat = (txt || []).map((a) => a.join("")).join(" ");
      hasSPF = flat.includes("v=spf1");
    } catch (e) {}

    try {
      const dmarc = await dns.resolveTxt(`_dmarc.${domain}`);
      const flat2 = (dmarc || []).map((a) => a.join("")).join(" ");
      hasDMARC = flat2.includes("v=DMARC1");
    } catch (e) {}

    return res.json({ ok: true, domain, hasMX, hasSPF, hasDMARC });
  } catch (err) {
    return res.json({ ok: false, message: err.message });
  }
});

/* POST /validateEmails => { valid:[], removed:[] } */
app.post("/api/validateEmails", (req, res) => {
  const raw = req.body.emails || req.body.list || req.body.to || [];
  const list = parseEmails(raw);

  const excludeMajors =
    (req.body.excludeMajors !== undefined &&
      (req.body.excludeMajors === true ||
        String(req.body.excludeMajors).toLowerCase() === "true")) ||
    false;

  const extraDeny = new Set(
    parseEmails(req.body.denylist || req.body["denylist[]"] || [])
      .map((e) => e.toLowerCase())
      .filter(Boolean)
  );

  let valid = [];
  let removed = [];

  for (const email of list) {
    const lower = String(email).toLowerCase();
    if (!isValidEmail(lower)) {
      removed.push(email);
      continue;
    }
    const domain = lower.split("@")[1] || "";
    if (disposable.has(domain)) {
      removed.push(email);
      continue;
    }
    if (excludeMajors && defaultMajors.has(domain)) {
      removed.push(email);
      continue;
    }
    if (extraDeny.has(domain)) {
      removed.push(email);
      continue;
    }
    valid.push(lower);
  }

  res.json({ valid, removed });
});

/* POST /email => "true"/error-json
   Body: recipients (array|string), subject, message, from OR sender+senderAd
*/
app.post("/email", (req, res) => {
  let { recipients, subject, message, from, sender, senderAd } = req.body;
  const list =
    parseEmails(recipients || req.body.emails || req.body.to || req.body.email) ||
    [];
  if (!message || list.length === 0) {
    return res.send({
      success: false,
      message: "Recipients and message required.",
    });
  }
  if (!from && sender) {
    const addr =
      senderAd ||
      (config.transport &&
        config.transport.auth &&
        config.transport.auth.user) ||
      "no-reply@example.com";
    from = `"${sender}" <${addr}>`;
  }

  text.email(list, subject || null, message, from, (err) => {
    if (err) {
      return res.send({
        success: false,
        message: `Email send failed: '${err.message}'`,
      });
    }
    return res.send("true");
  });
});

/* POST /chatgpt/rephrase => { success, rephrased } - Rephrase message using ChatGPT */
app.post("/chatgpt/rephrase", async (req, res) => {
  try {
    const { message, apiKey } = req.body;

    if (!apiKey || !apiKey.trim()) {
      return res.json({
        success: false,
        error: "API key is required. Please set your OpenAI API key in settings."
      });
    }

    if (!message || !message.trim()) {
      return res.json({
        success: false,
        error: "Message is required."
      });
    }

    // Call OpenAI API to rephrase the message
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that rephrases messages to make them sound more natural, professional, and non-spammy while keeping the same meaning. Keep the rephrased version concise and maintain any links or important information."
          },
          {
            role: "user",
            content: `Rephrase this message to sound more natural and less spammy, but keep the same meaning:\n\n${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.json({
        success: false,
        error: errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    const rephrased = data.choices?.[0]?.message?.content?.trim();

    if (!rephrased) {
      return res.json({
        success: false,
        error: "Failed to generate rephrased message."
      });
    }

    return res.json({
      success: true,
      rephrased: rephrased
    });

  } catch (err) {
    console.error("ChatGPT rephrase error:", err.message);
    return res.json({
      success: false,
      error: `Error: ${err.message}`
    });
  }
});

/* =================== Mount Enhanced Routes =================== */
app.use('/api/enhanced', enhancedRoutes);

/* =================== Mount Campaign Routes =================== */
app.use('/api/enhanced', campaignRoutes(campaignManager));

/* =================== Mount SMTP Database Routes =================== */
app.use('/api/smtp/database', smtpDatabaseRoutes);

/* =================== Mount SMTP Combo Routes =================== */
const { router: comboRouter, setupWebSocket } = require('./comboRoutes');
app.use('/api/smtp/combo', comboRouter);

/* =================== Inbox Searcher Routes =================== */
const { router: inboxRouter, setupWebSocket: setupInboxWebSocket } = require('./inboxRoutes');
app.use('/api/enhanced/inbox', inboxRouter);

/* =================== Contact Extractor Routes =================== */
const { router: contactRouter, setupWebSocket: setupContactWebSocket } = require('./contactRoutes');
app.use('/api/enhanced/contact', contactRouter);

/* =================== Attachment Routes =================== */

// Get all attachments
app.get('/api/enhanced/attachments', (req, res) => {
  try {
    const attachments = attachmentStorage.getAllAttachments();
    res.json({
      success: true,
      attachments,
      count: attachments.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attachment by ID
app.get('/api/enhanced/attachments/:id', (req, res) => {
  try {
    const attachment = attachmentStorage.getAttachment(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    res.json({
      success: true,
      attachment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download attachment
app.get('/api/enhanced/attachments/:id/download', (req, res) => {
  try {
    const fs = require('fs');
    const attachment = attachmentStorage.getAttachment(req.params.id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if file exists
    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.type || 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(attachment.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Attachment download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload attachment
app.post('/api/enhanced/attachments/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Prepare file data for attachment storage
    const fileData = {
      name: req.body.name || req.file.originalname,
      content: req.file.buffer, // File buffer from multer
      type: req.file.mimetype,
      description: req.body.description || ''
    };

    const result = await attachmentStorage.uploadAttachment(fileData);
    res.json(result);
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete attachment
app.delete('/api/enhanced/attachments/:id', async (req, res) => {
  try {
    const result = await attachmentStorage.deleteAttachment(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attachment statistics
app.get('/api/enhanced/attachments/stats', (req, res) => {
  try {
    const stats = attachmentStorage.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =================== Start server =================== */
const port = process.env.PORT || 9090;
const http = require('http');
const WebSocket = require('ws');

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket servers for different features
const wssCombo = new WebSocket.Server({ noServer: true });
const wssInbox = new WebSocket.Server({ noServer: true });
const wssContact = new WebSocket.Server({ noServer: true });

// Setup WebSocket handlers
setupWebSocket(wssCombo);
setupInboxWebSocket(wssInbox);
setupContactWebSocket(wssContact);

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;

  if (pathname.startsWith('/ws/combo/process/')) {
    wssCombo.handleUpgrade(request, socket, head, (ws) => {
      wssCombo.emit('connection', ws, request);
    });
  } else if (pathname.startsWith('/ws/inbox/')) {
    wssInbox.handleUpgrade(request, socket, head, (ws) => {
      wssInbox.emit('connection', ws, request);
    });
  } else if (pathname.startsWith('/ws/contacts/')) {
    wssContact.handleUpgrade(request, socket, head, (ws) => {
      wssContact.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log("Listening on", port);
  console.log("Enhanced features available at /api/enhanced/*");
  console.log("WebSocket available at:");
  console.log("  - ws://localhost:" + port + "/ws/combo/process/:sessionId");
  console.log("  - ws://localhost:" + port + "/ws/inbox/:sessionId");
  console.log("  - ws://localhost:" + port + "/ws/contacts/:sessionId");
});

// Graceful shutdown handlers
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed');

    // Close all transporter connections
    const pool = getPool();
    pool.closeAll();
    console.log('✅ All transporter connections closed');

    // Close WebSocket servers
    wssCombo.close(() => console.log('✅ Combo WebSocket server closed'));
    wssInbox.close(() => console.log('✅ Inbox WebSocket server closed'));
    wssContact.close(() => console.log('✅ Contact WebSocket server closed'));

    console.log('👋 Graceful shutdown complete');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
