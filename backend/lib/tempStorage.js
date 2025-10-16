/**
 * Temp Storage Handler
 *
 * Manages temporary file storage for inbox search and contact extraction results
 * Stores results incrementally as they're processed for real-time frontend updates
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class TempStorage {
  constructor() {
    this.baseTempDir = path.join(os.tmpdir(), 'se-gateway-sessions');
    this.ensureBaseDirExists();

    // Auto-cleanup old sessions on startup
    this.cleanupOldSessions();
  }

  /**
   * Ensure base temp directory exists
   */
  ensureBaseDirExists() {
    if (!fs.existsSync(this.baseTempDir)) {
      fs.mkdirSync(this.baseTempDir, { recursive: true });
    }
  }

  /**
   * Create a new session directory
   */
  createSession(type, sessionId) {
    const sessionDir = path.join(this.baseTempDir, `${type}-${sessionId}`);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Create metadata file
    const metadata = {
      sessionId,
      type,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    fs.writeFileSync(
      path.join(sessionDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    return sessionDir;
  }

  /**
   * Save result for a specific email account (Inbox Searcher)
   */
  saveInboxResult(sessionId, email, result) {
    const sessionDir = path.join(this.baseTempDir, `inbox-${sessionId}`);
    if (!fs.existsSync(sessionDir)) {
      throw new Error('Session does not exist');
    }

    // Sanitize email for filename
    const safeEmail = email.replace(/[^a-z0-9@._-]/gi, '_');
    const resultFile = path.join(sessionDir, `${safeEmail}.json`);

    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));

    return resultFile;
  }

  /**
   * Append contact results (Contact Extractor)
   */
  appendContactResult(sessionId, accountResult) {
    const sessionDir = path.join(this.baseTempDir, `contacts-${sessionId}`);
    if (!fs.existsSync(sessionDir)) {
      throw new Error('Session does not exist');
    }

    const resultsFile = path.join(sessionDir, 'results.json');
    let results = { accounts: [] };

    // Read existing results
    if (fs.existsSync(resultsFile)) {
      try {
        results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      } catch (err) {
        console.error('Error reading results file:', err);
      }
    }

    // Append new account result
    results.accounts.push(accountResult);

    // Write back
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

    return results;
  }

  /**
   * Get all inbox results for a session
   */
  getInboxResults(sessionId) {
    const sessionDir = path.join(this.baseTempDir, `inbox-${sessionId}`);
    if (!fs.existsSync(sessionDir)) {
      return [];
    }

    const results = [];
    const files = fs.readdirSync(sessionDir);

    for (const file of files) {
      if (file.endsWith('.json') && file !== 'metadata.json') {
        const filePath = path.join(sessionDir, file);
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          results.push(data);
        } catch (err) {
          console.error(`Error reading ${file}:`, err);
        }
      }
    }

    return results;
  }

  /**
   * Get contact extraction results
   */
  getContactResults(sessionId) {
    const sessionDir = path.join(this.baseTempDir, `contacts-${sessionId}`);
    const resultsFile = path.join(sessionDir, 'results.json');

    if (!fs.existsSync(resultsFile)) {
      return { accounts: [] };
    }

    try {
      return JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    } catch (err) {
      console.error('Error reading contact results:', err);
      return { accounts: [] };
    }
  }

  /**
   * Update session metadata
   */
  updateMetadata(type, sessionId, updates) {
    const sessionDir = path.join(this.baseTempDir, `${type}-${sessionId}`);
    const metadataFile = path.join(sessionDir, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      throw new Error('Session metadata not found');
    }

    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    Object.assign(metadata, updates);
    metadata.updatedAt = new Date().toISOString();

    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    return metadata;
  }

  /**
   * Get session metadata
   */
  getMetadata(type, sessionId) {
    const sessionDir = path.join(this.baseTempDir, `${type}-${sessionId}`);
    const metadataFile = path.join(sessionDir, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    } catch (err) {
      console.error('Error reading metadata:', err);
      return null;
    }
  }

  /**
   * Delete a session
   */
  deleteSession(type, sessionId) {
    const sessionDir = path.join(this.baseTempDir, `${type}-${sessionId}`);

    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      return true;
    }

    return false;
  }

  /**
   * List all active sessions
   */
  listSessions(type = null) {
    if (!fs.existsSync(this.baseTempDir)) {
      return [];
    }

    const sessions = [];
    const dirs = fs.readdirSync(this.baseTempDir);

    for (const dir of dirs) {
      const match = dir.match(/^(inbox|contacts)-(.+)$/);
      if (match) {
        const [, sessionType, sessionId] = match;

        if (type && sessionType !== type) {
          continue;
        }

        const metadata = this.getMetadata(sessionType, sessionId);
        if (metadata) {
          sessions.push({
            type: sessionType,
            sessionId,
            ...metadata
          });
        }
      }
    }

    return sessions;
  }

  /**
   * Clean up sessions older than 24 hours
   */
  cleanupOldSessions() {
    if (!fs.existsSync(this.baseTempDir)) {
      return;
    }

    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const dirs = fs.readdirSync(this.baseTempDir);

    for (const dir of dirs) {
      const dirPath = path.join(this.baseTempDir, dir);
      const metadataFile = path.join(dirPath, 'metadata.json');

      if (fs.existsSync(metadataFile)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
          const createdAt = new Date(metadata.createdAt).getTime();

          if (now - createdAt > maxAge) {
            console.log(`Cleaning up old session: ${dir}`);
            fs.rmSync(dirPath, { recursive: true, force: true });
          }
        } catch (err) {
          console.error(`Error cleaning up ${dir}:`, err);
        }
      }
    }
  }

  /**
   * Get session size in bytes
   */
  getSessionSize(type, sessionId) {
    const sessionDir = path.join(this.baseTempDir, `${type}-${sessionId}`);

    if (!fs.existsSync(sessionDir)) {
      return 0;
    }

    let totalSize = 0;
    const files = fs.readdirSync(sessionDir);

    for (const file of files) {
      const filePath = path.join(sessionDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    return totalSize;
  }

  /**
   * Export session results as JSON
   */
  exportSessionJSON(type, sessionId) {
    if (type === 'inbox') {
      return this.getInboxResults(sessionId);
    } else if (type === 'contacts') {
      return this.getContactResults(sessionId);
    }
    return null;
  }
}

module.exports = new TempStorage();
