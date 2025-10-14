// Enhanced UI JavaScript - SE Gateway Enhanced Edition
// API Base URL
const API_BASE = 'http://localhost:9090/api/enhanced';

// Global state
let smtpProfiles = [];
let currentSection = 'dashboard';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeButtons();
    loadDashboardStats();
    loadSMTPProfiles();
    initializeDarkMode();
});

// Sidebar Navigation
function initializeSidebar() {
    const sidebarItems = document.querySelectorAll('.nav-link[data-section]');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.getAttribute('data-section');
            showSection(sectionName);

            // Update active state
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Button Navigation (for "Get Started" buttons)
function initializeButtons() {
    const buttons = document.querySelectorAll('button[data-section]');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.getAttribute('data-section');
            showSection(sectionName);

            // Update sidebar active state
            const sidebarItems = document.querySelectorAll('.nav-link[data-section]');
            sidebarItems.forEach(i => i.classList.remove('active'));
            const targetNavItem = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
            if (targetNavItem) {
                targetNavItem.classList.add('active');
            }
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;

        // Load section-specific data
        if (sectionName === 'smtp-profiles') {
            loadSMTPProfiles();
        } else if (sectionName === 'analytics') {
            loadAnalytics();
        }
    }
}

// Dark Mode Toggle
function initializeDarkMode() {
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'light') {
        document.body.classList.add('light-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}

// Dashboard Functions
async function loadDashboardStats() {
    try {
        // Load SMTP profiles count
        const profiles = await fetchAPI('/smtp/profile/list');
        if (profiles.success) {
            document.querySelector('.stat-card:nth-child(1) .stat-card-value').textContent = profiles.profiles.length;
        }

        // Simulated stats for now - these would come from your backend
        updateStatCard(2, Math.floor(Math.random() * 1000));
        updateStatCard(3, (Math.random() * 100).toFixed(1) + '%');
        updateStatCard(4, Math.floor(Math.random() * 50));
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

function updateStatCard(index, value) {
    const card = document.querySelector(`.stat-card:nth-child(${index}) .stat-card-value`);
    if (card) {
        card.textContent = value;
    }
}

// QR Code Generator
async function generateQRCode() {
    const data = document.getElementById('qr-data').value;
    const format = document.getElementById('qr-format').value;
    const resultDiv = document.getElementById('qr-result');

    if (!data) {
        showAlert('Please enter data for QR code', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/convert/qrcode', {
            method: 'POST',
            body: JSON.stringify({ data, format, width: 300 })
        });

        if (response.success) {
            resultDiv.innerHTML = `<img src="${response.dataUrl}" alt="QR Code" class="img-fluid" />`;
            resultDiv.classList.add('show');
            showAlert('QR Code generated successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate QR code: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// HTML Converter
async function convertToHTML() {
    const text = document.getElementById('html-text').value;
    const style = document.getElementById('html-style').value;
    const resultDiv = document.getElementById('html-result');

    if (!text) {
        showAlert('Please enter text to convert', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/convert/html', {
            method: 'POST',
            body: JSON.stringify({ text, options: { styling: style } })
        });

        if (response.success) {
            resultDiv.innerHTML = `<pre>${escapeHtml(response.html)}</pre>`;
            resultDiv.classList.add('show');
            showAlert('HTML generated successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate HTML: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// PDF Generator
async function generatePDF() {
    const text = document.getElementById('pdf-text').value;
    const title = document.getElementById('pdf-title').value;
    const resultDiv = document.getElementById('pdf-result');

    if (!text) {
        showAlert('Please enter text to convert', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/convert/pdf', {
            method: 'POST',
            body: JSON.stringify({ content: text, options: { title } })
        });

        if (response.success) {
            // Create download link
            const link = document.createElement('a');
            link.href = response.dataUrl;
            link.download = title ? `${title}.pdf` : 'document.pdf';
            link.textContent = 'Download PDF';
            link.className = 'btn btn-success';

            resultDiv.innerHTML = '';
            resultDiv.appendChild(link);
            resultDiv.classList.add('show');
            showAlert('PDF generated successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate PDF: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Link Protection
async function protectLink() {
    const url = document.getElementById('link-url').value;
    const level = document.getElementById('link-level').value;
    const resultDiv = document.getElementById('link-result');

    if (!url) {
        showAlert('Please enter a URL to protect', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/link/obfuscate', {
            method: 'POST',
            body: JSON.stringify({ url, level })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="mb-3">
                    <label>Original URL:</label>
                    <pre>${escapeHtml(response.original)}</pre>
                </div>
                <div class="mb-3">
                    <label>Protected URL:</label>
                    <pre>${escapeHtml(response.obfuscated)}</pre>
                </div>
                <div class="mb-3">
                    <label>Protection Steps Applied:</label>
                    <pre>${response.steps.join('\n')}</pre>
                </div>
                <button class="btn btn-primary" onclick="copyToClipboard('${escapeHtml(response.obfuscated)}')">
                    <i class="fas fa-copy"></i> Copy Protected URL
                </button>
            `;
            resultDiv.classList.add('show');
            showAlert('Link protected successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to protect link: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Content Protection (Batch)
async function protectContent() {
    const content = document.getElementById('content-text').value;
    const level = document.getElementById('content-level').value;
    const resultDiv = document.getElementById('content-result');

    if (!content) {
        showAlert('Please enter content to protect', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/link/protect-content', {
            method: 'POST',
            body: JSON.stringify({ content, options: { level } })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="mb-3">
                    <label>Protected Content:</label>
                    <pre>${escapeHtml(response.content)}</pre>
                </div>
                <div class="mb-3">
                    <label>Links Replaced: ${response.count}</label>
                </div>
                <button class="btn btn-primary" onclick="copyToClipboard(\`${escapeHtml(response.content)}\`)">
                    <i class="fas fa-copy"></i> Copy Protected Content
                </button>
            `;
            resultDiv.classList.add('show');
            showAlert(`${response.count} links protected successfully!`, 'success');
        }
    } catch (error) {
        showAlert('Failed to protect content: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Tracking Pixel
async function generateTrackingPixel() {
    const trackingId = document.getElementById('tracking-id').value || 'default';
    const resultDiv = document.getElementById('tracking-result');

    showSpinner(true);

    try {
        const response = await fetchAPI('/link/tracking-pixel', {
            method: 'POST',
            body: JSON.stringify({ trackingId })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="mb-3">
                    <label>Tracking Pixel HTML:</label>
                    <pre>${escapeHtml(response.html)}</pre>
                </div>
                <button class="btn btn-primary" onclick="copyToClipboard('${escapeHtml(response.html)}')">
                    <i class="fas fa-copy"></i> Copy HTML
                </button>
            `;
            resultDiv.classList.add('show');
            showAlert('Tracking pixel generated!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate tracking pixel: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Redirect Page
async function createRedirectPage() {
    const targetUrl = document.getElementById('redirect-url').value;
    const delay = document.getElementById('redirect-delay').value || 0;
    const resultDiv = document.getElementById('redirect-result');

    if (!targetUrl) {
        showAlert('Please enter target URL', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/link/redirect-page', {
            method: 'POST',
            body: JSON.stringify({ targetUrl, delay: parseInt(delay) })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="mb-3">
                    <label>Redirect Page HTML:</label>
                    <pre>${escapeHtml(response.html.substring(0, 500))}...</pre>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary" onclick="downloadFile('redirect.html', \`${escapeHtml(response.html)}\`)">
                        <i class="fas fa-download"></i> Download HTML
                    </button>
                    <button class="btn btn-outline" onclick="copyToClipboard(\`${escapeHtml(response.html)}\`)">
                        <i class="fas fa-copy"></i> Copy HTML
                    </button>
                </div>
            `;
            resultDiv.classList.add('show');
            showAlert('Redirect page generated!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate redirect page: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// SMTP Profile Management
async function loadSMTPProfiles() {
    showSpinner(true);

    try {
        const response = await fetchAPI('/smtp/profile/list');

        if (response.success) {
            smtpProfiles = response.profiles;
            renderSMTPProfiles(response.profiles);
        }
    } catch (error) {
        showAlert('Failed to load SMTP profiles: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

function renderSMTPProfiles(profiles) {
    const container = document.getElementById('smtp-profiles-list');

    if (!profiles || profiles.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No SMTP profiles configured. Add your first profile!</p>';
        return;
    }

    container.innerHTML = profiles.map(profile => `
        <div class="smtp-profile-card" data-id="${profile.id}">
            <div class="smtp-profile-header">
                <div class="smtp-profile-name">${escapeHtml(profile.name)}</div>
                <span class="smtp-profile-status ${profile.enabled ? 'active' : 'inactive'}">
                    ${profile.enabled ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="smtp-profile-details">
                <div class="smtp-profile-detail">
                    <div class="smtp-profile-detail-label">Host</div>
                    <div class="smtp-profile-detail-value">${escapeHtml(profile.host)}</div>
                </div>
                <div class="smtp-profile-detail">
                    <div class="smtp-profile-detail-label">Port</div>
                    <div class="smtp-profile-detail-value">${profile.port}</div>
                </div>
                <div class="smtp-profile-detail">
                    <div class="smtp-profile-detail-label">User</div>
                    <div class="smtp-profile-detail-value">${escapeHtml(profile.user)}</div>
                </div>
                <div class="smtp-profile-detail">
                    <div class="smtp-profile-detail-label">Priority</div>
                    <div class="smtp-profile-detail-value">${profile.priority || 'Normal'}</div>
                </div>
                <div class="smtp-profile-detail">
                    <div class="smtp-profile-detail-label">Today's Sent</div>
                    <div class="smtp-profile-detail-value">${profile.stats?.dailySent || 0} / ${profile.dailyLimit || 'Unlimited'}</div>
                </div>
                <div class="smtp-profile-detail">
                    <div class="smtp-profile-detail-label">Success Rate</div>
                    <div class="smtp-profile-detail-value">${profile.stats?.successRate || 0}%</div>
                </div>
            </div>
            <div class="smtp-profile-actions">
                <button class="btn-test" onclick="testSMTPProfile('${profile.id}')">
                    <i class="fas fa-flask"></i> Test
                </button>
                <button class="btn-edit" onclick="editSMTPProfile('${profile.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteSMTPProfile('${profile.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function addSMTPProfile() {
    const profileData = {
        name: document.getElementById('smtp-name').value,
        host: document.getElementById('smtp-host').value,
        port: parseInt(document.getElementById('smtp-port').value),
        secure: document.getElementById('smtp-secure').checked,
        user: document.getElementById('smtp-user').value,
        password: document.getElementById('smtp-password').value,
        priority: document.getElementById('smtp-priority').value,
        dailyLimit: parseInt(document.getElementById('smtp-daily-limit').value) || null,
        enabled: true
    };

    // Validation
    if (!profileData.name || !profileData.host || !profileData.port || !profileData.user || !profileData.password) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/smtp/profile/add', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });

        if (response.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSMTPModal'));
            modal.hide();

            // Clear form
            document.getElementById('smtpForm').reset();

            // Reload profiles
            await loadSMTPProfiles();

            showAlert('SMTP profile added successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to add SMTP profile: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

async function testSMTPProfile(profileId) {
    showSpinner(true);

    try {
        const response = await fetchAPI(`/smtp/profile/${profileId}/test`, {
            method: 'POST'
        });

        if (response.success) {
            showAlert('SMTP profile test successful!', 'success');
        } else {
            showAlert('SMTP profile test failed: ' + response.message, 'danger');
        }
    } catch (error) {
        showAlert('Failed to test SMTP profile: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

async function deleteSMTPProfile(profileId) {
    if (!confirm('Are you sure you want to delete this SMTP profile?')) {
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI(`/smtp/profile/${profileId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            await loadSMTPProfiles();
            showAlert('SMTP profile deleted successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to delete SMTP profile: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Email Security Functions
async function generateDKIM() {
    const domain = document.getElementById('dkim-domain').value;
    const selector = document.getElementById('dkim-selector').value || 'default';
    const resultDiv = document.getElementById('dkim-result');

    if (!domain) {
        showAlert('Please enter domain name', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/security/dkim/generate', {
            method: 'POST',
            body: JSON.stringify({ domain, selector })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>DKIM Keys Generated!</strong><br>
                        Add the DNS record below to your domain's DNS settings.
                    </div>
                </div>
                <div class="mb-3">
                    <label>DNS Record:</label>
                    <pre>${escapeHtml(response.dnsRecord)}</pre>
                </div>
                <div class="mb-3">
                    <label>Private Key (Keep Secret!):</label>
                    <pre>${escapeHtml(response.privateKey.substring(0, 100))}...</pre>
                </div>
                <button class="btn btn-primary" onclick="downloadFile('dkim_private.key', \`${response.privateKey}\`)">
                    <i class="fas fa-download"></i> Download Private Key
                </button>
            `;
            resultDiv.classList.add('show');
            showAlert('DKIM keys generated successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate DKIM: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

async function generateSPF() {
    const domain = document.getElementById('spf-domain').value;
    const resultDiv = document.getElementById('spf-result');

    if (!domain) {
        showAlert('Please enter domain name', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/security/spf/generate', {
            method: 'POST',
            body: JSON.stringify({ domain })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>SPF Record Generated!</strong><br>
                        Add this TXT record to your domain's DNS settings.
                    </div>
                </div>
                <div class="mb-3">
                    <label>SPF Record:</label>
                    <pre>${escapeHtml(response.spfRecord)}</pre>
                </div>
                <button class="btn btn-primary" onclick="copyToClipboard('${escapeHtml(response.spfRecord)}')">
                    <i class="fas fa-copy"></i> Copy SPF Record
                </button>
            `;
            resultDiv.classList.add('show');
            showAlert('SPF record generated successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate SPF: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

async function generateDMARC() {
    const domain = document.getElementById('dmarc-domain').value;
    const email = document.getElementById('dmarc-email').value;
    const policy = document.getElementById('dmarc-policy').value;
    const resultDiv = document.getElementById('dmarc-result');

    if (!domain || !email) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/security/dmarc/generate', {
            method: 'POST',
            body: JSON.stringify({ domain, reportEmail: email, policy })
        });

        if (response.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>DMARC Record Generated!</strong><br>
                        Add this TXT record to your domain's DNS settings.
                    </div>
                </div>
                <div class="mb-3">
                    <label>DMARC Record:</label>
                    <pre>${escapeHtml(response.dmarcRecord)}</pre>
                </div>
                <button class="btn btn-primary" onclick="copyToClipboard('${escapeHtml(response.dmarcRecord)}')">
                    <i class="fas fa-copy"></i> Copy DMARC Record
                </button>
            `;
            resultDiv.classList.add('show');
            showAlert('DMARC record generated successfully!', 'success');
        }
    } catch (error) {
        showAlert('Failed to generate DMARC: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

async function verifyDomain() {
    const domain = document.getElementById('verify-domain').value;
    const resultDiv = document.getElementById('verify-result');

    if (!domain) {
        showAlert('Please enter domain name', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/security/verify-domain', {
            method: 'POST',
            body: JSON.stringify({ domain })
        });

        if (response.success) {
            const checks = response.checks;
            resultDiv.innerHTML = `
                <div class="mb-3">
                    <h5>Security Score: ${response.securityScore}/100 (${response.grade})</h5>
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Check</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>MX Records</td>
                                <td><span class="badge ${checks.hasMX ? 'badge-success' : 'badge-danger'}">${checks.hasMX ? 'Pass' : 'Fail'}</span></td>
                                <td>${checks.mxRecords?.length || 0} records found</td>
                            </tr>
                            <tr>
                                <td>SPF Record</td>
                                <td><span class="badge ${checks.hasSPF ? 'badge-success' : 'badge-danger'}">${checks.hasSPF ? 'Pass' : 'Fail'}</span></td>
                                <td>${checks.spfRecord || 'Not found'}</td>
                            </tr>
                            <tr>
                                <td>DMARC Record</td>
                                <td><span class="badge ${checks.hasDMARC ? 'badge-success' : 'badge-danger'}">${checks.hasDMARC ? 'Pass' : 'Fail'}</span></td>
                                <td>${checks.dmarcRecord || 'Not found'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            resultDiv.classList.add('show');
            showAlert('Domain verification complete!', 'success');
        }
    } catch (error) {
        showAlert('Failed to verify domain: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

async function analyzeSpam() {
    const content = document.getElementById('spam-content').value;
    const subject = document.getElementById('spam-subject').value;
    const from = document.getElementById('spam-from').value;
    const resultDiv = document.getElementById('spam-result');

    if (!content || !subject) {
        showAlert('Please fill in content and subject', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/security/spam-check', {
            method: 'POST',
            body: JSON.stringify({
                emailContent: { subject, body: content },
                headers: { from }
            })
        });

        if (response.success) {
            const levelColors = {
                low: 'success',
                medium: 'warning',
                high: 'danger'
            };

            resultDiv.innerHTML = `
                <div class="mb-3">
                    <h5>Spam Score: ${response.score}/100</h5>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${response.score}%"></div>
                    </div>
                </div>
                <div class="alert alert-${levelColors[response.level]}">
                    <strong>Risk Level: ${response.level.toUpperCase()}</strong><br>
                    ${response.recommendation}
                </div>
                ${response.risks.length > 0 ? `
                    <div class="mb-3">
                        <label>Issues Found:</label>
                        <ul>
                            ${response.risks.map(risk => `<li>${escapeHtml(risk)}</li>`).join('')}
                        </ul>
                    </div>
                ` : '<p class="text-success">No spam triggers detected!</p>'}
            `;
            resultDiv.classList.add('show');
            showAlert('Spam analysis complete!', 'success');
        }
    } catch (error) {
        showAlert('Failed to analyze spam: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Enhanced Send Function
async function sendEnhanced() {
    const sendData = {
        recipients: document.getElementById('send-to').value.split(',').map(e => e.trim()),
        subject: document.getElementById('send-subject').value,
        body: document.getElementById('send-body').value,
        from: document.getElementById('send-from').value,
        priority: document.getElementById('send-priority').value,
        delay: parseInt(document.getElementById('send-delay').value) || 0,
        protectLinks: document.getElementById('send-protect-links').checked,
        linkProtectionLevel: document.getElementById('send-link-level').value,
        tracking: document.getElementById('send-tracking').checked,
        profileId: document.getElementById('send-profile').value || null
    };

    // Validation
    if (!sendData.recipients.length || !sendData.subject || !sendData.body) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    showSpinner(true);

    try {
        const response = await fetchAPI('/send/enhanced', {
            method: 'POST',
            body: JSON.stringify(sendData)
        });

        if (response.success) {
            showAlert(`Email sent successfully to ${response.sent} recipient(s)!`, 'success');

            // Show results
            const resultDiv = document.getElementById('send-result');
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Email Sent Successfully!</strong><br>
                        Sent to ${response.sent} out of ${sendData.recipients.length} recipients
                    </div>
                </div>
                ${response.failed > 0 ? `
                    <div class="alert alert-warning">
                        <strong>${response.failed} email(s) failed</strong>
                    </div>
                ` : ''}
            `;
            resultDiv.classList.add('show');
        }
    } catch (error) {
        showAlert('Failed to send email: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Analytics Functions
async function loadAnalytics() {
    showSpinner(true);

    try {
        const response = await fetchAPI('/smtp/stats');

        if (response.success) {
            renderAnalytics(response.stats);
        }
    } catch (error) {
        showAlert('Failed to load analytics: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

function renderAnalytics(stats) {
    const container = document.getElementById('analytics-content');

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <h4>Total Sent</h4>
                    <i class="fas fa-paper-plane"></i>
                </div>
                <div class="stat-card-value">${stats.totalSent || 0}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-card-header">
                    <h4>Successful</h4>
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-card-value">${stats.successful || 0}</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-card-header">
                    <h4>Failed</h4>
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-card-value">${stats.failed || 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <h4>Success Rate</h4>
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-card-value">${stats.successRate || 0}%</div>
            </div>
        </div>
    `;
}

async function loadDomainStats() {
    showSpinner(true);

    try {
        const response = await fetchAPI('/smtp/domain-stats');

        if (response.success) {
            const container = document.getElementById('domain-stats-table');

            if (response.stats && Object.keys(response.stats).length > 0) {
                let tableHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th>Sent</th>
                                <th>Success Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                Object.entries(response.stats).forEach(([domain, data]) => {
                    tableHTML += `
                        <tr>
                            <td>${escapeHtml(domain)}</td>
                            <td>${data.sent}</td>
                            <td><span class="badge badge-${data.successRate > 80 ? 'success' : 'warning'}">${data.successRate}%</span></td>
                        </tr>
                    `;
                });

                tableHTML += `
                        </tbody>
                    </table>
                `;

                container.innerHTML = tableHTML;
            } else {
                container.innerHTML = '<p class="text-muted text-center">No domain statistics available yet.</p>';
            }
        }
    } catch (error) {
        showAlert('Failed to load domain stats: ' + error.message, 'danger');
    } finally {
        showSpinner(false);
    }
}

// Utility Functions
async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(API_BASE + endpoint, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <div>${escapeHtml(message)}</div>
    `;

    const container = document.querySelector('.main-content');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showSpinner(show) {
    const spinner = document.getElementById('spinner');
    if (show) {
        spinner.classList.add('show');
    } else {
        spinner.classList.remove('show');
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(err => {
        showAlert('Failed to copy to clipboard', 'danger');
    });
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('File downloaded!', 'success');
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Auto-refresh dashboard stats every 30 seconds
setInterval(() => {
    if (currentSection === 'dashboard') {
        loadDashboardStats();
    }
}, 30000);
