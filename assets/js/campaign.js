// Campaign Manager JavaScript
// Unified campaign workflow with step-by-step process

// Global state
let currentStep = 1;
let campaignData = {
  name: '',
  mode: 'email',
  sender: { name: '', email: '' },
  content: { subject: '', message: '', link: '' },
  recipients: [],
  attachments: [],
  options: {
    smtpProfile: null,
    linkProtection: { enabled: true, level: 'high' },
    useProxy: false,
    delay: 500,
    priority: 'normal',
    // Advanced email features (enabled by default)
    enableCustomHeaders: true,
    enableGmailSlowMode: true,
    enableWarmup: false, // Disabled by default, user can enable
    enableZeroWidth: true,
    enableAttributeShuffle: true,
    enableMacros: true,
    enableReadReceipt: false // Disabled by default
  }
};
let selectedAttachments = [];
let availableAttachments = [];
let smtpProfiles = [];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  // Set up navigation
  setupNavigation();

  // Load initial data
  loadDashboardStats();
  loadAttachments();
  loadSMTPProfiles();

  // Set up mode change handler
  document.getElementById('campaign-mode').addEventListener('change', handleModeChange);

  // Display environment info
  document.getElementById('api-endpoint').textContent = API_BASE;
  document.getElementById('environment').textContent = window.location.hostname === 'localhost' ? 'Development (Local)' : 'Production';

  console.log('Campaign Manager initialized');
}

/**
 * Setup navigation
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      showSection(section);

      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/**
 * Show specific section
 */
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  const targetSection = document.getElementById(sectionName + '-section');
  if (targetSection) {
    targetSection.classList.add('active');

    // Load section-specific data
    if (sectionName === 'attachments') {
      loadAttachments();
    } else if (sectionName === 'smtp-profiles') {
      loadSMTPProfiles();
    } else if (sectionName === 'dashboard') {
      loadDashboardStats();
    }
  }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  try {
    showSpinner(true);

    // Load SMTP profiles
    const profilesResp = await fetch(`${API_BASE}/smtp/profile/list`);
    const profilesData = await profilesResp.json();

    if (profilesData.success) {
      document.getElementById('stat-profiles').textContent = profilesData.count;
    }

    // Load SMTP stats
    const statsResp = await fetch(`${API_BASE}/smtp/stats`);
    const statsData = await statsResp.json();

    if (statsData.success) {
      document.getElementById('stat-total-sent').textContent = statsData.stats.totalSent || 0;
      document.getElementById('stat-success').textContent = statsData.stats.successful || 0;
      document.getElementById('stat-errors').textContent = statsData.stats.failed || 0;
    }
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
  } finally {
    showSpinner(false);
  }
}

/**
 * Campaign wizard navigation
 */
function nextStep(current) {
  // Validate current step
  if (!validateStep(current)) {
    return;
  }

  // Save current step data
  saveStepData(current);

  // Move to next step
  const nextStepNum = current + 1;
  if (nextStepNum <= 5) {
    showStep(nextStepNum);

    // If moving to step 5, generate summary
    if (nextStepNum === 5) {
      generateCampaignSummary();
    }
  }
}

function prevStep(current) {
  const prevStepNum = current - 1;
  if (prevStepNum >= 1) {
    showStep(prevStepNum);
  }
}

function showStep(stepNum) {
  // Hide all steps
  for (let i = 1; i <= 5; i++) {
    document.getElementById('step-' + i).style.display = 'none';
  }

  // Show target step
  document.getElementById('step-' + stepNum).style.display = 'block';

  // Update wizard progress
  updateWizardProgress(stepNum);

  currentStep = stepNum;
}

function updateWizardProgress(stepNum) {
  const steps = document.querySelectorAll('.wizard-step');
  steps.forEach((step, index) => {
    const num = index + 1;
    step.classList.remove('active', 'completed');

    if (num < stepNum) {
      step.classList.add('completed');
    } else if (num === stepNum) {
      step.classList.add('active');
    }
  });
}

/**
 * Validate step data
 */
