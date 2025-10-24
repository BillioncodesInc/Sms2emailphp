/**
 * Redirector Session Store
 *
 * Persistent storage for redirector validation sessions using SQLite
 * Allows pause/resume and survives server restarts
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class RedirectorSessionStore {
  constructor() {
    const dbDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.dbPath = path.join(dbDir, 'redirector-sessions.db');
    this.db = new Database(this.dbPath);
    this.initDatabase();
  }

  initDatabase() {
    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sessionId TEXT PRIMARY KEY,
        targetLink TEXT NOT NULL,
        status TEXT NOT NULL,
        total INTEGER DEFAULT 0,
        processed INTEGER DEFAULT 0,
        valid INTEGER DEFAULT 0,
        invalid INTEGER DEFAULT 0,
        batchSize INTEGER DEFAULT 10,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);

    // Results table (stores validation results)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        url TEXT NOT NULL,
        valid INTEGER,
        accessible INTEGER,
        status INTEGER,
        finalUrl TEXT,
        redirectsTo TEXT,
        expectedTarget TEXT,
        error TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (sessionId) REFERENCES sessions(sessionId) ON DELETE CASCADE
      )
    `);

    // Create index for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_results_session
      ON results(sessionId)
    `);

    console.log('✅ Redirector session database initialized');
  }

  // Create new session
  createSession(sessionId, targetLink, batchSize = 10) {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO sessions (
        sessionId, targetLink, status, batchSize,
        startTime, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(sessionId, targetLink, 'processing', batchSize, now, now, now);

    return {
      sessionId,
      targetLink,
      status: 'processing',
      total: 0,
      processed: 0,
      valid: 0,
      invalid: 0,
      batchSize,
      startTime: now
    };
  }

  // Get session
  getSession(sessionId) {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions WHERE sessionId = ?
    `);
    return stmt.get(sessionId);
  }

  // Update session stats
  updateSession(sessionId, updates) {
    const fields = [];
    const values = [];

    if (updates.total !== undefined) {
      fields.push('total = ?');
      values.push(updates.total);
    }
    if (updates.processed !== undefined) {
      fields.push('processed = ?');
      values.push(updates.processed);
    }
    if (updates.valid !== undefined) {
      fields.push('valid = ?');
      values.push(updates.valid);
    }
    if (updates.invalid !== undefined) {
      fields.push('invalid = ?');
      values.push(updates.invalid);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.endTime !== undefined) {
      fields.push('endTime = ?');
      values.push(updates.endTime);
    }

    fields.push('updatedAt = ?');
    values.push(Date.now());

    values.push(sessionId);

    const stmt = this.db.prepare(`
      UPDATE sessions
      SET ${fields.join(', ')}
      WHERE sessionId = ?
    `);

    stmt.run(...values);
  }

  // Add result
  addResult(sessionId, result) {
    const stmt = this.db.prepare(`
      INSERT INTO results (
        sessionId, url, valid, accessible, status,
        finalUrl, redirectsTo, expectedTarget, error, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sessionId,
      result.url,
      result.valid ? 1 : 0,
      result.accessible ? 1 : 0,
      result.status,
      result.finalUrl,
      result.redirectsTo,
      result.expectedTarget,
      result.error,
      Date.now()
    );
  }

  // Add multiple results (batch insert)
  addResults(sessionId, results) {
    const stmt = this.db.prepare(`
      INSERT INTO results (
        sessionId, url, valid, accessible, status,
        finalUrl, redirectsTo, expectedTarget, error, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insert = this.db.transaction((results) => {
      for (const result of results) {
        stmt.run(
          sessionId,
          result.url,
          result.valid ? 1 : 0,
          result.accessible ? 1 : 0,
          result.status,
          result.finalUrl,
          result.redirectsTo,
          result.expectedTarget,
          result.error,
          Date.now()
        );
      }
    });

    insert(results);
  }

  // Get results (paginated)
  getResults(sessionId, limit = 100, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM results
      WHERE sessionId = ?
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `);

    return stmt.all(sessionId, limit, offset).map(row => ({
      url: row.url,
      valid: row.valid === 1,
      accessible: row.accessible === 1,
      status: row.status,
      finalUrl: row.finalUrl,
      redirectsTo: row.redirectsTo,
      expectedTarget: row.expectedTarget,
      error: row.error
    }));
  }

  // Get valid results only
  getValidResults(sessionId) {
    const stmt = this.db.prepare(`
      SELECT url FROM results
      WHERE sessionId = ? AND valid = 1
      ORDER BY id ASC
    `);

    return stmt.all(sessionId).map(row => row.url);
  }

  // Get result count
  getResultCount(sessionId) {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM results WHERE sessionId = ?
    `);
    return stmt.get(sessionId).count;
  }

  // Delete session and all results
  deleteSession(sessionId) {
    const stmt = this.db.prepare(`
      DELETE FROM sessions WHERE sessionId = ?
    `);
    stmt.run(sessionId);

    // SQLite CASCADE will automatically delete results
  }

  // Get all active sessions
  getActiveSessions() {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions
      WHERE status IN ('processing', 'paused')
      ORDER BY createdAt DESC
    `);
    return stmt.all();
  }

  // Cleanup old completed sessions (older than 7 days)
  cleanupOldSessions(daysOld = 7) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare(`
      DELETE FROM sessions
      WHERE status = 'completed' AND endTime < ?
    `);
    const result = stmt.run(cutoff);
    console.log(`🧹 Cleaned up ${result.changes} old sessions`);
    return result.changes;
  }

  close() {
    this.db.close();
  }
}

// Create singleton instance
const sessionStore = new RedirectorSessionStore();

module.exports = sessionStore;
