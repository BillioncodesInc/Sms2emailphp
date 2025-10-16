/**
 * SMTP Warmup Module
 *
 * Implements "slow start" functionality to warm up new SMTP accounts gradually.
 * Prevents immediate blacklisting by starting with slow sending rates and gradually
 * increasing over time.
 *
 * Based on industry best practices:
 * - Day 1-3: Very slow (1-2 emails per hour)
 * - Day 4-7: Slow (5-10 emails per hour)
 * - Day 8-14: Medium (20-50 emails per hour)
 * - Day 15+: Normal speed
 *
 * Features:
 * - Automatic rate limiting based on SMTP age
 * - Configurable warmup schedules
 * - Per-SMTP tracking
 * - Warmup status reporting
 */

const fs = require('fs').promises;
const path = require('path');

// Default warmup schedule (emails per hour for each day range)
const DEFAULT_WARMUP_SCHEDULE = [
  { days: [1, 2, 3], emailsPerHour: 2, label: 'Very Slow Start' },
  { days: [4, 5, 6, 7], emailsPerHour: 10, label: 'Slow Start' },
  { days: [8, 9, 10, 11, 12, 13, 14], emailsPerHour: 30, label: 'Medium Start' },
  { days: [15, 16, 17, 18, 19, 20, 21], emailsPerHour: 60, label: 'Gradual Increase' },
  { days: [22, 23, 24, 25, 26, 27, 28], emailsPerHour: 100, label: 'Near Normal' },
  { days: [29], emailsPerHour: -1, label: 'Full Speed' } // -1 means no limit
];

class SMTPWarmupManager {
  constructor(storageDir = null) {
    this.storageDir = storageDir || path.join(__dirname, '../data/smtp_warmup');
    this.smtpTracking = new Map(); // In-memory tracking
    this.warmupSchedule = DEFAULT_WARMUP_SCHEDULE;
  }