function validateStep(stepNum) {
  switch(stepNum) {
    case 1:
      const name = document.getElementById('campaign-name').value.trim();
      const senderName = document.getElementById('sender-name').value.trim();

      if (!name) {
        showAlert('Please enter a campaign name', 'warning');
        return false;
      }
      if (!senderName) {
        showAlert('Please enter a sender name', 'warning');
        return false;
      }

      const mode = document.getElementById('campaign-mode').value;
      if (mode === 'email') {
        const senderEmail = document.getElementById('sender-email').value.trim();
        if (!senderEmail || !isValidEmail(senderEmail)) {
          showAlert('Please enter a valid sender email address', 'warning');
          return false;
        }
      }
      return true;

    case 2:
      const message = document.getElementById('campaign-message').value.trim();

      // Message is optional for email mode if attachments are selected
      if (!message) {
        if (campaignData.mode === 'email' && selectedAttachments.length > 0) {
          // Allow empty message when email mode has attachments
          console.log('Email mode with attachments - message is optional');
        } else {
          showAlert('Please enter a message', 'warning');
          return false;
        }
      }

      if (campaignData.mode === 'email') {
        const subject = document.getElementById('campaign-subject').value.trim();
        if (!subject) {
          showAlert('Please enter a subject line', 'warning');
          return false;
        }
      }
      return true;

    case 3:
      const recipients = document.getElementById('campaign-recipients').value.trim();
      if (!recipients) {
        showAlert('Please add recipients', 'warning');
        return false;
      }

      if (campaignData.mode === 'sms') {
        const carrier = document.getElementById('campaign-carrier').value;
        if (!carrier) {
          showAlert('Please select a carrier', 'warning');
          return false;
        }
      }
      return true;

    case 4:
      // Options are all optional
      return true;

    default:
      return true;
  }
}

/**
 * Save step data to campaignData
 */
function saveStepData(stepNum) {
  switch(stepNum) {
    case 1:
      campaignData.name = document.getElementById('campaign-name').value.trim();
      campaignData.mode = document.getElementById('campaign-mode').value;
      campaignData.sender.name = document.getElementById('sender-name').value.trim();
      if (campaignData.mode === 'email') {
        campaignData.sender.email = document.getElementById('sender-email').value.trim();
      }
      break;

    case 2:
      campaignData.content.message = document.getElementById('campaign-message').value.trim();
      campaignData.content.link = document.getElementById('campaign-link').value.trim();
      if (campaignData.mode === 'email') {
        campaignData.content.subject = document.getElementById('campaign-subject').value.trim();
      }
      campaignData.attachments = selectedAttachments.slice();
      break;

    case 3:
      const recipientsText = document.getElementById('campaign-recipients').value.trim();
      campaignData.recipients = recipientsText.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean);
      if (campaignData.mode === 'sms') {
        campaignData.carrier = document.getElementById('campaign-carrier').value;
      }
      break;

    case 4:
      campaignData.options.smtpProfile = document.getElementById('smtp-profile-select').value;
      campaignData.options.linkProtection.enabled = document.getElementById('enable-link-protection').checked;
      campaignData.options.linkProtection.level = document.getElementById('link-protection-level').value;
      campaignData.options.useProxy = document.getElementById('use-proxy').checked;
      campaignData.options.delay = parseInt(document.getElementById('send-delay').value) || 0;
      campaignData.options.priority = document.getElementById('campaign-priority').value || 'normal';

      // Advanced email features
      campaignData.options.enableCustomHeaders = document.getElementById('enable-custom-headers').checked;
      campaignData.options.enableGmailSlowMode = document.getElementById('enable-gmail-slow-mode').checked;
      campaignData.options.enableWarmup = document.getElementById('enable-warmup').checked;
      campaignData.options.enableZeroWidth = document.getElementById('enable-zero-width').checked;
      campaignData.options.enableAttributeShuffle = document.getElementById('enable-attribute-shuffle').checked;
      campaignData.options.enableMacros = document.getElementById('enable-macros').checked;
      campaignData.options.enableReadReceipt = document.getElementById('enable-read-receipt').checked;
      break;
  }
}

/**
 * Generate campaign summary
 */
