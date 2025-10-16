const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CampaignManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/campaigns');
    this.campaignsFile = path.join(this.dataDir, 'campaigns.json');
    this.logsFile = path.join(this.dataDir, 'logs.json');
    this.campaigns = new Map();
    this.logs = [];
  }

  /**
   * Initialize campaign storage
   */
  async initialize() {
    try {
      // Create directory
      await fs.mkdir(this.dataDir, { recursive: true });

      // Load existing campaigns
      try {
        const data = await fs.readFile(this.campaignsFile, 'utf-8');
        const campaigns = JSON.parse(data);
        campaigns.forEach(camp => {
          this.campaigns.set(camp.id, camp);
        });
        console.log(`Loaded ${this.campaigns.size} campaigns from storage`);
      } catch (err) {
        console.log('No existing campaigns found, starting fresh');
      }

      // Load logs
      try {
        const logsData = await fs.readFile(this.logsFile, 'utf-8');
        this.logs = JSON.parse(logsData);
        console.log(`Loaded ${this.logs.length} log entries`);
      } catch (err) {
        console.log('No existing logs found, starting fresh');
      }
    } catch (error) {
      console.error('Failed to initialize campaign manager:', error);
      throw error;
    }
  }

  /**
   * Save campaigns to disk
   */
  async saveCampaigns() {
    try {
      const campaigns = Array.from(this.campaigns.values());
      await fs.writeFile(this.campaignsFile, JSON.stringify(campaigns, null, 2));
    } catch (error) {
      console.error('Failed to save campaigns:', error);
      throw error;
    }
  }

  /**
   * Save logs to disk
   */
  async saveLogs() {
    try {
      // Keep only last 1000 logs
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-1000);
      }
      await fs.writeFile(this.logsFile, JSON.stringify(this.logs, null, 2));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaignData) {
    const campaign = {
      id: crypto.randomBytes(16).toString('hex'),
      name: campaignData.name,
      mode: campaignData.mode || 'email',
      sender: campaignData.sender || {},
      content: campaignData.content || {},
      recipients: campaignData.recipients || [],
      attachments: campaignData.attachments || [],
      options: campaignData.options || {},
      status: 'draft',
      stats: {
        total: 0,
        sent: 0,
        failed: 0,
        successRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add carrier field for SMS campaigns
    if (campaignData.mode === 'sms' && campaignData.carrier) {
      campaign.carrier = campaignData.carrier;
    }

    this.campaigns.set(campaign.id, campaign);
    await this.saveCampaigns();

    return {
      success: true,
      campaign
    };
  }

  /**
   * Update campaign
   */
  async updateCampaign(id, updates) {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    Object.assign(campaign, updates);
    campaign.updatedAt = new Date().toISOString();

    this.campaigns.set(id, campaign);
    await this.saveCampaigns();

    return {
      success: true,
      campaign
    };
  }

  /**
   * Get campaign by ID
   */
  getCampaign(id) {
    return this.campaigns.get(id);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns() {
    return Array.from(this.campaigns.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id) {
    if (!this.campaigns.has(id)) {
      throw new Error('Campaign not found');
    }

    this.campaigns.delete(id);
    await this.saveCampaigns();

    return {
      success: true,
      message: 'Campaign deleted'
    };
  }

  /**
   * Update campaign stats
   */
  async updateCampaignStats(id, stats) {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      return;
    }

    campaign.stats = {
      ...campaign.stats,
      ...stats,
      successRate: stats.total > 0
        ? Math.round((stats.sent / stats.total) * 100)
        : 0
    };
    campaign.updatedAt = new Date().toISOString();

    this.campaigns.set(id, campaign);
    await this.saveCampaigns();
  }

  /**
   * Log activity
   */
  async logActivity(activity) {
    const logEntry = {
      id: crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      type: activity.type, // 'send', 'smtp_config', 'proxy_config', 'error', etc.
      campaignId: activity.campaignId || null,
      details: activity.details || {},
      status: activity.status || 'info' // 'success', 'error', 'warning', 'info'
    };

    this.logs.push(logEntry);

    // Save logs periodically (every 10 logs)
    if (this.logs.length % 10 === 0) {
      await this.saveLogs();
    }

    return logEntry;
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 50) {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Get logs by campaign
   */
  getCampaignLogs(campaignId, limit = 100) {
    return this.logs
      .filter(log => log.campaignId === campaignId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get overall statistics
   */
  getOverallStats() {
    const campaigns = Array.from(this.campaigns.values());

    let totalCampaigns = campaigns.length;
    let activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'sending').length;
    let completedCampaigns = campaigns.filter(c => c.status === 'completed').length;

    let totalSent = 0;
    let totalFailed = 0;
    let totalRecipients = 0;

    campaigns.forEach(campaign => {
      totalSent += campaign.stats.sent || 0;
      totalFailed += campaign.stats.failed || 0;
      totalRecipients += campaign.stats.total || 0;
    });

    const successRate = totalRecipients > 0
      ? Math.round((totalSent / totalRecipients) * 100)
      : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalSent,
      totalFailed,
      totalRecipients,
      successRate,
      recentActivity: this.getRecentLogs(10)
    };
  }

  /**
   * Get campaign statistics by date range
   */
  getCampaignStatsByDate(startDate, endDate) {
    const campaigns = Array.from(this.campaigns.values());

    const filtered = campaigns.filter(campaign => {
      const created = new Date(campaign.createdAt);
      return created >= startDate && created <= endDate;
    });

    return {
      count: filtered.length,
      sent: filtered.reduce((sum, c) => sum + (c.stats.sent || 0), 0),
      failed: filtered.reduce((sum, c) => sum + (c.stats.failed || 0), 0)
    };
  }
}

module.exports = CampaignManager;
