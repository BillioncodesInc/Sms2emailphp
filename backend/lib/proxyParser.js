/**
 * Universal Proxy Parser
 * Supports multiple proxy string formats:
 * 1. user:pass@host:port  (standard format with authentication)
 * 2. host:port:user:pass  (alternative format)
 * 3. host:port            (no authentication)
 */

/**
 * Parse proxy string into structured object
 * @param {string} proxyString - Proxy in various formats
 * @returns {Object|null} - Parsed proxy object or null if invalid
 */
function parseProxyString(proxyString) {
  if (!proxyString || typeof proxyString !== 'string') {
    return null;
  }

  const trimmed = proxyString.trim();
  if (!trimmed) {
    return null;
  }

  try {
    // Format 1: user:pass@host:port
    if (trimmed.includes('@')) {
      // Split by last @ to handle special characters in password
      const lastAtIndex = trimmed.lastIndexOf('@');
      const auth = trimmed.substring(0, lastAtIndex);
      const hostPort = trimmed.substring(lastAtIndex + 1);

      const colonIndex = auth.indexOf(':');
      if (colonIndex === -1) {
        console.warn(`Invalid proxy format (missing password separator): ${proxyString}`);
        return null;
      }

      const username = auth.substring(0, colonIndex);
      const password = auth.substring(colonIndex + 1);
      const [host, port] = hostPort.split(':');

      if (!host || !port) {
        console.warn(`Invalid proxy format (user:pass@host:port): ${proxyString}`);
        return null;
      }

      return {
        host: host.trim(),
        port: port.trim(),
        username: username?.trim() || undefined,
        password: password?.trim() || undefined
      };
    }

    // Split by colon to determine format
    const parts = trimmed.split(':');

    // Format 2: host:port:user:pass (4 parts)
    if (parts.length === 4) {
      const [host, port, username, password] = parts;

      if (!host || !port) {
        console.warn(`Invalid proxy format (host:port:user:pass): ${proxyString}`);
        return null;
      }

      return {
        host: host.trim(),
        port: port.trim(),
        username: username?.trim() || undefined,
        password: password?.trim() || undefined
      };
    }

    // Format 3: host:port (2 parts, no auth)
    if (parts.length === 2) {
      const [host, port] = parts;

      if (!host || !port) {
        console.warn(`Invalid proxy format (host:port): ${proxyString}`);
        return null;
      }

      return {
        host: host.trim(),
        port: port.trim()
      };
    }

    // Invalid format
    console.warn(`Unsupported proxy format: ${proxyString}`);
    console.warn(`Supported formats: user:pass@host:port, host:port:user:pass, host:port`);
    return null;

  } catch (error) {
    console.error(`Error parsing proxy string "${proxyString}":`, error.message);
    return null;
  }
}

/**
 * Parse array of proxy strings
 * @param {string[]} proxyArray - Array of proxy strings
 * @returns {Object[]} - Array of parsed proxy objects (skips invalid entries)
 */
function parseProxyArray(proxyArray) {
  if (!Array.isArray(proxyArray)) {
    console.warn('parseProxyArray expects an array');
    return [];
  }

  const parsed = [];
  for (let i = 0; i < proxyArray.length; i++) {
    const proxy = parseProxyString(proxyArray[i]);
    if (proxy) {
      parsed.push(proxy);
    } else {
      console.warn(`Skipping invalid proxy at index ${i}: ${proxyArray[i]}`);
    }
  }

  return parsed;
}

/**
 * Convert proxy object to URL string
 * @param {Object} proxy - Proxy object
 * @param {string} proxy.host - Proxy host
 * @param {string} proxy.port - Proxy port
 * @param {string} [proxy.username] - Optional username
 * @param {string} [proxy.password] - Optional password
 * @param {string} [protocol='socks5'] - Proxy protocol (socks5, socks4, http)
 * @returns {string} - Proxy URL
 */
function proxyToUrl(proxy, protocol = 'socks5') {
  if (!proxy || !proxy.host || !proxy.port) {
    throw new Error('Invalid proxy object: must have host and port');
  }

  const scheme = protocol === 'http' ? 'http' : protocol;
  const auth = (proxy.username && proxy.password)
    ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`
    : '';

  return `${scheme}://${auth}${proxy.host}:${proxy.port}`;
}

/**
 * Convert proxy object to string for display/logging
 * @param {Object} proxy - Proxy object
 * @returns {string} - Human-readable proxy string
 */
function proxyToString(proxy) {
  if (!proxy || !proxy.host || !proxy.port) {
    return 'Invalid proxy';
  }

  if (proxy.username && proxy.password) {
    return `${proxy.username}:***@${proxy.host}:${proxy.port}`;
  }

  return `${proxy.host}:${proxy.port}`;
}

/**
 * Validate proxy object structure
 * @param {Object} proxy - Proxy object to validate
 * @returns {boolean} - True if valid
 */
function isValidProxy(proxy) {
  if (!proxy || typeof proxy !== 'object') {
    return false;
  }

  // Must have host and port
  if (!proxy.host || !proxy.port) {
    return false;
  }

  // Port must be a valid number
  const port = parseInt(proxy.port);
  if (isNaN(port) || port < 1 || port > 65535) {
    return false;
  }

  // If username is provided, password should also be provided (and vice versa)
  if (proxy.username && !proxy.password) {
    console.warn('Proxy has username but no password');
    return false;
  }

  if (proxy.password && !proxy.username) {
    console.warn('Proxy has password but no username');
    return false;
  }

  return true;
}

module.exports = {
  parseProxyString,
  parseProxyArray,
  proxyToUrl,
  proxyToString,
  isValidProxy
};