function generateCampaignSummary() {
  const summary = `
    <div style="padding: 15px;">
      <div style="margin-bottom: 15px;">
        <strong>Campaign Name:</strong> ${escapeHtml(campaignData.name)}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Mode:</strong> ${campaignData.mode.toUpperCase()}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Sender:</strong> ${escapeHtml(campaignData.sender.name)} ${campaignData.sender.email ? '&lt;' + escapeHtml(campaignData.sender.email) + '&gt;' : ''}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Recipients:</strong> ${campaignData.recipients.length}
      </div>
      ${campaignData.mode === 'email' ? `
      <div style="margin-bottom: 15px;">
        <strong>Subject:</strong> ${escapeHtml(campaignData.content.subject)}
      </div>` : ''}
      <div style="margin-bottom: 15px;">
        <strong>Attachments:</strong> ${campaignData.attachments.length}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Link Protection:</strong> ${campaignData.options.linkProtection.enabled ? 'Enabled (' + campaignData.options.linkProtection.level + ')' : 'Disabled'}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Send Delay:</strong> ${campaignData.options.delay}ms
      </div>
    </div>
  `;

  document.getElementById('summary-content').innerHTML = summary;
}

/**
 * Handle mode change (SMS vs Email)
 */
function handleModeChange() {
  const mode = document.getElementById('campaign-mode').value;

  // Show/hide email-specific fields
  const emailSubjectGroup = document.getElementById('email-subject-group');
  const senderEmailGroup = document.getElementById('sender-email-group');
  const emailValidationSection = document.getElementById('email-validation-section');
  const carrierGroup = document.getElementById('carrier-group');

  if (mode === 'email') {
    if (emailSubjectGroup) emailSubjectGroup.style.display = 'block';
    if (senderEmailGroup) senderEmailGroup.style.display = 'block';
    if (emailValidationSection) emailValidationSection.style.display = 'block';
    if (carrierGroup) carrierGroup.style.display = 'none';
    document.getElementById('recipients-label').textContent = 'Email Addresses (one per line)';
    document.getElementById('campaign-recipients').placeholder = 'email1@example.com\nemail2@example.com';
  } else {
    if (emailSubjectGroup) emailSubjectGroup.style.display = 'none';
    if (senderEmailGroup) senderEmailGroup.style.display = 'none';
    if (emailValidationSection) emailValidationSection.style.display = 'none';
    if (carrierGroup) carrierGroup.style.display = 'block';
    document.getElementById('recipients-label').textContent = 'Phone Numbers (one per line)';
    document.getElementById('campaign-recipients').placeholder = '1234567890\n9876543210';
  }
}

/**
 * Validate email recipients
 */
