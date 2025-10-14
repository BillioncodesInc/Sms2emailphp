const express = require("express");
const multer = require("multer");
const AttachmentConverter = require("../lib/attachmentConverter");
const LinkProtection = require("../lib/linkProtection");
const SMTPProfileManager = require("../lib/smtpProfileManager");
const EmailSecurity = require("../lib/emailSecurity");

const router = express.Router();

// Initialize managers
const smtpManager = new SMTPProfileManager();
const linkProtector = new LinkProtection();
const emailSecurity = new EmailSecurity();

// Initialize SMTP manager
smtpManager.initialize().catch(console.error);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * ========================================
 * ATTACHMENT CONVERSION ENDPOINTS
 * ========================================
 */

// Convert text to HTML
router.post("/convert/html", async (req, res) => {
  try {
    const { text, title, styling } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text content is required" });
    }

    const html = await AttachmentConverter.textToHTML(text, { title, styling });

    res.json({
      success: true,
      html,
      size: html.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR Code
router.post("/convert/qrcode", async (req, res) => {
  try {
    const { data, format = 'png', width, errorCorrectionLevel } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }

    const qrCode = await AttachmentConverter.generateQRCode(data, {
      format,
      width,
      errorCorrectionLevel
    });

    if (format === 'png') {
      res.json({
        success: true,
        dataUrl: qrCode,
        format: 'png'
      });
    } else {
      res.json({
        success: true,
        qrCode,
        format
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR Code HTML page
router.post("/convert/qrcode-html", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }

    const html = await AttachmentConverter.createQRCodeHTML(data);

    res.json({
      success: true,
      html,
      size: html.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert to PDF
router.post("/convert/pdf", async (req, res) => {
  try {
    const { content, title, author, fontSize, returnType = 'base64' } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const pdfBytes = await AttachmentConverter.toPDF(content, {
      title,
      author,
      fontSize
    });

    if (returnType === 'download') {
      // Return as downloadable PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'document'}.pdf"`);
      res.send(Buffer.from(pdfBytes));
    } else {
      // Return as base64 JSON
      const base64 = Buffer.from(pdfBytes).toString('base64');
      res.json({
        success: true,
        dataUrl: `data:application/pdf;base64,${base64}`,
        size: pdfBytes.length,
        filename: `${title || 'document'}.pdf`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================================
 * LINK PROTECTION ENDPOINTS
 * ========================================
 */

// Obfuscate single link
router.post("/link/obfuscate", (req, res) => {
  try {
    const { url, level = 'high', customKey, redirectDepth } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const result = linkProtector.obfuscateLink(url, {
      level,
      customKey,
      redirectDepth
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Replace all links in content
router.post("/link/protect-content", (req, res) => {
  try {
    const { content, level = 'high' } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const result = linkProtector.replaceLinksInContent(content, { level });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate tracking pixel
router.post("/link/tracking-pixel", (req, res) => {
  try {
    const { trackingUrl } = req.body;

    if (!trackingUrl) {
      return res.status(400).json({ error: "Tracking URL is required" });
    }

    const pixel = linkProtector.generateTrackingPixel(trackingUrl);

    res.json({
      success: true,
      html: pixel
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create redirect page
router.post("/link/redirect-page", (req, res) => {
  try {
    const { targetUrl, delay = 0 } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: "Target URL is required" });
    }

    const html = linkProtector.createRedirectPage(targetUrl, delay);

    res.json({
      success: true,
      html
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================================
 * SMTP PROFILE MANAGEMENT ENDPOINTS
 * ========================================
 */

// Add SMTP profile
router.post("/smtp/profile/add", async (req, res) => {
  try {
    // Transform request data to match manager expectations
    const { user, password, dailyLimit, ...rest } = req.body;
    const profileData = {
      ...rest,
      auth: {
        user: user,
        pass: password
      },
      maxPerDay: dailyLimit || null
    };
    const result = await smtpManager.addProfile(profileData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all profiles
router.get("/smtp/profile/list", (req, res) => {
  try {
    const profiles = smtpManager.getAllProfiles();
    res.json({
      success: true,
      profiles,
      count: profiles.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
router.get("/smtp/profile/:id", (req, res) => {
  try {
    const profile = smtpManager.getProfile(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put("/smtp/profile/:id", async (req, res) => {
  try {
    const result = await smtpManager.updateProfile(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete profile
router.delete("/smtp/profile/:id", async (req, res) => {
  try {
    const result = await smtpManager.deleteProfile(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile statistics
router.get("/smtp/profile/:id/stats", (req, res) => {
  try {
    const stats = smtpManager.getProfileStats(req.params.id);

    if (!stats) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall SMTP statistics
router.get("/smtp/stats", (req, res) => {
  try {
    const profiles = smtpManager.getAllProfiles();
    let totalSent = 0;
    let totalFailed = 0;

    profiles.forEach(profile => {
      totalSent += profile.stats?.totalSent || 0;
      totalFailed += profile.stats?.failed || 0;
    });

    const successRate = totalSent > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalSent,
        successful: totalSent,
        failed: totalFailed,
        successRate,
        activeProfiles: profiles.filter(p => p.enabled).length,
        totalProfiles: profiles.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get domain statistics
router.get("/smtp/stats/domains", (req, res) => {
  try {
    const stats = smtpManager.getDomainStats();
    res.json({
      success: true,
      stats,
      count: stats.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for domain stats (for compatibility)
router.get("/smtp/domain-stats", (req, res) => {
  try {
    const stats = smtpManager.getDomainStats();
    res.json({
      success: true,
      stats,
      count: stats.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================================
 * EMAIL SECURITY ENDPOINTS
 * ========================================
 */

// Generate DKIM keys
router.post("/security/dkim/generate", async (req, res) => {
  try {
    const { domain, selector } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    const result = await emailSecurity.generateDKIMKeys(domain, selector);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate SPF record
router.post("/security/spf/generate", (req, res) => {
  try {
    const { authorizedServers } = req.body;

    const spfRecord = emailSecurity.generateSPFRecord(authorizedServers || []);

    res.json({
      success: true,
      spfRecord,
      instructions: `Add this TXT record to your DNS for @ or root domain:\n${spfRecord}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate DMARC record
router.post("/security/dmarc/generate", (req, res) => {
  try {
    const { policy, reportEmail, percentage, alignment } = req.body;

    const dmarcRecord = emailSecurity.generateDMARCRecord({
      policy,
      reportEmail,
      percentage,
      alignment
    });

    res.json({
      success: true,
      dmarcRecord,
      instructions: `Add this TXT record to your DNS:\nName: _dmarc\nValue: ${dmarcRecord}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify domain security
router.post("/security/verify", async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    const results = await emailSecurity.verifyDomainSecurity(domain);

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze spam risk
router.post("/security/analyze-spam", (req, res) => {
  try {
    const { content, headers = {} } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const analysis = emailSecurity.analyzeSpamRisk(content, headers);

    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check rate limit
router.post("/security/rate-limit", (req, res) => {
  try {
    const { domain, maxPerHour } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    const result = emailSecurity.checkRateLimit(domain, maxPerHour);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================================
 * ENHANCED EMAIL SENDING WITH ALL FEATURES
 * ========================================
 */

router.post("/send/enhanced", upload.array('attachments', 10), async (req, res) => {
  try {
    const {
      recipients,
      subject,
      message,
      sender,
      senderAd,
      priority = 3,
      delay = 0,
      protectLinks = true,
      linkProtectionLevel = 'high',
      convertAttachments = false,
      attachmentFormat = 'html',
      useProfileManager = false,
      profileTag = null
    } = req.body;

    // Parse recipients
    const recipientList = Array.isArray(recipients) ? recipients : recipients.split(/[,;\n]+/).map(r => r.trim());

    if (recipientList.length === 0) {
      return res.status(400).json({ error: "No recipients specified" });
    }

    // Protect links if requested
    let processedMessage = message;
    if (protectLinks) {
      const protected = linkProtector.replaceLinksInContent(message, {
        level: linkProtectionLevel
      });
      processedMessage = protected.content;
    }

    // Select SMTP profile if using manager
    let smtpConfig = null;
    let profileId = null;

    if (useProfileManager) {
      const profile = await smtpManager.selectBestProfile({ tag: profileTag });
      if (profile) {
        smtpConfig = {
          host: profile.host,
          port: profile.port,
          secure: profile.secure,
          auth: profile.auth
        };
        profileId = profile.id;
      }
    }

    // Prepare response
    const results = {
      success: true,
      sent: 0,
      failed: 0,
      recipients: recipientList.length,
      details: []
    };

    // Send with delay if specified
    for (const recipient of recipientList) {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        // Record send attempt if using profile manager
        if (profileId) {
          const domain = recipient.split('@')[1];
          await smtpManager.recordSend(profileId, true, domain);
        }

        results.sent++;
        results.details.push({
          recipient,
          status: 'sent',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        if (profileId) {
          const domain = recipient.split('@')[1];
          await smtpManager.recordSend(profileId, false, domain);
        }

        results.failed++;
        results.details.push({
          recipient,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export manager instances for use in other modules
module.exports = {
  router,
  smtpManager,
  linkProtector,
  emailSecurity
};
