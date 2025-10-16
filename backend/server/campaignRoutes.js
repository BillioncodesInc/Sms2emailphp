const express = require("express");
const router = express.Router();

/**
 * Campaign Management Routes
 * These routes handle campaign CRUD operations and stats
 */

module.exports = (campaignManager) => {

  // Create new campaign
  router.post("/campaigns/create", async (req, res) => {
    try {
      const result = await campaignManager.createCampaign(req.body);

      // Log activity
      await campaignManager.logActivity({
        type: 'campaign_created',
        campaignId: result.campaign.id,
        details: { name: result.campaign.name, mode: result.campaign.mode },
        status: 'success'
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all campaigns
  router.get("/campaigns", (req, res) => {
    try {
      const campaigns = campaignManager.getAllCampaigns();
      res.json({
        success: true,
        campaigns,
        count: campaigns.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get campaign by ID
  router.get("/campaigns/:id", (req, res) => {
    try {
      const campaign = campaignManager.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json({
        success: true,
        campaign
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update campaign
  router.put("/campaigns/:id", async (req, res) => {
    try {
      const result = await campaignManager.updateCampaign(req.params.id, req.body);

      // Log activity
      await campaignManager.logActivity({
        type: 'campaign_updated',
        campaignId: req.params.id,
        details: { updates: Object.keys(req.body) },
        status: 'success'
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete campaign
  router.delete("/campaigns/:id", async (req, res) => {
    try {
      const result = await campaignManager.deleteCampaign(req.params.id);

      // Log activity
      await campaignManager.logActivity({
        type: 'campaign_deleted',
        campaignId: req.params.id,
        status: 'success'
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update campaign stats
  router.post("/campaigns/:id/stats", async (req, res) => {
    try {
      await campaignManager.updateCampaignStats(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get campaign logs
  router.get("/campaigns/:id/logs", (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = campaignManager.getCampaignLogs(req.params.id, limit);
      res.json({
        success: true,
        logs,
        count: logs.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get overall statistics
  router.get("/stats/overall", (req, res) => {
    try {
      const stats = campaignManager.getOverallStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get recent activity logs
  router.get("/logs/recent", (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const logs = campaignManager.getRecentLogs(limit);
      res.json({
        success: true,
        logs,
        count: logs.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Log activity (for frontend to log actions)
  router.post("/logs/activity", async (req, res) => {
    try {
      const logEntry = await campaignManager.logActivity(req.body);
      res.json({
        success: true,
        log: logEntry
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