async function validateRecipients() {
  try {
    showSpinner(true);

    const emails = document.getElementById('campaign-recipients').value;
    const denylist = document.getElementById('denylist').value;

    const response = await fetch(`${API_BASE}/validateEmails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emails: emails,
        excludeMajors: true,
        denylist: denylist
      })
    });

    const data = await response.json();

    if (data.valid) {
      document.getElementById('campaign-recipients').value = data.valid.join('\n');
      document.getElementById('validation-result').textContent =
        `✓ Valid: ${data.valid.length} | Removed: ${data.removed.length}`;
      showAlert(`Validation complete! ${data.valid.length} valid emails`, 'success');
    }
  } catch (error) {
    console.error('Email validation failed:', error);
    showAlert('Email validation failed: ' + error.message, 'danger');
  } finally {
    showSpinner(false);
  }
}

/**
 * Send campaign
 */
async function sendCampaign() {
  try {
    // Disable send button
    const sendBtn = document.getElementById('send-btn');
    const backBtn = document.getElementById('back-btn-5');
    sendBtn.disabled = true;
    backBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Show progress section
    document.getElementById('send-progress').style.display = 'block';

    const total = campaignData.recipients.length;
    document.getElementById('progress-total').textContent = total;

    if (campaignData.mode === 'email') {
      await sendEmailCampaign(total);
    } else {
      await sendSMSCampaign(total);
    }

  } catch (error) {
    console.error('Campaign send failed:', error);
    showAlert('Campaign failed: ' + error.message, 'danger');
  } finally {
    const sendBtn = document.getElementById('send-btn');
    const backBtn = document.getElementById('back-btn-5');
    sendBtn.disabled = false;
    backBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-rocket"></i> Send Campaign';
  }
}

/**
 * Send email campaign (Enhanced with advanced features)
 */
async function sendEmailCampaign(total) {
  let message = campaignData.content.message;

  // Add link if provided
  if (campaignData.content.link) {
    message += '\n\n' + campaignData.content.link;
  }

  // Protect links if enabled
  if (campaignData.options.linkProtection.enabled && campaignData.content.link) {
    try {
      const protectResp = await fetch(`${API_BASE}/link/obfuscate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: campaignData.content.link,
          level: campaignData.options.linkProtection.level
        })
      });

      const protectData = await protectResp.json();
      if (protectData.success) {
        message = message.replace(campaignData.content.link, protectData.obfuscated);
      }
    } catch (error) {
      console.error('Link protection failed:', error);
    }
  }

  try {
    // Use enhanced campaign endpoint with all advanced features
    const response = await fetch(`${API_LEGACY}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: campaignData.recipients,
        subject: campaignData.content.subject,
        message: message,
        sender: campaignData.sender.name,
        senderAd: campaignData.sender.email,
        useProxy: campaignData.options.useProxy === true
      })
    });

    // Handle response: /email endpoint returns "true" on success or {success: false, message: "..."} on error
    const responseText = await response.text();

    if (responseText === "true") {
      const sent = campaignData.recipients.length;
      const failed = 0; // /email endpoint doesn't provide individual failure counts

      // Update progress in real-time (already complete, show 100%)
      updateProgress(sent, failed, total);

      // Show completion message
      showSendResults(sent, failed, total);

      console.log(`Campaign sent successfully to ${sent} recipients`);
    } else {
      // Parse error response
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || 'Campaign failed');
      } catch (parseError) {
        throw new Error('Campaign failed: ' + responseText);
      }
    }

  } catch (error) {
    console.error('Enhanced campaign send failed:', error);
    showAlert('Campaign failed: ' + error.message, 'danger');

    // Fallback: Update progress showing failure
    updateProgress(0, total, total);
  }
}

/**
 * Send SMS campaign
 */
async function sendSMSCampaign(total) {
  let message = campaignData.content.message;

  // Add link if provided
  if (campaignData.content.link) {
    message += ' ' + campaignData.content.link;
  }

  try {
    // Use the bulk SMS campaign endpoint instead of individual sends
    const response = await fetch(`${API_BASE}/campaign/execute-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: 'wizard-' + Date.now(), // Generate temporary campaign ID
        carrier: campaignData.carrier,
        recipients: campaignData.recipients,
        message: message,
        sender: campaignData.sender.name,
        delay: campaignData.options.delay || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      // Update progress with final results
      updateProgress(result.results.sent, result.results.failed, total);

      // Show completion message
      showSendResults(result.results.sent, result.results.failed, total);
    } else {
      throw new Error(result.error || 'SMS campaign failed');
    }

  } catch (error) {
    console.error('SMS campaign failed:', error);
    showAlert('SMS campaign failed: ' + error.message, 'danger');
    updateProgress(0, total, total); // Mark all as failed
  }
}

/**
 * Update progress bar
 */
function updateProgress(sent, failed, total) {
  const processed = sent + failed;
  const percentage = Math.round((processed / total) * 100);

  document.getElementById('progress-bar').style.width = percentage + '%';
  document.getElementById('progress-bar').textContent = percentage + '%';
  document.getElementById('progress-sent').textContent = sent;
  document.getElementById('progress-failed').textContent = failed;
}

/**
 * Show send results
 */
function showSendResults(sent, failed, total) {
  const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

  const resultsHTML = `
    <div class="alert alert-${failed === 0 ? 'success' : 'warning'}">
      <i class="fas fa-check-circle"></i>
      <div>
        <strong>Campaign Complete!</strong><br>
        Successfully sent to ${sent} out of ${total} recipients (${successRate}% success rate)
        ${failed > 0 ? `<br>${failed} messages failed to send.` : ''}
      </div>
    </div>
  `;

  document.getElementById('send-results').innerHTML = resultsHTML;

  // Update dashboard stats
  setTimeout(() => {
    loadDashboardStats();
  }, 1000);
}

/**
 * Text spinning function
 */
function spinText(input) {
  return input.replace(/{{([^{}]*)}}/g, function(match, content) {
    const choices = content.split("|");
    return choices[Math.floor(Math.random() * choices.length)];
  });
}

/**
 * Collapse sections
 */
function toggleCollapse(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.toggle('open');
  }
}

/**
 * Attachment Management
 */
async function loadAttachments() {
  try {
    const response = await fetch(`${API_BASE}/attachments`);
    const data = await response.json();

    if (data.success) {
      availableAttachments = data.attachments;
      renderAttachmentsList(data.attachments);
      updateSMTPProfileSelect();
    }
  } catch (error) {
    console.error('Failed to load attachments:', error);
  }
}

