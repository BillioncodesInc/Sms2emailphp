'use strict';

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * SMTP Profile Manager
 * Manage unlimited SMTP configurations with tracking
 */

class SMTPProfileManager {
  constructor(dataDir = './data/smtp_profiles') {
    this.dataDir = dataDir;
    this.profiles = new Map();
    this.usage = new Map(); // Track usage per profile
    this.domainStats = new Map(); // Track emails per domain
    this.initialized = false;
  }

  /**
   * Initialize the profile manager
   */
  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await this.loadProfiles();
      await this.loadStats();
      this.initialized = true;
      console.log(`SMTP Profile Manager initialized with ${this.profiles.size} profiles`);
    } catch (error) {
      console.error('Failed to initialize SMTP Profile Manager:', error);
      throw error;
    }
  }

  /**
   * Add a new SMTP profile
   */
  async addProfile(profileData) {
    const {
      name,
      service,
      host,
      port,
      secure,
      auth,
      maxPerDay,
      priority = 5, // 1-10, higher = more likely to be used
      enabled = true,
      tags = []
    } = profileData;

    const profileId = this.generateProfileId(name);

    const profile = {
      id: profileId,
      name,
      service,
      host,
      port,
      secure,
      auth: {
        user: auth.user,
        pass: this.encryptPassword(auth.pass)
      },
      maxPerDay,
      priority,
      enabled,
      tags,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      stats: {
        totalSent: 0,
        failed: 0,
        todaySent: 0,
        lastReset: new Date().toISOString()
      }
    };

    this.profiles.set(profileId, profile);
    this.usage.set(profileId, []);

    await this.saveProfiles();

    return {
      success: true,
      profileId,
      message: 'Profile added successfully'
    };
  }

  /**
   * Get profile by ID
   */
  getProfile(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      return null;
    }

    // Decrypt password for use
    const decrypted = { ...profile };
    decrypted.auth = {
      ...profile.auth,
      pass: this.decryptPassword(profile.auth.pass)
    };

    return decrypted;
  }

  /**
   * Update profile
   */
  async updateProfile(profileId, updates) {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Encrypt password if being updated
    if (updates.auth && updates.auth.pass) {
      updates.auth.pass = this.encryptPassword(updates.auth.pass);
    }

    const updated = { ...profile, ...updates };
    this.profiles.set(profileId, updated);

    await this.saveProfiles();

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  }

  /**
   * Delete profile
   */
  async deleteProfile(profileId) {
    if (!this.profiles.has(profileId)) {
      throw new Error('Profile not found');
    }

    this.profiles.delete(profileId);
    this.usage.delete(profileId);

    await this.saveProfiles();

    return {
      success: true,
      message: 'Profile deleted successfully'
    };
  }

  /**
   * Select best profile based on availability, priority, and limits
   */
  async selectBestProfile(options = {}) {
    const { tag = null, domain = null } = options;

    const available = [];

    for (const [id, profile] of this.profiles) {
      // Check if enabled
      if (!profile.enabled) continue;

      // Check tag filter
      if (tag && !profile.tags.includes(tag)) continue;

      // Check daily limit
      if (this.isDailyLimitReached(profile)) continue;

      // Calculate score based on priority and usage
      const usageScore = this.calculateUsageScore(profile);
      const score = profile.priority * 10 + usageScore;

      available.push({
        id,
        profile,
        score
      });
    }

    if (available.length === 0) {
      return null;
    }

    // Sort by score (highest first)
    available.sort((a, b) => b.score - a.score);

    // Return top profile
    return available[0].profile;
  }

  /**
   * Record email send attempt
   */
  async recordSend(profileId, success, recipientDomain = null) {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    // Update profile stats
    profile.stats.totalSent++;
    profile.stats.todaySent++;
    if (!success) {
      profile.stats.failed++;
    }
    profile.lastUsed = new Date().toISOString();

    // Track usage
    const usage = this.usage.get(profileId) || [];
    usage.push({
      timestamp: new Date().toISOString(),
      success,
      domain: recipientDomain
    });

    // Keep only last 1000 entries
    if (usage.length > 1000) {
      usage.shift();
    }

    this.usage.set(profileId, usage);

    // Update domain stats
    if (recipientDomain) {
      const domainCount = this.domainStats.get(recipientDomain) || 0;
      this.domainStats.set(recipientDomain, domainCount + 1);
    }

    await this.saveProfiles();
    await this.saveStats();
  }

  /**
   * Reset daily counters (should be called daily via cron)
   */
  async resetDailyCounters() {
    for (const [id, profile] of this.profiles) {
      profile.stats.todaySent = 0;
      profile.stats.lastReset = new Date().toISOString();
    }

    await this.saveProfiles();

    console.log('Daily counters reset for all profiles');
  }

  /**
   * Get all profiles (masked passwords)
   */
  getAllProfiles() {
    const profiles = [];

    for (const [id, profile] of this.profiles) {
      profiles.push({
        ...profile,
        auth: {
          user: profile.auth.user,
          pass: '********'
        }
      });
    }

    return profiles;
  }

  /**
   * Get domain statistics
   */
  getDomainStats() {
    const stats = [];

    for (const [domain, count] of this.domainStats) {
      stats.push({ domain, count });
    }

    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * Get profile statistics
   */
  getProfileStats(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) return null;

    const usage = this.usage.get(profileId) || [];

    // Calculate success rate
    const total = usage.length;
    const successful = usage.filter(u => u.success).length;
    const successRate = total > 0 ? (successful / total * 100).toFixed(2) : 0;

    // Calculate today's usage
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = usage.filter(u => u.timestamp.startsWith(today));

    return {
      profile: {
        id: profileId,
        name: profile.name,
        enabled: profile.enabled,
        priority: profile.priority
      },
      stats: profile.stats,
      successRate: parseFloat(successRate),
      recentUsage: usage.slice(-10),
      todayUsage: todayUsage.length
    };
  }

  /**
   * Helper: Generate profile ID
   */
  generateProfileId(name) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${random}`;
  }

  /**
   * Helper: Encrypt password
   */
  encryptPassword(password) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync('SMTP_PROFILE_KEY', 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Helper: Decrypt password
   */
  decryptPassword(encrypted) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync('SMTP_PROFILE_KEY', 'salt', 32);

    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Helper: Check if daily limit reached
   */
  isDailyLimitReached(profile) {
    if (!profile.maxPerDay) return false;
    return profile.stats.todaySent >= profile.maxPerDay;
  }

  /**
   * Helper: Calculate usage score (lower usage = higher score)
   */
  calculateUsageScore(profile) {
    const maxScore = 100;
    if (!profile.maxPerDay) return maxScore;

    const usagePercent = (profile.stats.todaySent / profile.maxPerDay) * 100;
    return Math.max(0, maxScore - usagePercent);
  }

  /**
   * Persistence: Save profiles to disk
   */
  async saveProfiles() {
    const filePath = path.join(this.dataDir, 'profiles.json');
    const data = {
      profiles: Array.from(this.profiles.entries()),
      updated: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Persistence: Load profiles from disk
   */
  async loadProfiles() {
    const filePath = path.join(this.dataDir, 'profiles.json');

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);

      if (parsed.profiles) {
        this.profiles = new Map(parsed.profiles);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading profiles:', error);
      }
      // File doesn't exist yet, start fresh
    }
  }

  /**
   * Persistence: Save stats to disk
   */
  async saveStats() {
    const filePath = path.join(this.dataDir, 'stats.json');
    const data = {
      usage: Array.from(this.usage.entries()),
      domainStats: Array.from(this.domainStats.entries()),
      updated: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Persistence: Load stats from disk
   */
  async loadStats() {
    const filePath = path.join(this.dataDir, 'stats.json');

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);

      if (parsed.usage) {
        this.usage = new Map(parsed.usage);
      }
      if (parsed.domainStats) {
        this.domainStats = new Map(parsed.domainStats);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading stats:', error);
      }
    }
  }
}

module.exports = SMTPProfileManager;