  /**
   * Initialize the warmup manager
   */
  async initialize() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await this.loadTracking();
    } catch (err) {
      console.error('Failed to initialize SMTP warmup manager:', err);
    }
  }

  /**
   * Get storage file path
   */
  getStorageFilePath() {
    return path.join(this.storageDir, 'warmup_tracking.json');
  }

  /**
   * Load SMTP tracking from storage
   */
  async loadTracking() {
    try {
      const filePath = this.getStorageFilePath();
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);

      this.smtpTracking.clear();
      Object.entries(parsed).forEach(([key, value]) => {
        this.smtpTracking.set(key, {
          ...value,
          firstUsed: new Date(value.firstUsed),
          lastSent: value.lastSent ? new Date(value.lastSent) : null
        });
      });
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Failed to load warmup tracking:', err);
      }
    }
  }

  /**
   * Save SMTP tracking to storage
   */
  async saveTracking() {
    try {
      const filePath = this.getStorageFilePath();
      const data = Object.fromEntries(this.smtpTracking);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to save warmup tracking:', err);
    }
  }

  /**
   * Register a new SMTP account for warmup tracking
   * @param {string} smtpId - Unique identifier for SMTP (e.g., email address or host:port)
   * @param {Object} options - Registration options
   */
  async registerSmtp(smtpId, options = {}) {
    const { startDate = new Date(), customSchedule = null } = options;

    if (this.smtpTracking.has(smtpId)) {
      return {
        success: false,
        message: 'SMTP already registered',
        tracking: this.smtpTracking.get(smtpId)
      };
    }

    const tracking = {
      smtpId,
      firstUsed: startDate,
      lastSent: null,
      totalSent: 0,
      sentToday: 0,
      sentThisHour: 0,
      currentHour: new Date().getHours(),
      customSchedule: customSchedule || null,
      enabled: true
    };

    this.smtpTracking.set(smtpId, tracking);
    await this.saveTracking();

    return {
      success: true,
      message: 'SMTP registered for warmup',
      tracking
    };
  }

  /**
   * Calculate SMTP age in days
   * @param {string} smtpId - SMTP identifier
   * @returns {number} Age in days
   */
  getSmtpAge(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);
    if (!tracking) return 0;

    const now = new Date();
    const ageMs = now - tracking.firstUsed;
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include first day

    return ageDays;
  }

  /**
   * Get current rate limit for SMTP based on age
   * @param {string} smtpId - SMTP identifier
   * @returns {Object} Rate limit info
   */
  getRateLimit(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);

    if (!tracking) {
      return {
        limited: false,
        emailsPerHour: -1,
        reason: 'SMTP not registered for warmup'
      };
    }

    if (!tracking.enabled) {
      return {
        limited: false,
        emailsPerHour: -1,
        reason: 'Warmup disabled for this SMTP'
      };
    }

    const age = this.getSmtpAge(smtpId);
    const schedule = tracking.customSchedule || this.warmupSchedule;

    // Find matching schedule entry
    const scheduleEntry = schedule.find(entry =>
      entry.days.includes(age) || (entry.days[0] <= age && age >= entry.days[entry.days.length - 1])
    );

    if (!scheduleEntry) {
      // Age beyond warmup period - no limit
      return {
        limited: false,
        emailsPerHour: -1,
        age,
        reason: 'Warmup period completed',
        label: 'Full Speed'
      };
    }

    return {
      limited: scheduleEntry.emailsPerHour !== -1,
      emailsPerHour: scheduleEntry.emailsPerHour,
      age,
      label: scheduleEntry.label,
      reason: `SMTP is ${age} days old - using warmup rate`
    };
  }

  /**
   * Check if sending is allowed (rate limiting)
   * @param {string} smtpId - SMTP identifier
   * @returns {Object} Permission check result
   */
  canSend(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);

    if (!tracking) {
      // Not registered - allow (no warmup)
      return {
        allowed: true,
        reason: 'SMTP not in warmup mode'
      };
    }

    const rateLimit = this.getRateLimit(smtpId);

    if (!rateLimit.limited) {
      return {
        allowed: true,
        reason: rateLimit.reason,
        rateLimit
      };
    }

    // Check if we're in a new hour
    const currentHour = new Date().getHours();
    if (currentHour !== tracking.currentHour) {
      tracking.currentHour = currentHour;
      tracking.sentThisHour = 0;
    }

    // Check rate limit
    if (tracking.sentThisHour >= rateLimit.emailsPerHour) {
      return {
        allowed: false,
        reason: `Hourly limit reached (${rateLimit.emailsPerHour} emails/hour)`,
        rateLimit,
        waitTime: this.getWaitTime(smtpId)
      };
    }

    return {
      allowed: true,
      reason: 'Within rate limit',
      rateLimit,
      remaining: rateLimit.emailsPerHour - tracking.sentThisHour
    };
  }

  /**
   * Get recommended wait time before next send
   * @param {string} smtpId - SMTP identifier
   * @returns {number} Wait time in milliseconds
   */
  getWaitTime(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);
    if (!tracking || !tracking.lastSent) {
      return 0;
    }

    const rateLimit = this.getRateLimit(smtpId);
    if (!rateLimit.limited) {
      return 0;
    }

    // Calculate delay between emails based on hourly rate
    const emailsPerHour = rateLimit.emailsPerHour;
    const msPerEmail = (60 * 60 * 1000) / emailsPerHour; // milliseconds between emails

    const timeSinceLastSend = Date.now() - tracking.lastSent.getTime();
    const waitTime = Math.max(0, msPerEmail - timeSinceLastSend);

    return Math.ceil(waitTime);
  }

  /**
   * Record that an email was sent
   * @param {string} smtpId - SMTP identifier
   */
  async recordSent(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);

    if (!tracking) {
      // Auto-register if not already registered
      await this.registerSmtp(smtpId);
      return this.recordSent(smtpId);
    }

    tracking.lastSent = new Date();
    tracking.totalSent += 1;
    tracking.sentThisHour += 1;
    tracking.sentToday += 1;

    await this.saveTracking();

    return {
      success: true,
      tracking
    };
  }

  /**
   * Get warmup status for SMTP
   * @param {string} smtpId - SMTP identifier
   * @returns {Object} Status report
   */
  getStatus(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);

    if (!tracking) {
      return {
        registered: false,
        message: 'SMTP not registered for warmup'
      };
    }

    const rateLimit = this.getRateLimit(smtpId);
    const canSendResult = this.canSend(smtpId);
    const waitTime = this.getWaitTime(smtpId);

    return {
      registered: true,
      smtpId,
      age: this.getSmtpAge(smtpId),
      firstUsed: tracking.firstUsed,
      lastSent: tracking.lastSent,
      totalSent: tracking.totalSent,
      sentToday: tracking.sentToday,
      sentThisHour: tracking.sentThisHour,
      rateLimit,
      canSend: canSendResult.allowed,
      waitTime,
      enabled: tracking.enabled
    };
  }

  /**
   * Get all SMTP warmup statuses
   * @returns {Array} Array of status objects
   */
  getAllStatuses() {
    return Array.from(this.smtpTracking.keys()).map(smtpId =>
      this.getStatus(smtpId)
    );
  }

  /**
   * Disable warmup for an SMTP
   * @param {string} smtpId - SMTP identifier
   */
  async disableWarmup(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);

    if (!tracking) {
      return {
        success: false,
        message: 'SMTP not found'
      };
    }

    tracking.enabled = false;
    await this.saveTracking();

    return {
      success: true,
      message: 'Warmup disabled for SMTP'
    };
  }

  /**
   * Enable warmup for an SMTP
   * @param {string} smtpId - SMTP identifier
   */
  async enableWarmup(smtpId) {
    const tracking = this.smtpTracking.get(smtpId);

    if (!tracking) {
      return {
        success: false,
        message: 'SMTP not found'
      };
    }

    tracking.enabled = true;
    await this.saveTracking();

    return {
      success: true,
      message: 'Warmup enabled for SMTP'
    };
  }

  /**
   * Reset warmup tracking for an SMTP
   * @param {string} smtpId - SMTP identifier
   */
  async resetWarmup(smtpId) {
    this.smtpTracking.delete(smtpId);
    await this.saveTracking();

    return {
      success: true,
      message: 'Warmup tracking reset for SMTP'
    };
  }

  /**
   * Set custom warmup schedule
   * @param {Array} schedule - Custom schedule array
   */
  setWarmupSchedule(schedule) {
    this.warmupSchedule = schedule;
    return {
      success: true,
      schedule: this.warmupSchedule
    };
  }

  /**
   * Get current warmup schedule
   */
  getWarmupSchedule() {
    return this.warmupSchedule;
  }
}

module.exports = SMTPWarmupManager;