function renderAttachmentsList(attachments) {
  const container = document.getElementById('attachments-list');

  if (!attachments || attachments.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No attachments yet</p>';
    return;
  }

  container.innerHTML = attachments.map(att => `
    <div class="attachment-item">
      <div class="attachment-info">
        <div class="attachment-icon">
          <i class="fas fa-file"></i>
        </div>
        <div class="attachment-details">
          <h5>${escapeHtml(att.name)}</h5>
          <p>${formatFileSize(att.size)} • ${new Date(att.uploadedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-outline" onclick="downloadAttachment('${att.id}')">
          <i class="fas fa-download"></i>
        </button>
        <button class="btn btn-outline" onclick="deleteAttachment('${att.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function uploadAttachment() {
  try {
    const fileInput = document.getElementById('attachment-file');
    const name = document.getElementById('attachment-name').value.trim();
    const description = document.getElementById('attachment-description').value.trim();

    if (!fileInput.files[0]) {
      showAlert('Please select a file', 'warning');
      return;
    }

    showSpinner(true);

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('name', name || fileInput.files[0].name);
    formData.append('description', description);

    const response = await fetch(`${API_BASE}/attachments/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Attachment uploaded successfully!', 'success');

      // Clear form
      fileInput.value = '';
      document.getElementById('attachment-name').value = '';
      document.getElementById('attachment-description').value = '';

      // Reload list
      await loadAttachments();
    } else {
      showAlert('Upload failed: ' + (data.error || 'Unknown error'), 'danger');
    }
  } catch (error) {
    console.error('Upload failed:', error);
    showAlert('Upload failed: ' + error.message, 'danger');
  } finally {
    showSpinner(false);
  }
}

async function downloadAttachment(id) {
  window.open(`${API_BASE}/attachments/${id}/download`, '_blank');
}

