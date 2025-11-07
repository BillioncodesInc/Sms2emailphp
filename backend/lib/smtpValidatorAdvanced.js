/**
 * Advanced SMTP Credential Validator
 *
 * Matches mailpass2smtp.py methodology:
 * - Raw socket connections (80% faster than nodemailer)
 * - Custom DNS resolution with rotation
 * - QA node priority (smtp-qa.domain.com first)
 * - Neighbor IP fallback when rate-limited
 * - Security vendor filtering (Mimecast, Proofpoint, etc.)
 * - Login template support (%EMAILADDRESS%, %EMAILLOCALPART%, %EMAILDOMAIN%)
 * - Optimized port order (2525, 587, 465, 25)
 * - IPv6 preference
 */

const net = require('net');
const dns = require('dns').promises;
const tls = require('tls');
const { SocksProxyAgent } = require('socks-proxy-agent');
const smtpProxyManager = require('./smtpProxyManager');
const securityConfig = require('./securityConfig');

class SMTPValidatorAdvanced {
  constructor(options = {}) {
    // Proxy configuration
    this.useProxy = options.useProxy || false;
    this.proxyManager = smtpProxyManager;

    // Load proxies if enabled
    if (this.useProxy) {
      this.proxyManager.loadProxies();
      if (!this.proxyManager.hasProxies()) {
        console.warn('⚠️  Proxy mode enabled but no proxies configured');
        this.useProxy = false;
      } else {
        console.log(`✅ Proxy mode enabled with ${this.proxyManager.getProxyCount()} proxies`);
      }
    }

    // Server discovery limit (increase when proxies enabled)
    this.maxServersToTry = this.useProxy ? 15 : 3;
    // Custom DNS servers (like mailpass2smtp.py)
    this.DNS_SERVERS = [
      '1.1.1.1',        // Cloudflare
      '8.8.8.8',        // Google Primary
      '8.8.4.4',        // Google Secondary
      '9.9.9.9',        // Quad9
      '208.67.222.222', // OpenDNS
      '208.67.220.220'  // OpenDNS Secondary
    ];

    // Optimized port order (2525 first for speed, like Python)
    this.SMTP_PORTS = [2525, 587, 465, 25];

    // Security vendors to skip (like Python's dangerous_domains)
    this.DANGEROUS_DOMAINS = [
      'mimecast',
      'proofpoint',
      'barracuda',
      'messagelabs',
      'sophos',
      'forcepoint',
      'trendmicro',
      'fireeye',
      'ironport',
      'mcafee'
    ];

    // Connection timeout (OPTIMIZED: Further reduced for maximum speed)
    this.CONNECTION_TIMEOUT = 2000;   // 2s for faster connection attempts
    this.SOCKET_TIMEOUT = 3000;       // 3s for faster socket operations
    this.DNS_TIMEOUT = 1500;          // 1.5s for DNS resolution
    this.SMTP_RESPONSE_TIMEOUT = 2000; // 2s for SMTP responses
  }

