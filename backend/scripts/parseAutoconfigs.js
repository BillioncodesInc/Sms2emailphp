#!/usr/bin/env node

/**
 * Parse autoconfigs_enriched.txt and create structured JSON database
 * This script processes the 893-domain SMTP configuration file
 */

const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '../../autoconfigs_enriched.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/smtp_database.json');

console.log('📚 Parsing SMTP Autoconfigs Database...\n');

// Read the input file
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

const database = {
  metadata: {
    source: 'https://autoconfig.thunderbird.net/v1.1/',
    lastUpdated: null,
    totalDomains: 0,
    generatedAt: new Date().toISOString()
  },
  domains: {}
};

let parsedCount = 0;
let skippedCount = 0;

// Process each line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Skip empty lines
  if (!line) {
    skippedCount++;
    continue;
  }

  // Parse metadata from first line
  if (i === 0 && line.includes('updated at:')) {
    const match = line.match(/updated at: ([0-9-]+)/);
    if (match) {
      database.metadata.lastUpdated = match[1];
    }
    skippedCount++;
    continue;
  }

  // Skip header line
  if (line.includes('domain;smtp_host')) {
    skippedCount++;
    continue;
  }

  // Parse domain entry
  // Format: domain;smtp_host:smtp_port,smtp_host:smtp_port;login_template
  const parts = line.split(';');

  if (parts.length !== 3) {
    console.warn(`⚠️  Skipping malformed line ${i + 1}: ${line}`);
    skippedCount++;
    continue;
  }

  const domain = parts[0].trim();
  const smtpServers = parts[1].trim();
  const loginTemplate = parts[2].trim();

  // Parse SMTP servers
  const servers = [];
  const serverEntries = smtpServers.split(',');

  for (const entry of serverEntries) {
    const [host, port] = entry.split(':');

    if (host && port) {
      servers.push({
        host: host.trim(),
        port: parseInt(port.trim(), 10),
        // Determine protocol based on port
        protocol: port.trim() === '465' ? 'SSL' : 'TLS'
      });
    }
  }

  // Skip if no valid servers found
  if (servers.length === 0) {
    console.warn(`⚠️  No valid SMTP servers for domain: ${domain}`);
    skippedCount++;
    continue;
  }

  // Add to database
  database.domains[domain] = {
    servers,
    loginTemplate,
    // Add some helper metadata
    primaryServer: servers[0],
    alternateServers: servers.slice(1),
    supportsSSL: servers.some(s => s.protocol === 'SSL'),
    supportsTLS: servers.some(s => s.protocol === 'TLS')
  };

  parsedCount++;
}

// Update total count
database.metadata.totalDomains = parsedCount;

// Write to output file
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2), 'utf-8');

console.log('✅ Parsing complete!\n');
console.log('📊 Statistics:');
console.log(`   Total lines processed: ${lines.length}`);
console.log(`   Successfully parsed: ${parsedCount} domains`);
console.log(`   Skipped: ${skippedCount} lines`);
console.log(`   Output file: ${OUTPUT_FILE}`);
console.log(`   File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);

// Show some sample entries
console.log('📝 Sample entries:');
const sampleDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'aol.com', 'icloud.com'];
for (const domain of sampleDomains) {
  if (database.domains[domain]) {
    const entry = database.domains[domain];
    console.log(`\n   ${domain}:`);
    console.log(`     Primary: ${entry.primaryServer.host}:${entry.primaryServer.port} (${entry.primaryServer.protocol})`);
    if (entry.alternateServers.length > 0) {
      console.log(`     Alternates: ${entry.alternateServers.length}`);
    }
    console.log(`     Login: ${entry.loginTemplate}`);
  }
}

console.log('\n🎉 Database ready for use!');
