/**
 * SMTP Discovery Module - Phase 2
 * Intelligent SMTP server discovery through DNS and port scanning
 *
 * Features:
 * - MX record lookup via multiple DNS servers
 * - Port scanning (25, 465, 587, 2525)
 * - Connection testing
 * - STARTTLS capability detection
 * - AUTH method detection
 */

const dns = require('dns').promises;
const net = require('net');
const tls = require('tls');

class SMTPDiscovery {
  constructor() {
    // Common SMTP ports to scan
    this.SMTP_PORTS = [587, 465, 25, 2525];

    // DNS servers for fallback
    this.DNS_SERVERS = [
      '1.1.1.1',      // Cloudflare
      '8.8.8.8',      // Google
      '9.9.9.9',      // Quad9
      '208.67.222.222' // OpenDNS
    ];

    // Connection timeout
    this.CONNECTION_TIMEOUT = 5000; // 5 seconds

    // SMTP response codes
    this.SMTP_READY = '220';
    this.SMTP_OK = '250';
  }

  /**
   * Main discovery function - discovers SMTP settings for a domain/email
   * @param {string} input - Domain or email address
   * @returns {Promise<Object>} Discovery results
   */
  async discover(input) {
    const startTime = Date.now();

    try {
      // Extract domain from email if needed
      const domain = this.extractDomain(input);

      if (!domain) {
        throw new Error('Invalid domain or email address');
      }

      const results = {
        input: input,
        domain: domain,
        steps: [],
        servers: [],
        recommended: null,
        duration: 0
      };

      // Step 1: MX Record Lookup
      results.steps.push(await this.step1_lookupMX(domain));

      // Step 2: Port Scanning
      const mxHosts = results.steps[0].success ? results.steps[0].records.map(r => r.exchange) : [domain];
      results.steps.push(await this.step2_scanPorts(mxHosts));

      // Step 3: Connection Testing
      const openPorts = results.steps[1].success ? results.steps[1].openPorts : [];
      results.steps.push(await this.step3_testConnections(openPorts));

      // Step 4: Capability Detection
      const workingServers = results.steps[2].success ? results.steps[2].workingServers : [];
      results.steps.push(await this.step4_detectCapabilities(workingServers));

      // Compile final server list
      results.servers = this.compileServerList(results.steps);
      results.recommended = this.selectRecommended(results.servers);

      results.duration = Date.now() - startTime;
      results.success = results.servers.length > 0;

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Extract domain from email or return as-is
   */
  extractDomain(input) {
    if (!input || typeof input !== 'string') return null;

    input = input.trim().toLowerCase();

    // If it's an email, extract domain
    if (input.includes('@')) {
      const parts = input.split('@');
      return parts[1];
    }

    // Otherwise assume it's already a domain
    return input;
  }

  /**
   * Step 1: Lookup MX records
   */
  async step1_lookupMX(domain) {
    const step = {
      step: 1,
      name: 'MX Record Lookup',
      success: false,
      records: [],
      error: null,
      duration: 0
    };

    const startTime = Date.now();

    try {
      // Try to resolve MX records
      const records = await dns.resolveMx(domain);

      if (records && records.length > 0) {
        // Sort by priority (lower = higher priority)
        step.records = records.sort((a, b) => a.priority - b.priority);
        step.success = true;
        step.message = `Found ${records.length} MX record(s)`;
      } else {
        step.message = 'No MX records found, will try domain directly';
        step.records = [{ exchange: domain, priority: 0 }];
      }

    } catch (error) {
      // If MX lookup fails, try using the domain directly
      step.error = error.message;
      step.message = 'MX lookup failed, will try domain directly';
      step.records = [{ exchange: domain, priority: 0 }];
    }

    step.duration = Date.now() - startTime;
    return step;
  }

  /**
   * Step 2: Scan common SMTP ports
   */
  async step2_scanPorts(hosts) {
    const step = {
      step: 2,
      name: 'Port Scanning',
      success: false,
      openPorts: [],
      scannedCount: 0,
      duration: 0
    };

    const startTime = Date.now();

    try {
      const scanPromises = [];

      // Scan each host on each port
      for (const host of hosts.slice(0, 3)) { // Limit to top 3 MX records
        for (const port of this.SMTP_PORTS) {
          scanPromises.push(this.scanPort(host, port));
        }
      }

      const results = await Promise.all(scanPromises);
      step.openPorts = results.filter(r => r.open);
      step.scannedCount = results.length;
      step.success = step.openPorts.length > 0;
      step.message = `Found ${step.openPorts.length} open port(s) out of ${step.scannedCount} scanned`;

    } catch (error) {
      step.error = error.message;
      step.message = 'Port scanning failed';
    }

    step.duration = Date.now() - startTime;
    return step;
  }

  /**
   * Scan a single port
   */
  async scanPort(host, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ host, port, open: false, reason: 'timeout' });
      }, this.CONNECTION_TIMEOUT);

      socket.connect(port, host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({ host, port, open: true });
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({ host, port, open: false, reason: 'connection_refused' });
      });
    });
  }

  /**
   * Step 3: Test SMTP connections
   */
  async step3_testConnections(openPorts) {
    const step = {
      step: 3,
      name: 'Connection Testing',
      success: false,
      workingServers: [],
      testedCount: 0,
      duration: 0
    };

    const startTime = Date.now();

    try {
      const testPromises = openPorts.map(port => this.testSMTPConnection(port.host, port.port));
      const results = await Promise.all(testPromises);

      step.workingServers = results.filter(r => r.working);
      step.testedCount = results.length;
      step.success = step.workingServers.length > 0;
      step.message = `${step.workingServers.length} working SMTP server(s) found`;

    } catch (error) {
      step.error = error.message;
      step.message = 'Connection testing failed';
    }

    step.duration = Date.now() - startTime;
    return step;
  }

  /**
   * Test SMTP connection and get banner
   */
  async testSMTPConnection(host, port) {
    return new Promise((resolve) => {
      const result = {
        host,
        port,
        working: false,
        banner: null,
        protocol: this.guessProtocol(port)
      };

      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(result);
      }, this.CONNECTION_TIMEOUT);

      let data = '';

      socket.connect(port, host, () => {
        // Connected successfully
      });

      socket.on('data', (chunk) => {
        data += chunk.toString();

        // Check for SMTP ready response (220)
        if (data.includes(this.SMTP_READY)) {
          clearTimeout(timeout);
          result.working = true;
          result.banner = data.split('\r\n')[0];
          socket.destroy();
          resolve(result);
        }
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(result);
      });

      socket.on('close', () => {
        clearTimeout(timeout);
        resolve(result);
      });
    });
  }

  /**
   * Step 4: Detect capabilities (STARTTLS, AUTH methods)
   */
  async step4_detectCapabilities(workingServers) {
    const step = {
      step: 4,
      name: 'Capability Detection',
      success: false,
      serversWithCapabilities: [],
      duration: 0
    };

    const startTime = Date.now();

    try {
      const detectPromises = workingServers.map(server =>
        this.detectServerCapabilities(server.host, server.port)
      );

      const results = await Promise.all(detectPromises);
      step.serversWithCapabilities = results;
      step.success = results.length > 0;
      step.message = `Detected capabilities for ${results.length} server(s)`;

    } catch (error) {
      step.error = error.message;
      step.message = 'Capability detection failed';
    }

    step.duration = Date.now() - startTime;
    return step;
  }

  /**
   * Detect server capabilities (STARTTLS, AUTH)
   */
  async detectServerCapabilities(host, port) {
    return new Promise((resolve) => {
      const result = {
        host,
        port,
        starttls: false,
        authMethods: [],
        ssl: port === 465,
        protocol: this.guessProtocol(port)
      };

      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(result);
      }, this.CONNECTION_TIMEOUT);

      let data = '';
      let ehloSent = false;

      socket.connect(port, host);

      socket.on('data', (chunk) => {
        data += chunk.toString();

        // Wait for 220 ready, then send EHLO
        if (data.includes(this.SMTP_READY) && !ehloSent) {
          ehloSent = true;
          socket.write('EHLO discovery\r\n');
        }

        // Parse EHLO response for capabilities
        if (ehloSent && data.includes(this.SMTP_OK)) {
          const lines = data.split('\r\n');

          for (const line of lines) {
            if (line.includes('STARTTLS')) {
              result.starttls = true;
            }
            if (line.includes('AUTH')) {
              // Extract auth methods: AUTH PLAIN LOGIN XOAUTH2
              const authMatch = line.match(/AUTH\s+(.+)/i);
              if (authMatch) {
                result.authMethods = authMatch[1].trim().split(' ');
              }
            }
          }

          clearTimeout(timeout);
          socket.write('QUIT\r\n');
          socket.destroy();
          resolve(result);
        }
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(result);
      });
    });
  }

  /**
   * Guess protocol based on port
   */
  guessProtocol(port) {
    switch (port) {
      case 465:
        return 'SSL';
      case 587:
        return 'STARTTLS';
      case 25:
        return 'Plain/STARTTLS';
      case 2525:
        return 'Plain/STARTTLS';
      default:
        return 'Unknown';
    }
  }

  /**
   * Compile final server list from all steps
   */
  compileServerList(steps) {
    const servers = [];

    // Get servers with capabilities (step 4)
    if (steps[3] && steps[3].serversWithCapabilities) {
      for (const server of steps[3].serversWithCapabilities) {
        servers.push({
          host: server.host,
          port: server.port,
          ssl: server.ssl,
          starttls: server.starttls,
          authMethods: server.authMethods,
          protocol: server.protocol,
          recommended: false
        });
      }
    }

    return servers;
  }

  /**
   * Select recommended server (prefer 587 STARTTLS, then 465 SSL)
   */
  selectRecommended(servers) {
    if (servers.length === 0) return null;

    // Prefer port 587 with STARTTLS
    let recommended = servers.find(s => s.port === 587 && s.starttls);

    // If not found, prefer port 465 SSL
    if (!recommended) {
      recommended = servers.find(s => s.port === 465 && s.ssl);
    }

    // If still not found, just use first available
    if (!recommended) {
      recommended = servers[0];
    }

    recommended.recommended = true;
    return recommended;
  }

  /**
   * Quick scan - fast version that only checks most common configs
   */
  async quickScan(domain) {
    domain = this.extractDomain(domain);

    const commonConfigs = [
      { host: `smtp.${domain}`, port: 587 },
      { host: `smtp.${domain}`, port: 465 },
      { host: `mail.${domain}`, port: 587 },
      { host: `mail.${domain}`, port: 465 },
      { host: domain, port: 587 },
      { host: domain, port: 465 }
    ];

    const results = [];

    for (const config of commonConfigs) {
      const test = await this.testSMTPConnection(config.host, config.port);
      if (test.working) {
        const caps = await this.detectServerCapabilities(config.host, config.port);
        results.push(caps);
      }
    }

    return {
      success: results.length > 0,
      domain: domain,
      servers: results,
      recommended: this.selectRecommended(results)
    };
  }
}

module.exports = new SMTPDiscovery();
