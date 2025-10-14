const express = require("express");
const dns = require("dns").promises;

const carriers = require("../lib/carriers.js");
const providers = require("../lib/providers.js");
const text = require("../lib/text");
let config = require("../lib/config.js");

// Import enhanced routes
const { router: enhancedRoutes } = require("./enhancedRoutes");

const app = express();

// Express config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // CORS configuration - restrict origin in production
  // For development, use "*" or configure specific origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:8080'];

  const origin = req.headers.origin;

  // Allow all for development, but log a warning
  if (process.env.NODE_ENV !== 'production') {
    res.header("Access-Control-Allow-Origin", origin || "*");
  } else if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

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

app.get("/providers/:region", (req, res) => {
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
app.post("/config", (req, res) => {
  text.output("received new stmp config");
  smtpconfig(req, res);
});

app.post("/proxy", (req, res) => {
  proxy(req, res);
});

app.post("/text", (req, res) => {
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
app.post("/validateEmails", (req, res) => {
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

/* =================== Mount Enhanced Routes =================== */
app.use('/api/enhanced', enhancedRoutes);

/* =================== Start server =================== */
const port = process.env.PORT || 9090;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log("Listening on", port);
  console.log("Enhanced features available at /api/enhanced/*");
});
