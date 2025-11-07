const securityConfig = require('./securityConfig');

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const parts = String(authorizationHeader).trim().split(/\s+/);
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

function createApiKeyGuard() {
  return (req, res, next) => {
    const headerName = securityConfig.getApiKeyHeader().toLowerCase();
    if (!securityConfig.isApiKeyConfigured()) {
      return next();
    }

    if (req.method === 'OPTIONS') {
      return next();
    }

    const candidate =
      (req.headers[headerName] && String(req.headers[headerName]).trim()) ||
      extractBearerToken(req.headers.authorization);

    if (!candidate || !securityConfig.verifyApiKey(candidate)) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    return next();
  };
}

function createRateLimiter() {
  const buckets = new Map();

  return (req, res, next) => {
    const rateSettings = securityConfig.getRateLimitSettings();

    if (!rateSettings.enabled) {
      buckets.clear();
      return next();
    }

    if (req.method === 'OPTIONS') {
      return next();
    }

    const windowMs = parseInt(rateSettings.windowMs, 10) || 15 * 60 * 1000;
    const maxRequests = parseInt(rateSettings.max, 10) || 1000;
    const now = Date.now();
    const key = req.ip || req.connection?.remoteAddress || 'unknown';

    const bucket = buckets.get(key) || { count: 0, expiresAt: now + windowMs };

    if (now > bucket.expiresAt) {
      bucket.count = 0;
      bucket.expiresAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down.',
        retryAfter: Math.ceil((bucket.expiresAt - now) / 1000)
      });
    }

    return next();
  };
}

module.exports = {
  apiKeyGuard: createApiKeyGuard(),
  rateLimiter: createRateLimiter()
};