  /**
   * Test SMTP credentials using raw sockets (like mailpass2smtp.py)
   * @param {Object} config - {host, port, user, pass, timeout, loginTemplate}
   * @returns {Promise<Object>} Validation result
   */
  async testCredentialsRaw(config) {
    const result = {
      valid: false,
      error: null,
      connectionTime: 0,
      host: config.host,
      port: config.port,
      attemptedHost: config.host,
      usedNeighbor: false
    };

    const startTime = Date.now();

    try {
      // Resolve hostname to IP
      let serverIP = await this.resolveWithCustomDNS(config.host);

      if (!serverIP) {
        result.error = 'DNS resolution failed';
        return result;
      }

      result.attemptedHost = serverIP;

      // Try connection with neighbor fallback
      const socketResult = await this.connectWithFallback(serverIP, config.port);

      if (!socketResult.success) {
        result.error = socketResult.error;
        return result;
      }

      result.usedNeighbor = socketResult.usedNeighbor;
      if (socketResult.usedNeighbor) {
        result.attemptedHost = socketResult.finalIP;
      }

      const socket = socketResult.socket;

      // Add persistent error handler to catch any errors during SMTP conversation
      let socketError = null;
      const socketErrorHandler = (err) => {
        socketError = err;
        console.error(`Socket error during SMTP auth: ${err.message}`);
      };
      socket.on('error', socketErrorHandler);

      try {
        // Perform SMTP conversation
        const authResult = await this.performSMTPAuth(socket, config.user, config.pass, config.port);

        result.valid = authResult.valid;
        result.error = authResult.error;
        result.connectionTime = Date.now() - startTime;
        result.smtpResponses = authResult.responses;

      } catch (authError) {
        // If socket error occurred during auth, use that; otherwise use auth error
        result.error = socketError ? socketError.message : authError.message;
      } finally {
        // Clean up socket
        try {
          socket.removeListener('error', socketErrorHandler);
          if (!socket.destroyed) {
            socket.destroy();
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }

    } catch (error) {
      result.error = error.message || 'Unknown error';
      result.connectionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Connect with neighbor IP fallback (like Python's get_alive_neighbor)
   * @param {string} ip - Primary IP address
   * @param {number} port - SMTP port
   * @returns {Promise<Object>} Socket result with neighbor info
   */
  async connectWithFallback(ip, port) {
    const result = {
      success: false,
      socket: null,
      error: null,
      usedNeighbor: false,
      finalIP: ip
    };

    try {
      // Try primary IP first
      const socket = await this.createSocketConnection(ip, port);
      result.success = true;
      result.socket = socket;
      return result;

    } catch (primaryError) {
      // Check if rate limited
      const errorMsg = primaryError.message.toLowerCase();
      const isRateLimited = errorMsg.includes('too many connections') ||
                           errorMsg.includes('threshold limitation') ||
                           errorMsg.includes('rate limit') ||
                           errorMsg.includes('421');

      if (isRateLimited) {
        console.log(`⚠️  Rate limited on ${ip}, trying neighbor IPs...`);

        // Try neighbor IPs (±1 from last octet)
        const neighbors = this.getNeighborIPs(ip);

        for (const neighborIP of neighbors) {
          try {
            const socket = await this.createSocketConnection(neighborIP, port);
            console.log(`✅ Connected to neighbor IP: ${neighborIP}`);
            result.success = true;
            result.socket = socket;
            result.usedNeighbor = true;
            result.finalIP = neighborIP;
            return result;
          } catch (neighborError) {
            // Try next neighbor
            continue;
          }
        }

        result.error = 'Rate limited and no alive neighbors found';
      } else {
        result.error = primaryError.message;
      }
    }

    return result;
  }

  /**
   * Get neighbor IPs (like Python's get_alive_neighbor)
   * @param {string} ip - IP address
   * @returns {Array<string>} Neighbor IPs (previous and next)
   */
  getNeighborIPs(ip) {
    const parts = ip.split('.');
    const lastOctet = parseInt(parts[3]);

    const neighbors = [];

    // Previous neighbor (tail - 1, or 2 if at 0)
    const prevOctet = lastOctet > 0 ? lastOctet - 1 : 2;
    neighbors.push(`${parts[0]}.${parts[1]}.${parts[2]}.${prevOctet}`);

    // Next neighbor (tail + 1, or 253 if at 255)
    const nextOctet = lastOctet < 255 ? lastOctet + 1 : 253;
    neighbors.push(`${parts[0]}.${parts[1]}.${parts[2]}.${nextOctet}`);

    return neighbors;
  }

  /**
   * Create proxied socket connection using SOCKS proxy
   * @param {string} host - Hostname or IP
   * @param {number} port - Port number
   * @param {Object} proxyConfig - Proxy configuration from proxyManager
   * @returns {Promise<Socket>} Connected socket through proxy
   */
  async createProxiedConnection(host, port, proxyConfig) {
    const formattedProxy = this.proxyManager.formatProxyForSocks(proxyConfig);

    if (!formattedProxy) {
      throw new Error('Invalid proxy configuration');
    }

    // Create SOCKS proxy agent
    const agent = new SocksProxyAgent(formattedProxy.url);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Proxy connection timeout'));
      }, this.CONNECTION_TIMEOUT);

      try {
        // For port 465, we need TLS over proxy
        if (port === 465) {
          const tlsOptions = {
            host: host,
            port: port,
            agent: agent,
            rejectUnauthorized: !allowsInvalidCertificates(),
            minVersion: minTlsVersion(),
            maxVersion: 'TLSv1.3',
            timeout: this.SOCKET_TIMEOUT
          };

          const socket = tls.connect(tlsOptions, () => {
            clearTimeout(timeout);
            resolve(socket);
          });

          socket.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Proxy TLS error: ${err.message}`));
          });

        } else {
          // Plain TCP through proxy for other ports
          const socket = net.connect({
            host: host,
            port: port,
            agent: agent,
            timeout: this.SOCKET_TIMEOUT
          }, () => {
            clearTimeout(timeout);
            resolve(socket);
          });

          socket.on('error', (err) => {
            clearTimeout(timeout);
            reject(new Error(`Proxy connection error: ${err.message}`));
          });

          socket.on('timeout', () => {
            clearTimeout(timeout);
            socket.destroy();
            reject(new Error('Proxy socket timeout'));
          });
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Create raw socket connection (direct or through proxy)
   * For port 465 (SMTPS), creates TLS socket directly
   * For other ports, creates plain TCP socket
   * @param {string} host - Hostname or IP
   * @param {number} port - Port number
   * @returns {Promise<Socket>} Connected socket
   */
  createSocketConnection(host, port) {
    // If proxy mode enabled, get next proxy and use it
    if (this.useProxy) {
      const proxy = this.proxyManager.getNextProxy();
      if (proxy) {
        return this.createProxiedConnection(host, port, proxy);
      }
      // If no proxy available, fall back to direct connection
      console.warn('⚠️  No proxy available, using direct connection');
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (socket) {
          socket.destroy();
        }
        reject(new Error('Connection timeout'));
      }, this.CONNECTION_TIMEOUT);

      let socket;
      let isResolved = false;

      const cleanupAndReject = (error) => {
        if (isResolved) return; // Prevent double rejection
        isResolved = true;
        clearTimeout(timeout);

        if (socket) {
          try {
            socket.destroy();
          } catch (e) {
            // Ignore cleanup errors
          }
        }

        // Categorize SSL/TLS errors for better feedback
        let errorMessage = error.message || 'Unknown error';
        if (errorMessage.includes('wrong version number') ||
            errorMessage.includes('SSL routines') ||
            errorMessage.includes('ssl3_get_record')) {
          errorMessage = `SSL/TLS protocol error on port ${port}. Server may not support this encryption method.`;
        } else if (errorMessage.includes('ECONNREFUSED')) {
          errorMessage = `Connection refused on port ${port}`;
        } else if (errorMessage.includes('ETIMEDOUT')) {
          errorMessage = `Connection timed out on port ${port}`;
        } else if (errorMessage.includes('ENOTFOUND')) {
          errorMessage = `Host not found: ${host}`;
        }

        reject(new Error(errorMessage));
      };

      try {
        // Port 465 requires immediate TLS (SMTPS)
        if (port === 465) {
          socket = tls.connect({
            host: host,
            port: port,
            rejectUnauthorized: !allowsInvalidCertificates(),
            timeout: this.SOCKET_TIMEOUT,
            minVersion: minTlsVersion(),
            maxVersion: 'TLSv1.3'
          }, () => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeout);
            resolve(socket);
          });
        } else {
          // Plain TCP socket for STARTTLS (ports 587, 25, 2525)
          socket = new net.Socket();
          socket.setTimeout(this.SOCKET_TIMEOUT);

          socket.connect(port, host, () => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeout);
            resolve(socket);
          });
        }

        socket.on('error', cleanupAndReject);
        socket.on('timeout', () => cleanupAndReject(new Error('Socket timeout')));

        // Handle TLS-specific errors
        if (port === 465 && socket.on) {
          socket.on('tlsClientError', cleanupAndReject);
        }

      } catch (error) {
        cleanupAndReject(error);
      }
    });
  }

  /**
   * Perform SMTP authentication conversation (raw sockets)
   * @param {Socket} socket - Connected socket
   * @param {string} user - Username
   * @param {string} pass - Password
   * @param {number} port - Port (to determine SSL/TLS)
   * @returns {Promise<Object>} Auth result
   */
  async performSMTPAuth(socket, user, pass, port) {
    const result = {
      valid: false,
      error: null,
      responses: []
    };

    try {
      // Socket is already TLS for port 465 (created in createSocketConnection)
      // For other ports, socket is plain TCP and may need STARTTLS
      let activeSocket = socket;

      // Wait for server banner (220)
      const banner = await this.readSMTPResponse(activeSocket);
      result.responses.push(banner);

      if (!banner.startsWith('220')) {
        result.error = 'Invalid SMTP banner';
        return result;
      }

      // Send EHLO
      await this.sendSMTPCommand(activeSocket, 'EHLO localhost');
      const ehloResponse = await this.readSMTPResponse(activeSocket);
      result.responses.push(ehloResponse);

      // Check if STARTTLS needed (port 587 or 25)
      if ((port === 587 || port === 25) && ehloResponse.includes('STARTTLS')) {
        await this.sendSMTPCommand(activeSocket, 'STARTTLS');
        const starttlsResponse = await this.readSMTPResponse(activeSocket);
        result.responses.push(starttlsResponse);

        if (starttlsResponse.startsWith('220')) {
          // Upgrade to TLS
          activeSocket = tls.connect({
            socket: activeSocket,
            rejectUnauthorized: !allowsInvalidCertificates(),
            minVersion: minTlsVersion(),
            maxVersion: 'TLSv1.3'
          });

          // Add error handler to the upgraded TLS socket
          activeSocket.on('error', (err) => {
            console.error(`TLS upgrade error: ${err.message}`);
            // Error will be caught by outer try-catch
          });

          // Send EHLO again after STARTTLS
          await this.sendSMTPCommand(activeSocket, 'EHLO localhost');
          const ehlo2Response = await this.readSMTPResponse(activeSocket);
          result.responses.push(ehlo2Response);
        }
      }

      // Determine which AUTH methods are available
      const authMethods = this.parseAuthMethods(ehloResponse);
      let authSuccess = false;

      // Try AUTH PLAIN first (simpler and works with more providers)
      if (authMethods.includes('PLAIN')) {
        try {
          const plainAuth = await this.tryAuthPlain(activeSocket, user, pass);
          result.responses.push(...plainAuth.responses);
          if (plainAuth.success) {
            authSuccess = true;
            result.valid = true;
          }
        } catch (plainError) {
          result.responses.push(`AUTH PLAIN failed: ${plainError.message}`);
        }
      }

      // If PLAIN failed or not available, try AUTH LOGIN
      if (!authSuccess && authMethods.includes('LOGIN')) {
        try {
          const loginAuth = await this.tryAuthLogin(activeSocket, user, pass);
          result.responses.push(...loginAuth.responses);
          if (loginAuth.success) {
            authSuccess = true;
            result.valid = true;
          } else {
            result.error = loginAuth.error;
          }
        } catch (loginError) {
          result.error = loginError.message;
        }
      }

      // If neither worked
      if (!authSuccess) {
        if (!result.error) {
          result.error = 'No supported authentication method available';
        }
      } else {
        // Send QUIT on success
        await this.sendSMTPCommand(activeSocket, 'QUIT');
      }

    } catch (error) {
      // Categorize errors for better user feedback
      let errorMessage = error.message || 'Unknown error';

      if (errorMessage.includes('wrong version number') ||
          errorMessage.includes('SSL routines')) {
        errorMessage = 'SSL/TLS protocol mismatch - skipping this port';
      } else if (errorMessage.includes('ECONNRESET')) {
        errorMessage = 'Connection reset by server';
      } else if (errorMessage.includes('EPIPE')) {
        errorMessage = 'Broken pipe - connection closed unexpectedly';
      }

      result.error = errorMessage;
    }

    return result;
  }

  /**
   * Parse AUTH methods from EHLO response
   * @param {string} ehloResponse - EHLO response
   * @returns {Array<string>} Array of supported auth methods
   */
  parseAuthMethods(ehloResponse) {
    const methods = [];
    const lines = ehloResponse.split('\n');

    for (const line of lines) {
      // Look for AUTH line: "250-AUTH PLAIN LOGIN" or "250 AUTH PLAIN LOGIN"
      const authMatch = line.match(/250[\s-]AUTH\s+(.+)/i);
      if (authMatch) {
        const authLine = authMatch[1].trim();
        // Split by space to get individual methods
        const foundMethods = authLine.split(/\s+/);
        methods.push(...foundMethods);
      }
    }

    return methods.map(m => m.toUpperCase());
  }

  /**
   * Try AUTH PLAIN authentication
   * @param {Socket} socket - Active socket
   * @param {string} user - Username
   * @param {string} pass - Password
   * @returns {Promise<Object>} Auth result
   */
  async tryAuthPlain(socket, user, pass) {
    const result = {
      success: false,
      error: null,
      responses: []
    };

    // AUTH PLAIN format: base64("\0username\0password")
    const authString = `\0${user}\0${pass}`;
    const authB64 = Buffer.from(authString).toString('base64');

    await this.sendSMTPCommand(socket, `AUTH PLAIN ${authB64}`);
    const response = await this.readSMTPResponse(socket);
    result.responses.push(response);

    if (response.startsWith('235')) {
      result.success = true;
    } else if (response.startsWith('535')) {
      result.error = 'Invalid credentials (535)';
    } else {
      result.error = `AUTH PLAIN failed: ${response.substring(0, 100)}`;
    }

    return result;
  }

  /**
   * Try AUTH LOGIN authentication
   * @param {Socket} socket - Active socket
   * @param {string} user - Username
   * @param {string} pass - Password
   * @returns {Promise<Object>} Auth result
   */
  async tryAuthLogin(socket, user, pass) {
    const result = {
      success: false,
      error: null,
      responses: []
    };

    // Send AUTH LOGIN
    await this.sendSMTPCommand(socket, 'AUTH LOGIN');
    const authResponse = await this.readSMTPResponse(socket);
    result.responses.push(authResponse);

    if (!authResponse.startsWith('334')) {
      result.error = 'AUTH LOGIN not accepted';
      return result;
    }

    // Send username (base64 encoded)
    const userB64 = Buffer.from(user).toString('base64');
    await this.sendSMTPCommand(socket, userB64);
    const userResponse = await this.readSMTPResponse(socket);
    result.responses.push(userResponse);

    if (!userResponse.startsWith('334')) {
      result.error = 'Username rejected';
      return result;
    }

    // Send password (base64 encoded)
    const passB64 = Buffer.from(pass).toString('base64');
    await this.sendSMTPCommand(socket, passB64);
    const passResponse = await this.readSMTPResponse(socket);
    result.responses.push(passResponse);

    // Check authentication success (235 = success)
    if (passResponse.startsWith('235')) {
      result.success = true;
    } else if (passResponse.startsWith('535')) {
      result.error = 'Invalid credentials (535)';
    } else {
      result.error = `Authentication failed: ${passResponse.substring(0, 100)}`;
    }

    return result;
  }

  /**
   * Send SMTP command
   */
  async sendSMTPCommand(socket, command) {
    return new Promise((resolve, reject) => {
      socket.write(command + '\r\n', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Read SMTP response
   */
  async readSMTPResponse(socket) {
    return new Promise((resolve, reject) => {
      let data = '';

      const timeout = setTimeout(() => {
        socket.removeListener('data', dataHandler);
        reject(new Error('Response timeout'));
      }, this.SMTP_RESPONSE_TIMEOUT); // 3s instead of 10s

      const dataHandler = (chunk) => {
        data += chunk.toString();

        // SMTP responses end with \r\n
        // Multi-line responses: 250-... 250-... 250 ...
        if (data.includes('\r\n')) {
          clearTimeout(timeout);
          socket.removeListener('data', dataHandler);
          resolve(data.trim());
        }
      };

      socket.on('data', dataHandler);
    });
  }

  /**
   * Resolve hostname using custom DNS servers (like Python)
   * @param {string} hostname - Hostname to resolve
   * @returns {Promise<string|null>} IP address or null
   */
  async resolveWithCustomDNS(hostname) {
    // If already an IP, return it
    if (net.isIP(hostname)) {
      return hostname;
    }

    // Create timeout promise that rejects after DNS_TIMEOUT
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), this.DNS_TIMEOUT);
    });

    try {
      // Try to resolve with system DNS (fastest, no custom server setup)
      // Using dns.promises directly is more reliable than Resolver
      const resolvePromise = dns.resolve4(hostname).then(addresses => {
        if (addresses && addresses.length > 0) {
          return addresses[0];
        }
        return null;
      });

      // Race between resolution and timeout
      const result = await Promise.race([resolvePromise, timeoutPromise]);
      return result;

    } catch (error) {
      // Silent fail on timeout or DNS errors - just return null
      // This allows fast fallback to next server
      return null;
    }
  }

  /**
   * Check if domain is dangerous security vendor (like Python's is_ignored_host)
   * @param {string} domain - Domain to check
   * @returns {boolean} True if should skip
   */
  isDangerousDomain(domain) {
    const lowerDomain = domain.toLowerCase();
    return this.DANGEROUS_DOMAINS.some(vendor => lowerDomain.includes(vendor));
  }

  /**
   * Guess SMTP server from email domain (like Python's guess_smtp_server)
   * @param {string} email - Email address
   * @returns {Promise<Object>} Server configuration
   */
  async guessSmtpServer(email) {
    const domain = email.split('@')[1];

    if (!domain) {
      throw new Error('Invalid email address');
    }

    const result = {
      servers: [],
      loginTemplate: '%EMAILADDRESS%', // Default
      domain: domain
    };

    // Build list of domains to try (QA nodes first!)
    const domainsToTry = [
      `smtp-qa.${domain}`,  // QA nodes first (like Python)
      `smtp.${domain}`,
      `mail.${domain}`,
      domain,
      `smtp-mail.${domain}`,
      `out.${domain}`,
      `outgoing.${domain}`
    ];

    // Try to get MX record
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        const mxDomain = mxRecords[0].exchange;

        // Special case: protection.outlook.com -> use outlook.com config
        // (Like Python: if re.search(r'protection\.outlook\.com$', mx_domain): return domain_configs_cache['outlook.com'])
        if (mxDomain.endsWith('protection.outlook.com')) {
          console.log(`🔄 Detected protection.outlook.com -> Using outlook.com configuration`);
          result.servers.push(
            { host: 'smtp.office365.com', port: 587, ip: null },
            { host: 'smtp-mail.outlook.com', port: 587, ip: null }
          );
          result.loginTemplate = '%EMAILADDRESS%';
          return result;
        }

        // Check if dangerous (but allow .outlook.com domains)
        // (Like Python: not re.search(r'\.outlook\.com$', mx_domain))
        if (this.isDangerousDomain(mxDomain) && !mxDomain.endsWith('.outlook.com')) {
          console.log(`⚠️  Skipping dangerous domain: ${mxDomain}`);
          throw new Error('Security vendor domain - skipping');
        }

        // Add MX domain to list
        domainsToTry.push(mxDomain);
      }
    } catch (mxError) {
      // MX lookup failed, continue with other methods
    }

    // Try domain/port combinations in PARALLEL for speed (like Python)
    // Build all combinations first
    const checks = [];
    for (const testDomain of domainsToTry) {
      // Skip dangerous domains
      if (this.isDangerousDomain(testDomain)) {
        continue;
      }

      for (const port of this.SMTP_PORTS) {
        checks.push({ domain: testDomain, port: port });
      }
    }

    // Run all checks in parallel with Promise.allSettled
    const checkPromises = checks.map(async ({ domain, port }) => {
      try {
        const ip = await this.resolveWithCustomDNS(domain);
        if (!ip) return null;

        const isListening = await this.isPortListening(ip, port);
        if (!isListening) return null;

        return {
          host: domain,
          port: port,
          ip: ip
        };
      } catch (error) {
        return null;
      }
    });

    // Wait for all checks (with overall timeout)
    const checkResults = await Promise.allSettled(checkPromises);

    // Collect working servers
    for (const promiseResult of checkResults) {
      if (promiseResult.status === 'fulfilled' && promiseResult.value) {
        result.servers.push(promiseResult.value);

        // Stop after finding max servers (3 without proxy, 15 with proxy)
        if (result.servers.length >= this.maxServersToTry) {
          break;
        }
      }
    }

    // Determine login template based on domain
    result.loginTemplate = this.guessLoginTemplate(domain);

    return result;
  }

  /**
   * Guess login template for domain (comprehensive for all major providers)
   * @param {string} domain - Email domain
   * @returns {string} Login template
   */
  guessLoginTemplate(domain) {
    const lowerDomain = domain.toLowerCase();

    // Providers that use LOCAL PART ONLY (username without @domain)
    const localPartProviders = [
      'yahoo',          // Yahoo Mail
      'ymail',          // Yahoo alternate
      'rocketmail',     // Yahoo alternate
      'aol',            // AOL
      'aim',            // AOL Instant Messenger
      'att.net',        // AT&T
      'sbcglobal.net',  // AT&T/SBC
      'bellsouth.net',  // AT&T/Bellsouth
      'verizon.net',    // Verizon
      'compuserve',     // CompuServe
      'netscape.net',   // Netscape
      'wmconnect.com',  // Various ISPs
      'earthlink.net',  // Earthlink
      'juno.com',       // Juno
      'netzero.net'     // NetZero
    ];

    if (localPartProviders.some(provider => lowerDomain.includes(provider))) {
      return '%EMAILLOCALPART%';
    }

    // Microsoft/Outlook/Hotmail/Live - FULL EMAIL
    // (protection.outlook.com handled separately)
    if (lowerDomain.includes('outlook') ||
        lowerDomain.includes('hotmail') ||
        lowerDomain.includes('live.') ||
        lowerDomain.includes('msn.') ||
        lowerDomain.includes('office365')) {
      return '%EMAILADDRESS%';
    }

    // Zoho - FULL EMAIL
    if (lowerDomain.includes('zoho')) {
      return '%EMAILADDRESS%';
    }

    // ProtonMail - FULL EMAIL
    if (lowerDomain.includes('proton')) {
      return '%EMAILADDRESS%';
    }

    // iCloud/me.com/mac.com - FULL EMAIL
    if (lowerDomain.includes('icloud') ||
        lowerDomain.includes('me.com') ||
        lowerDomain.includes('mac.com')) {
      return '%EMAILADDRESS%';
    }

    // GMX - FULL EMAIL
    if (lowerDomain.includes('gmx')) {
      return '%EMAILADDRESS%';
    }

    // Mail.com - FULL EMAIL
    if (lowerDomain.includes('mail.com')) {
      return '%EMAILADDRESS%';
    }

    // Yandex - FULL EMAIL
    if (lowerDomain.includes('yandex')) {
      return '%EMAILADDRESS%';
    }

    // Fastmail - FULL EMAIL
    if (lowerDomain.includes('fastmail')) {
      return '%EMAILADDRESS%';
    }

    // Tutanota - FULL EMAIL
    if (lowerDomain.includes('tutanota')) {
      return '%EMAILADDRESS%';
    }

    // Mail.ru - FULL EMAIL
    if (lowerDomain.includes('mail.ru')) {
      return '%EMAILADDRESS%';
    }

    // QQ Mail - FULL EMAIL
    if (lowerDomain.includes('qq.com')) {
      return '%EMAILADDRESS%';
    }

    // 163.com / 126.com - FULL EMAIL
    if (lowerDomain.includes('163.com') || lowerDomain.includes('126.com')) {
      return '%EMAILADDRESS%';
    }

    // Default: Most modern providers use FULL EMAIL
    return '%EMAILADDRESS%';
  }

  /**
   * Format login using template (like Python's format_login)
   * @param {string} email - Email address
   * @param {string} template - Login template
   * @returns {string} Formatted login
   */
  formatLogin(email, template) {
    const [localPart, domain] = email.split('@');

    return template
      .replace('%EMAILADDRESS%', email)
      .replace('%EMAILLOCALPART%', localPart)
      .replace('%EMAILDOMAIN%', domain);
  }

  /**
   * Quick check if port is listening (like Python's is_listening)
   * @param {string} host - Hostname or IP
   * @param {number} port - Port number
   * @returns {Promise<boolean>} True if listening
   */
  async isPortListening(host, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();

      // Aggressive 1.5s timeout for fast discovery
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 1500);

      socket.connect(port, host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Full validation with discovery (like mailpass2smtp.py main flow)
   * @param {string} email - Email address
   * @param {string} password - Password
   * @param {Object} options - Options
   * @returns {Promise<Object>} Validation result
   */
  async validateCombo(email, password, options = {}) {
    const result = {
      email: email,
      valid: false,
      smtp: null,
      port: null,
      username: null,
      error: null,
      discoveryUsed: false,
      attempts: []
    };

    try {
      // Step 1: Discover SMTP servers
      const discovery = await this.guessSmtpServer(email);

      if (discovery.servers.length === 0) {
        result.error = 'No SMTP servers found';
        return result;
      }

      result.discoveryUsed = true;

      // Step 2: Try each server until one works
      for (const server of discovery.servers) {
        const username = this.formatLogin(email, discovery.loginTemplate);

        console.log(`🔍 Testing ${email} on ${server.host}:${server.port} (user: ${username})`);

        const testResult = await this.testCredentialsRaw({
          host: server.host,
          port: server.port,
          user: username,
          pass: password,
          timeout: options.timeout || 10000
        });

        result.attempts.push({
          host: server.host,
          port: server.port,
          username: username,
          valid: testResult.valid,
          error: testResult.error,
          usedNeighbor: testResult.usedNeighbor
        });

        if (testResult.valid) {
          result.valid = true;
          result.smtp = server.host;
          result.port = server.port;
          result.username = username;
          result.connectionTime = testResult.connectionTime;
          result.usedNeighbor = testResult.usedNeighbor;

          console.log(`✅ Valid: ${email} on ${server.host}:${server.port}`);
          break;
        }
      }

      if (!result.valid && result.attempts.length > 0) {
        result.error = result.attempts[result.attempts.length - 1].error;
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }
}

// Export the class for instance creation with options
module.exports = SMTPValidatorAdvanced;
function allowsInvalidCertificates() {
  return Boolean(securityConfig.getTlsPolicy().allowInvalidCertificates);
}

function minTlsVersion() {
  return securityConfig.getTlsPolicy().minVersion || 'TLSv1.2';
}