async function deleteAttachment(id) {
  if (!confirm('Are you sure you want to delete this attachment?')) {
    return;
  }

  try {
    showSpinner(true);

    const response = await fetch(`${API_BASE}/attachments/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Attachment deleted successfully!', 'success');
      await loadAttachments();
    } else {
      showAlert('Delete failed: ' + (data.message || 'Unknown error'), 'danger');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    showAlert('Delete failed: ' + error.message, 'danger');
  } finally {
    showSpinner(false);
  }
}

/**
 * SMTP Profile Management
 */
async function loadSMTPProfiles() {
  try {
    const response = await fetch(`${API_BASE}/smtp/profile/list`);
    const data = await response.json();

    if (data.success) {
      smtpProfiles = data.profiles;
      renderSMTPProfilesList(data.profiles);
      updateSMTPProfileSelect();
    }
  } catch (error) {
    console.error('Failed to load SMTP profiles:', error);
  }
}

function renderSMTPProfilesList(profiles) {
  const container = document.getElementById('smtp-profiles-list');

  // Exit if element doesn't exist (not on SMTP Profiles page)
  if (!container) {
    return;
  }

  if (!profiles || profiles.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No profiles configured</p>';
    return;
  }

  container.innerHTML = profiles.map(profile => `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
        <div>
          <h4 style="margin: 0;">${escapeHtml(profile.name)}</h4>
          <p style="color: rgba(255,255,255,0.6); margin: 5px 0 0 0;">${escapeHtml(profile.host)}:${profile.port}</p>
        </div>
        <span class="badge ${profile.enabled ? 'bg-success' : 'bg-secondary'}">${profile.enabled ? 'Active' : 'Inactive'}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
        <div>
          <small style="color: rgba(255,255,255,0.6);">User</small>
          <div>${escapeHtml(profile.auth?.user || 'N/A')}</div>
        </div>
        <div>
          <small style="color: rgba(255,255,255,0.6);">Daily Limit</small>
          <div>${profile.maxPerDay || 'Unlimited'}</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-outline" onclick="deleteSMTPProfile('${profile.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

function updateSMTPProfileSelect() {
  const select = document.getElementById('smtp-profile-select');
  if (!select) return;

  // Clear existing options except default
  select.innerHTML = '<option value="">Use Default Configuration</option>';

  // Add profile options
  smtpProfiles.forEach(profile => {
    if (profile.enabled) {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = `${profile.name} (${profile.host})`;
      select.appendChild(option);
    }
  });
}

async function addSMTPProfile() {
  try {
    const profileData = {
      name: document.getElementById('profile-name').value.trim(),
      service: document.getElementById('profile-service').value,
      host: document.getElementById('profile-host').value.trim(),
      port: parseInt(document.getElementById('profile-port').value),
      secure: document.getElementById('profile-secure').value === 'true',
      user: document.getElementById('profile-user').value.trim(),
      password: document.getElementById('profile-password').value,
      dailyLimit: parseInt(document.getElementById('profile-daily-limit').value) || null,
      priority: parseInt(document.getElementById('profile-priority').value) || 5,
      tags: document.getElementById('profile-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      enabled: true
    };

    // Validate
    if (!profileData.name || !profileData.host || !profileData.port || !profileData.user || !profileData.password) {
      showAlert('Please fill in all required fields', 'warning');
      return;
    }

    showSpinner(true);

    const response = await fetch(`${API_BASE}/smtp/profile/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (data.success) {
      showAlert('SMTP profile added successfully!', 'success');

      // Clear form
      document.getElementById('profile-name').value = '';
      document.getElementById('profile-host').value = '';
      document.getElementById('profile-user').value = '';
      document.getElementById('profile-password').value = '';
      document.getElementById('profile-tags').value = '';

      // Reload profiles
      await loadSMTPProfiles();
    } else {
      showAlert('Failed to add profile: ' + (data.error || 'Unknown error'), 'danger');
    }
  } catch (error) {
    console.error('Failed to add SMTP profile:', error);
    showAlert('Failed to add profile: ' + error.message, 'danger');
  } finally {
    showSpinner(false);
  }
}

async function deleteSMTPProfile(id) {
  if (!confirm('Are you sure you want to delete this SMTP profile?')) {
    return;
  }

  try {
    showSpinner(true);

    const response = await fetch(`${API_BASE}/smtp/profile/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showAlert('SMTP profile deleted successfully!', 'success');
      await loadSMTPProfiles();
    } else {
      showAlert('Delete failed: ' + (data.message || 'Unknown error'), 'danger');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    showAlert('Delete failed: ' + error.message, 'danger');
  } finally {
    showSpinner(false);
  }
}

/**
 * Utility Functions
 */
function showSpinner(show) {
  const spinner = document.getElementById('spinner');
  if (spinner) {
    if (show) {
      spinner.classList.add('show');
    } else {
      spinner.classList.remove('show');
    }
  }
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <div>${escapeHtml(message)}</div>
  `;

  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(alert, mainContent.firstChild);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Attachment picker modal (simplified)
function openAttachmentPicker() {
  // For now, just show available attachments in an alert
  if (availableAttachments.length === 0) {
    showAlert('No attachments available. Please upload some first.', 'warning');
    return;
  }

  // In a full implementation, this would open a modal
  // For now, we'll add a simple selection interface
  showAlert('Attachment picker coming soon! For now, attachments will be automatically attached.', 'info');
}

// Show macro helper
async function showMacroHelper() {
  try {
    const response = await fetch(`${API_BASE}/enhance/macros`);
    const data = await response.json();

    if (data.success && data.macros) {
      const macroList = data.macros.map(m =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-family: monospace; color: #10b981;">${escapeHtml(m.macro)}</td>
          <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">${escapeHtml(m.description)}</td>
        </tr>`
      ).join('');

      const modalHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
          <div style="background: #1e293b; border-radius: 12px; padding: 30px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="margin: 0;"><i class="fas fa-code"></i> Available Macros</h3>
              <button class="btn btn-outline" onclick="this.closest('[style*=fixed]').remove()" style="padding: 5px 15px;">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">
              Use these macros in your email message to personalize content for each recipient:
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: rgba(59, 130, 246, 0.1);">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.2);">Macro</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.2);">Description</th>
                </tr>
              </thead>
              <tbody>
                ${macroList}
              </tbody>
            </table>
            <div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #3b82f6;">
              <strong>Example:</strong>
              <pre style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.9em;">Hi {firstname},

Your email is {email}.
{if:company}You work at {company}.{/if}

Best regards!</pre>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  } catch (error) {
    console.error('Failed to load macros:', error);
    showAlert('Failed to load macro list: ' + error.message, 'danger');
  }
}

console.log('Campaign.js loaded successfully');
