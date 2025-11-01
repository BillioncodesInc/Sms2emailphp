<?php
// Define carriers array for SMS campaigns
$carriers = array('uscellular','sprint','cellone','cellularone','gci','flat','telebeeper','rtsc','telus','telstra','allaumobile','smspup','smscentral','smsglobal','smsbroadcast','esendex','utbox','alaskacommunications','rogers','cricket','nex-tech','tmobile','att','westernwireless','freedommobile','verizon','republic','bluskyfrog','loopmobile','clearlydigital','comcast','corrwireless','cellularsouth','centennialwireless','carolinawestwireless','southwesternbell','fido','ideacellular','indianapaging','illinoisvalleycellular','alltel','centurytel','dobson','surewestcommunications','mobilcomm','clearnet','koodomobile','metrocall2way','boostmobile','onlinebeep','metrocall','mci','ameritechpaging','pcsone','metropcs','cspire','qwest','satellink','threeriverwireless','bluegrasscellular','edgewireless','goldentelecom','publicservicecellular','westcentralwireless','houstoncellular','mts','suncom','bellmobilitycanada','northerntelmobility','uswest','unicel','virginmobilecanada','virginmobile','airtelchennai','kolkataairtel','delhiairtel','tsrwireless','swisscom','mumbaibplmobile','vodafonejapan','gujaratcelforce','movistar','delhihutch','digitextjamacian','jsmtelepage','escotel','sunrisecommunications','teliadenmark','itelcel','mobileone','m1bermuda','o2mmail','telenor','mobistarbelgium','mobtelsrbija','telefonicamovistar','nextelmexico','globalstar','iridiumsatellitecommunications','oskar','meteor','smarttelecom','sunrisemobile','o2','oneconnectaustria','optusmobile','mobilfone','southernlinc','teletouch','vessotel','ntelos','rek2','chennairpgcellular','safaricom','satelindogsm','scs900','sfrfrance','mobiteltanzania','comviq','emt','geldentelecom','pandtluxembourg','netcom','primtel','tmobileaustria','tele2lativa','umc','uraltel','vodafoneitaly','lmt','tmobilegermany','dttmobile','tmobileuk','simplefreedom','tim','vodafone','wyndtell','projectfi');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
  <meta name="referrer" content="never">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>SE Gateway - Unified Campaign Manager</title>

  <!-- CSS Libraries -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/enhanced.css">

  <style>
    :root {
      --primary-color: #667eea;
      --secondary-color: #764ba2;
      --success-color: #10b981;
      --danger-color: #ef4444;
      --warning-color: #f59e0b;
      --dark-bg: #1a1a2e;
      --card-bg: #16213e;
      --text-light: #e4e4e7;
    }

    body {
      background: linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 100%);
      min-height: 100vh;
      color: var(--text-light);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Sidebar Styles */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 260px;
      background: var(--card-bg);
      padding: 20px;
      overflow-y: auto;
      border-right: 1px solid rgba(255,255,255,0.1);
      z-index: 1000;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 20px;
    }

    .sidebar-header h4 {
      margin: 0;
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .sidebar-nav {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav li {
      margin-bottom: 5px;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      color: var(--text-light);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
      font-size: 0.95rem;
    }

    .sidebar-nav a:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateX(5px);
    }

    .sidebar-nav a.active {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
    }

    .sidebar-nav a i {
      margin-right: 12px;
      width: 20px;
      text-align: center;
    }

    /* Main Content */
    .main-content {
      margin-left: 260px;
      padding: 30px;
      min-height: 100vh;
      max-width: 1400px;
      width: 100%;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 30px;
    }

    .page-header h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .page-header .subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 1rem;
    }

    /* Campaign Wizard */
    .campaign-wizard {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .wizard-steps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      position: relative;
    }

    .wizard-steps::before {
      content: '';
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(255,255,255,0.1);
      z-index: 0;
    }

    .wizard-step {
      flex: 1;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .step-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      transition: all 0.3s;
      font-weight: 600;
    }

    .wizard-step.active .step-circle {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      transform: scale(1.1);
    }

    .wizard-step.completed .step-circle {
      background: var(--success-color);
    }

    .step-label {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.6);
    }

    .wizard-step.active .step-label {
      color: var(--text-light);
      font-weight: 600;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-light);
    }

    .form-control, .form-select, textarea {
      width: 100%;
      padding: 12px 15px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: var(--text-light);
      transition: all 0.3s;
    }

    .form-control:focus, .form-select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      background: rgba(255,255,255,0.08);
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-success {
      background: var(--success-color);
      color: white;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
    }

    .btn-outline:hover {
      background: var(--primary-color);
      color: white;
    }

    /* Cards */
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .card-header {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: rgba(255,255,255,0.05);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .stat-card h3 {
      font-size: 2rem;
      margin: 10px 0;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-card p {
      margin: 0;
      color: rgba(255,255,255,0.6);
    }

    /* Progress Tracking */
    .progress-section {
      background: rgba(255,255,255,0.05);
      padding: 20px;
      border-radius: 12px;
      margin-top: 20px;
    }

    .progress-bar-container {
      height: 30px;
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 15px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--success-color), var(--primary-color));
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }

    /* Attachment List */
    .attachment-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      margin-bottom: 10px;
      transition: all 0.3s;
    }

    .attachment-item:hover {
      background: rgba(255,255,255,0.08);
      transform: translateX(5px);
    }

    .attachment-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .attachment-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .attachment-details h5 {
      margin: 0;
      font-size: 0.95rem;
    }

    .attachment-details p {
      margin: 0;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.6);
    }

    /* Alerts */
    .alert {
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid var(--success-color);
      color: var(--success-color);
    }

    .alert-danger {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--danger-color);
      color: var(--danger-color);
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid var(--warning-color);
      color: var(--warning-color);
    }

    /* Collapse Section */
    .collapse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: all 0.3s;
    }

    .collapse-header:hover {
      background: rgba(255,255,255,0.08);
    }

    .collapse-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .collapse-content.open {
      max-height: 2000px;
    }

    /* Hidden Content */
    .content-section {
      display: none;
    }

    .content-section.active {
      display: block;
    }

    /* Campaign Creation Steps */
    .campaign-step {
      text-align: center;
      opacity: 0.5;
      transition: opacity 0.3s;
    }

    .campaign-step.active,
    .campaign-step.completed {
      opacity: 1;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 8px;
      font-weight: 600;
      border: 2px solid rgba(255,255,255,0.2);
    }

    .campaign-step.active .step-number {
      background: var(--primary-color);
      border-color: var(--primary-color);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    }

    .campaign-step.completed .step-number {
      background: var(--success-color);
      border-color: var(--success-color);
    }

    .step-label {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.6);
    }

    .campaign-step.active .step-label {
      color: var(--text-light);
      font-weight: 600;
    }

    .step-connector {
      width: 60px;
      height: 2px;
      background: rgba(255,255,255,0.2);
      margin-top: 20px;
    }

    .campaign-form-step {
      display: none;
    }

    .campaign-form-step.active {
      display: block;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Menu Button */
    .mobile-menu-btn {
      display: none;
      position: fixed;
      top: 15px;
      left: 15px;
      z-index: 1001;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      width: 45px;
      height: 45px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }

    .mobile-menu-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .mobile-menu-btn i {
      color: white;
      font-size: 20px;
    }

    /* Mobile Overlay */
    .mobile-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    .mobile-overlay.active {
      display: block;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: block;
      }

      .sidebar {
        position: fixed;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
        padding-top: 70px;
        padding: 70px 15px 20px 15px;
      }

      .wizard-steps {
        flex-direction: column;
      }

      .wizard-steps::before {
        display: none;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      /* Cards */
      .card {
        margin-bottom: 15px;
      }

      .card-header {
        padding: 12px 15px;
        font-size: 14px;
      }

      /* Buttons */
      .btn, button {
        padding: 12px 16px;
        font-size: 14px;
        min-height: 44px; /* Touch-friendly */
      }

      .btn-group {
        flex-direction: column;
        gap: 10px;
      }

      .btn-group .btn {
        width: 100%;
      }

      /* Forms */
      .form-control, .form-select, textarea {
        font-size: 16px; /* Prevents zoom on iOS */
        padding: 12px;
        min-height: 44px;
      }

      .form-label {
        font-size: 14px;
        margin-bottom: 6px;
      }

      .row {
        margin: 0 -10px;
      }

      .col-md-6, .col-md-4, .col-md-3 {
        padding: 0 10px;
        margin-bottom: 15px;
      }

      /* Tables */
      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        font-size: 13px;
      }

      table th, table td {
        padding: 8px 6px;
        white-space: nowrap;
      }

      /* Page Header */
      .page-header h2 {
        font-size: 22px;
      }

      .page-header .subtitle {
        font-size: 13px;
      }

      /* Campaign Steps */
      .campaign-step {
        margin-bottom: 15px;
      }

      .step-connector {
        display: none;
      }

      /* Progress Indicators */
      .campaign-form-step {
        padding: 15px;
      }

      /* Modals */
      .modal-dialog {
        margin: 10px;
      }

      .modal-content {
        border-radius: 8px;
      }

      /* File Upload */
      .file-upload-area {
        padding: 20px;
        font-size: 14px;
      }

      /* Textarea */
      textarea {
        min-height: 120px;
      }

      /* Badge and tags */
      .badge {
        font-size: 11px;
        padding: 4px 8px;
      }

      /* Stat cards */
      .stat-value {
        font-size: 24px;
      }

      .stat-label {
        font-size: 12px;
      }

      /* Info notices */
      .info-notice {
        padding: 12px;
        font-size: 13px;
      }
    }

    /* Tablet Responsive (768px - 1024px) */
    @media (min-width: 769px) and (max-width: 1024px) {
      .main-content {
        padding: 30px 20px;
      }

      .sidebar {
        width: 220px;
      }

      .main-content {
        margin-left: 220px;
      }

      .card {
        margin-bottom: 20px;
      }

      /* Buttons remain touch-friendly */
      .btn, button {
        min-height: 42px;
        padding: 10px 18px;
      }

      /* Forms remain touch-friendly */
      .form-control, .form-select, textarea {
        font-size: 15px;
        min-height: 42px;
      }

      /* Tables */
      table {
        font-size: 14px;
      }

      /* Two column grid for medium screens */
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Small Mobile (320px - 480px) */
    @media (max-width: 480px) {
      .main-content {
        padding: 70px 10px 15px 10px;
      }

      .page-header h2 {
        font-size: 20px;
      }

      .card {
        border-radius: 8px;
      }

      /* Stack all columns */
      .col-md-6, .col-md-4, .col-md-3, .col-md-12 {
        width: 100%;
        padding: 0 5px;
      }

      /* Smaller buttons on very small screens */
      .btn, button {
        font-size: 13px;
        padding: 10px 12px;
      }

      /* Reduce modal padding */
      .modal-body {
        padding: 15px;
      }

      /* Campaign progress indicator */
      .campaign-step .step-number {
        width: 35px;
        height: 35px;
        font-size: 14px;
      }

      .campaign-step .step-label {
        font-size: 11px;
      }
    }

    /* Loading Spinner */
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .spinner-overlay.show {
      display: flex;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255,255,255,0.1);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>

  <script>
    // Auto-detect environment and set API base URL
    const API_BASE = window.location.hostname === 'localhost'
      ? 'http://localhost:9090/api/enhanced'
      : '/api/enhanced';

    // Legacy API base (for non-enhanced endpoints like /proxy, /text, etc.)
    // These are now also under /api on the backend
    const API_LEGACY = window.location.hostname === 'localhost'
      ? 'http://localhost:9090/api'
      : '/api';

    // Alias for backward compatibility with Inbox Searcher and Contact Extractor
    const API_BASE_URL = API_BASE;

    console.log('API Base URL:', API_BASE);
    console.log('API Legacy URL:', API_LEGACY);

    // Check proxy configuration status
    async function checkProxyStatus() {
      try {
        const response = await fetch(`${API_LEGACY}/proxy/config`);
        const data = await response.json();

        const hasProxies = data.success && data.proxies && data.proxies.length > 0;
        const proxyCount = hasProxies ? data.proxies.length : 0;
        const protocol = data.protocol || 'socks5';

        return {
          configured: hasProxies,
          count: proxyCount,
          protocol: protocol
        };
      } catch (error) {
        console.error('Error checking proxy status:', error);
        return { configured: false, count: 0, protocol: '' };
      }
    }

    // Check SMTP configuration status
    async function checkSmtpStatus() {
      try {
        const response = await fetch(`${API_LEGACY}/smtp/config`);
        const data = await response.json();

        const hasSmtp = data.success && data.configured;
        const count = hasSmtp ? data.count : 0;
        const type = data.type || null;
        const service = data.service || '';

        return {
          configured: hasSmtp,
          count: count,
          type: type,
          service: service
        };
      } catch (error) {
        console.error('Error checking SMTP status:', error);
        return { configured: false, count: 0, type: null, service: '' };
      }
    }

    // Update proxy status notices in UI
    async function updateProxyNotices() {
      const status = await checkProxyStatus();

      const sections = [
        { noticeId: 'comboProxyNotice', statusId: 'comboProxyStatus', name: 'SMTP Combo Validator' },
        { noticeId: 'inboxProxyNotice', statusId: 'inboxProxyStatus', name: 'Inbox Searcher' },
        { noticeId: 'contactProxyNotice', statusId: 'contactProxyStatus', name: 'Contact Extractor' }
      ];

      sections.forEach(section => {
        const noticeEl = document.getElementById(section.noticeId);
        const statusEl = document.getElementById(section.statusId);

        if (noticeEl && statusEl) {
          if (status.configured) {
            noticeEl.style.background = 'rgba(16, 185, 129, 0.1)';
            noticeEl.style.borderLeft = '4px solid #10b981';
            statusEl.innerHTML = `<i class="fas fa-check-circle"></i> ${status.count} proxies configured (${status.protocol.toUpperCase()}). You can enable proxy usage for IP protection.`;
          } else {
            noticeEl.style.background = 'rgba(239, 68, 68, 0.1)';
            noticeEl.style.borderLeft = '4px solid #ef4444';
            statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> No proxies configured. <a href="#" onclick="switchSection('proxies'); return false;" style="color: #667eea; text-decoration: underline;">Configure proxies</a> for IP protection.`;
          }
        }
      });
    }

    // Track active polling intervals
    let proxyConfigPollingInterval = null;

    // Start automatic polling for proxy config updates
    function startProxyConfigPolling() {
      // Clear any existing interval
      if (proxyConfigPollingInterval) {
        clearInterval(proxyConfigPollingInterval);
      }

      // Update immediately
      updateProxyNotices();

      // Poll every 10 seconds
      proxyConfigPollingInterval = setInterval(() => {
        updateProxyNotices();
      }, 10000);

      console.log('✅ Started proxy config polling (every 10s)');
    }

    // Stop proxy config polling
    function stopProxyConfigPolling() {
      if (proxyConfigPollingInterval) {
        clearInterval(proxyConfigPollingInterval);
        proxyConfigPollingInterval = null;
        console.log('⏹️ Stopped proxy config polling');
      }
    }

    // Update SMTP status notices in UI
    async function updateSmtpNotices() {
      const status = await checkSmtpStatus();

      const sections = [
        { noticeId: 'campaignSmtpNotice', statusId: 'campaignSmtpStatus', name: 'Campaign' },
        { noticeId: 'comboSmtpNotice', statusId: 'comboSmtpStatus', name: 'SMTP Combo Validator' }
      ];

      sections.forEach(section => {
        const noticeEl = document.getElementById(section.noticeId);
        const statusEl = document.getElementById(section.statusId);

        if (noticeEl && statusEl) {
          if (status.configured) {
            noticeEl.style.background = 'rgba(16, 185, 129, 0.1)';
            noticeEl.style.borderLeft = '4px solid #10b981';
            if (status.type === 'single') {
              statusEl.innerHTML = `<i class="fas fa-check-circle"></i> SMTP configured: ${status.service} (Single Mode, 1 account)`;
            } else if (status.type === 'bulk') {
              statusEl.innerHTML = `<i class="fas fa-check-circle"></i> SMTP configured: ${status.count} accounts (Bulk Mode)`;
            }
          } else {
            noticeEl.style.background = 'rgba(239, 68, 68, 0.1)';
            noticeEl.style.borderLeft = '4px solid #ef4444';
            statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> No SMTP configuration found. <a href="#" onclick="switchSection('smtp-profiles'); return false;" style="color: #667eea; text-decoration: underline;">Configure SMTP</a> to send emails.`;
          }
        }
      });
    }

    // Track SMTP polling interval
    let smtpConfigPollingInterval = null;

    // Start automatic polling for SMTP config updates
    function startSmtpConfigPolling() {
      // Clear any existing interval
      if (smtpConfigPollingInterval) {
        clearInterval(smtpConfigPollingInterval);
      }

      // Update immediately
      updateSmtpNotices();

      // Poll every 10 seconds
      smtpConfigPollingInterval = setInterval(() => {
        updateSmtpNotices();
      }, 10000);

      console.log('✅ Started SMTP config polling (every 10s)');
    }

    // Stop SMTP config polling
    function stopSmtpConfigPolling() {
      if (smtpConfigPollingInterval) {
        clearInterval(smtpConfigPollingInterval);
        smtpConfigPollingInterval = null;
        console.log('⏹️ Stopped SMTP config polling');
      }
    }
  </script>
</head>
<body>

  <!-- Mobile Menu Button -->
  <button class="mobile-menu-btn" id="mobileMenuBtn" onclick="toggleMobileMenu()">
    <i class="fas fa-bars"></i>
  </button>

  <!-- Mobile Overlay -->
  <div class="mobile-overlay" id="mobileOverlay" onclick="closeMobileMenu()"></div>

  <!-- Sidebar -->
  <div class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <h4><i class="fas fa-paper-plane"></i> SE Gateway</h4>
      <p style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin: 5px 0 0 0;">Campaign Manager</p>
    </div>

    <ul class="sidebar-nav">
      <li>
        <a href="#" class="nav-link active" data-section="dashboard" onclick="switchSection('dashboard')">
          <i class="fas fa-home"></i> Dashboard
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="campaigns" onclick="switchSection('campaigns')">
          <i class="fas fa-list-alt"></i> Campaigns
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="attachments" onclick="switchSection('attachments')">
          <i class="fas fa-paperclip"></i> Attachments
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="smtp-profiles" onclick="switchSection('smtp-profiles')">
          <i class="fas fa-server"></i> SMTP Profiles
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="inbox-searcher" onclick="switchSection('inbox-searcher')">
          <i class="fas fa-search"></i> Inbox Searcher
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="contact-extractor" onclick="switchSection('contact-extractor')">
          <i class="fas fa-address-book"></i> Contact Extractor
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="debounce" onclick="switchSection('debounce')">
          <i class="fas fa-filter"></i> Debounce
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="redirectors" onclick="switchSection('redirectors')">
          <i class="fas fa-random"></i> Redirectors
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="proxies" onclick="switchSection('proxies')">
          <i class="fas fa-globe"></i> Proxies
        </a>
      </li>
      <li>
        <a href="#" class="nav-link" data-section="settings" onclick="switchSection('settings')">
          <i class="fas fa-cog"></i> Settings
        </a>
      </li>
    </ul>
  </div>

  <!-- Main Content -->
  <div class="main-content">

    <!-- Dashboard Section -->
    <div id="dashboard-section" class="content-section active">
      <div class="page-header">
        <h2><i class="fas fa-chart-line"></i> Dashboard</h2>
        <p class="subtitle">Overview of your campaigns and system status</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-paper-plane" style="font-size: 2rem; color: var(--primary-color);"></i>
          <h3 id="stat-total-sent">0</h3>
          <p>Total Sent</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle" style="font-size: 2rem; color: var(--success-color);"></i>
          <h3 id="stat-success">0</h3>
          <p>Successful</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-times-circle" style="font-size: 2rem; color: var(--danger-color);"></i>
          <h3 id="stat-errors">0</h3>
          <p>Errors</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-server" style="font-size: 2rem; color: var(--warning-color);"></i>
          <h3 id="stat-profiles">0</h3>
          <p>SMTP Profiles</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <i class="fas fa-bolt"></i> Quick Actions
        </div>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="showSection('campaign')">
            <i class="fas fa-rocket"></i> Create Campaign
          </button>
          <button class="btn btn-outline" onclick="showSection('attachments')">
            <i class="fas fa-upload"></i> Upload Attachment
          </button>
          <button class="btn btn-outline" onclick="showSection('smtp-profiles')">
            <i class="fas fa-server"></i> Add SMTP Profile
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <i class="fas fa-history"></i> Recent Activity
        </div>
        <div id="recent-activity">
          <p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No recent activity</p>
        </div>
      </div>
    </div>

    <!-- Campaigns List Section -->
    <div id="campaigns-section" class="content-section">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2><i class="fas fa-list-alt"></i> Campaigns</h2>
          <p class="subtitle">Manage and monitor your email & SMS campaigns</p>
        </div>
        <button class="btn btn-primary" onclick="showNewCampaignPage()">
          <i class="fas fa-plus"></i> New Campaign
        </button>
      </div>

      <!-- Campaigns List -->
      <div id="campaigns-list-container" style="margin-top: 30px;">
        <!-- Campaigns will be loaded here dynamically by JavaScript -->
        <div class="text-center" style="padding: 40px;">
          <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary-color);"></i>
          <p style="margin-top: 20px; color: rgba(255,255,255,0.6);">Loading campaigns...</p>
        </div>
      </div>
    </div>

    <!-- New Campaign Page (Paginated) -->
    <div id="new-campaign-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-plus-circle"></i> Create New Campaign</h2>
        <p class="subtitle">Step-by-step campaign creation wizard</p>
      </div>

      <!-- SMTP Configuration Notice -->
      <div id="campaignSmtpNotice" class="info-notice" style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
        <div id="campaignSmtpStatus" style="color: #e5e7eb;">
          <i class="fas fa-info-circle"></i> Checking SMTP configuration...
        </div>
      </div>

      <!-- Progress Indicator -->
      <div style="display: flex; justify-content: center; margin-bottom: 40px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <div class="campaign-step active" data-step="1">
            <div class="step-number">1</div>
            <div class="step-label">Basic Info</div>
          </div>
          <div class="step-connector"></div>
          <div class="campaign-step" data-step="2">
            <div class="step-number">2</div>
            <div class="step-label">Sender</div>
          </div>
          <div class="step-connector"></div>
          <div class="campaign-step" data-step="3">
            <div class="step-number">3</div>
            <div class="step-label">Content</div>
          </div>
          <div class="step-connector"></div>
          <div class="campaign-step" data-step="4">
            <div class="step-number">4</div>
            <div class="step-label">Recipients</div>
          </div>
          <div class="step-connector"></div>
          <div class="campaign-step" data-step="5">
            <div class="step-number">5</div>
            <div class="step-label">Options</div>
          </div>
        </div>
      </div>

      <form id="newCampaignPageForm">
        <!-- Step 1: Basic Information -->
        <div class="campaign-form-step active" data-step="1">
          <div class="card" style="max-width: 800px; margin: 0 auto;">
            <div class="card-header" style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1;">
              <i class="fas fa-info-circle" style="color: #6366f1;"></i> Basic Information
            </div>
            <div style="padding: 30px;">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Campaign Name *</label>
                  <input type="text" class="form-control" id="page-campaign-name" required placeholder="e.g., Spring Newsletter 2024">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Campaign Mode *</label>
                  <select class="form-control" id="page-campaign-mode">
                    <option value="email">Email Campaign</option>
                    <option value="sms">SMS Campaign</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Sender Information -->
        <div class="campaign-form-step" data-step="2">
          <div class="card" style="max-width: 800px; margin: 0 auto;">
            <div class="card-header" style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e;">
              <i class="fas fa-user" style="color: #22c55e;"></i> Sender Information
            </div>
            <div style="padding: 30px;">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sender Name *</label>
                  <input type="text" class="form-control" id="page-sender-name" required placeholder="Your Name or Company">
                </div>
                <div class="col-md-6 mb-3" id="sender-email-group">
                  <label class="form-label">Sender Email</label>
                  <input type="email" class="form-control" id="page-sender-email" placeholder="Leave empty to use SMTP account email">
                  <small class="form-text" style="color: rgba(255,255,255,0.6); font-size: 11px;">
                    In bulk SMTP mode, the SMTP account's email will be used automatically
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Content -->
        <div class="campaign-form-step" data-step="3">
          <div class="card" style="max-width: 800px; margin: 0 auto;">
            <div class="card-header" style="background: rgba(236, 72, 153, 0.1); border-left: 4px solid #ec4899;">
              <i class="fas fa-envelope" style="color: #ec4899;"></i> Content
            </div>
            <div style="padding: 30px;">
              <div class="mb-3" id="subject-group">
                <label class="form-label">Subject *</label>
                <input type="text" class="form-control" id="page-campaign-subject" placeholder="Email subject line">
              </div>
              <div class="mb-3">
                <label class="form-label">Message *</label>
                <textarea class="form-control" id="page-campaign-message" rows="6" required placeholder="Your message content..."></textarea>
                <button type="button" class="btn btn-sm" onclick="suggestWithAI('page-campaign-message')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-top: 10px;">
                  <i class="fas fa-magic"></i> Suggest with AI
                </button>
              </div>
              <div class="mb-3" id="attachments-group">
                <label class="form-label">Attachments (Optional)</label>
                <select class="form-control" id="page-campaign-attachments" multiple style="height: 100px;">
                  <option value="">Loading attachments...</option>
                </select>
                <small class="text-muted">Hold Ctrl/Cmd to select multiple attachments</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Link Source</label>
                <select class="form-control" id="page-campaign-link-source" onchange="togglePageLinkInput()" style="margin-bottom: 10px;">
                  <option value="none">No Link</option>
                  <option value="direct">Direct Link</option>
                  <option value="redirector">Redirector List</option>
                </select>

                <!-- Direct Link Input -->
                <div id="page-direct-link-container" style="display: none;">
                  <input type="url" class="form-control" id="page-campaign-link" placeholder="https://example.com">
                </div>

                <!-- Redirector List Dropdown -->
                <div id="page-redirector-list-container" style="display: none;">
                  <select class="form-control" id="page-campaign-redirector-list">
                    <option value="">Select a redirector list...</option>
                  </select>
                  <small class="text-muted d-block mt-2">Redirectors will rotate for each recipient</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Recipients -->
        <div class="campaign-form-step" data-step="4">
          <div class="card" style="max-width: 800px; margin: 0 auto;">
            <div class="card-header" style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6;">
              <i class="fas fa-users" style="color: #3b82f6;"></i> Recipients
            </div>
            <div style="padding: 30px;">
              <div class="mb-3" id="carrier-group" style="display: none;">
                <label class="form-label">SMS Carrier *</label>
                <select class="form-control" id="page-campaign-carrier">
                  <option value="">--Select Carrier--</option>
                  <?php
                  foreach($carriers as $carrier){
                    echo "<option value='" . htmlspecialchars($carrier, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($carrier, ENT_QUOTES, 'UTF-8') . "</option>";
                  }
                  ?>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label" id="recipients-label">Recipients List *</label>
                <textarea class="form-control" id="page-campaign-recipients" rows="8" required placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com" style="font-family: monospace;"></textarea>
                <small class="text-muted" id="recipients-hint">One email per line</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: Options -->
        <div class="campaign-form-step" data-step="5">
          <div class="card" style="max-width: 800px; margin: 0 auto;">
            <div class="card-header" style="background: rgba(249, 115, 22, 0.1); border-left: 4px solid #f97316;">
              <i class="fas fa-cog" style="color: #f97316;"></i> Advanced Options
            </div>
            <div style="padding: 30px;">
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="page-use-proxy">
                  <label class="form-check-label" for="page-use-proxy">Use Proxy Rotation</label>
                </div>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="page-protect-links" checked>
                  <label class="form-check-label" for="page-protect-links">Enable Link Protection</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Send Delay (ms)</label>
                <input type="number" class="form-control" id="page-send-delay" value="500" min="0">
                <small class="text-muted">Delay between each email (milliseconds)</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px;">
          <button type="button" class="btn btn-outline" onclick="prevCampaignStep()" id="prevStepBtn" style="display: none;">
            <i class="fas fa-arrow-left"></i> Previous
          </button>
          <button type="button" class="btn btn-primary" onclick="nextCampaignStep()" id="nextStepBtn">
            Next <i class="fas fa-arrow-right"></i>
          </button>
          <button type="button" class="btn btn-success" onclick="createCampaignFromPage()" id="createStepBtn" style="display: none;">
            <i class="fas fa-rocket"></i> Create Campaign
          </button>
        </div>
      </form>
    </div>

    <!-- New Campaign Modal -->
    <div class="modal fade" id="newCampaignModal" tabindex="-1">
      <div class="modal-dialog modal-xl" style="max-width: 900px; margin: 1.75rem auto;">
        <div class="modal-content" style="background: var(--card-bg); color: var(--text-light);">
          <div class="modal-header" style="border-bottom: 2px solid rgba(99, 102, 241, 0.3);">
            <h5 class="modal-title"><i class="fas fa-plus-circle"></i> Create New Campaign</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form id="newCampaignForm" onsubmit="createCampaignFromModal(event)">
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 30px;">

              <!-- Section 1: Basic Information -->
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h6 style="color: #6366f1; margin-bottom: 20px; font-size: 1.1rem;">
                  <i class="fas fa-info-circle"></i> Basic Information
                </h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Campaign Name *</label>
                    <input type="text" class="form-control" id="modal-campaign-name" required placeholder="e.g., Spring Newsletter 2024" style="padding: 12px;">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Campaign Mode *</label>
                    <select class="form-select" id="modal-campaign-mode" onchange="handleModalModeChange()" style="padding: 12px;">
                      <option value="email">📧 Email Campaign</option>
                      <option value="sms">📱 SMS Campaign</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 2: Sender Information -->
              <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h6 style="color: #22c55e; margin-bottom: 20px; font-size: 1.1rem;">
                  <i class="fas fa-user"></i> Sender Information
                </h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Sender Name *</label>
                    <input type="text" class="form-control" id="modal-sender-name" required placeholder="Your Name or Company" style="padding: 12px;">
                  </div>
                  <div class="col-md-6 mb-3" id="modal-sender-email-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Sender Email</label>
                    <input type="email" class="form-control" id="modal-sender-email" placeholder="Leave empty to use SMTP account email" style="padding: 12px;">
                    <small class="form-text" style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 4px;">
                      In bulk SMTP mode, the SMTP account's email will be used automatically as sender
                    </small>
                  </div>
                  <div class="col-md-6 mb-3" id="modal-carrier-group" style="display: none;">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">SMS Carrier *</label>
                    <select class="form-select" id="modal-campaign-carrier" style="padding: 12px;">
                      <option value="">--Select Carrier--</option>
                      <?php
                      foreach($carriers as $carrier){
                        echo "<option value='" . htmlspecialchars($carrier, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($carrier, ENT_QUOTES, 'UTF-8') . "</option>";
                      }
                      ?>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Content -->
              <div style="background: rgba(236, 72, 153, 0.1); border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h6 style="color: #ec4899; margin-bottom: 20px; font-size: 1.1rem;">
                  <i class="fas fa-envelope"></i> Content
                </h6>
                <div class="row">
                  <div class="col-12 mb-3" id="modal-subject-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Subject *</label>
                    <input type="text" class="form-control" id="modal-campaign-subject" placeholder="Email subject line" style="padding: 12px;">
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Message</label>
                    <textarea class="form-control" id="modal-campaign-message" rows="5" placeholder="Your message... (Tip: Use {{option1|option2}} for text spinning)" style="padding: 12px;"></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                      <small class="text-muted" style="font-size: 0.85rem;">💡 Optional for email if you have attachments</small>
                      <button type="button" class="btn btn-sm" onclick="suggestWithAI('modal-campaign-message')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 6px; border: none;">
                        <i class="fas fa-magic"></i> Suggest with AI
                      </button>
                    </div>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">Link Source</label>
                    <select class="form-control" id="modal-campaign-link-source" onchange="toggleModalLinkInput()" style="padding: 12px; margin-bottom: 10px;">
                      <option value="none">No Link</option>
                      <option value="direct">Direct Link</option>
                      <option value="redirector">Redirector List</option>
                    </select>

                    <!-- Direct Link Input -->
                    <div id="modal-direct-link-container" style="display: none;">
                      <input type="url" class="form-control" id="modal-campaign-link" placeholder="https://example.com" style="padding: 12px;">
                    </div>

                    <!-- Redirector List Dropdown -->
                    <div id="modal-redirector-list-container" style="display: none;">
                      <select class="form-control" id="modal-campaign-redirector-list" style="padding: 12px;">
                        <option value="">Select a redirector list...</option>
                      </select>
                      <small class="text-muted d-block mt-2">Redirectors will rotate for each recipient</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 4: Recipients -->
              <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h6 style="color: #3b82f6; margin-bottom: 20px; font-size: 1.1rem;">
                  <i class="fas fa-users"></i> Recipients
                </h6>
                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="form-label" id="modal-recipients-label" style="font-weight: 600; margin-bottom: 8px;">Email Addresses (one per line) *</label>
                    <textarea class="form-control" id="modal-campaign-recipients" rows="6" required placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com" style="padding: 12px; font-family: 'Courier New', monospace;"></textarea>
                  </div>
                </div>
              </div>

              <!-- Section 5: Options -->
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                <h6 style="color: #f59e0b; margin-bottom: 20px; font-size: 1.1rem;">
                  <i class="fas fa-cog"></i> Options
                </h6>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <div class="form-check" style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                      <input class="form-check-input" type="checkbox" id="modal-use-proxy" style="margin-top: 0.4rem;">
                      <label class="form-check-label" for="modal-use-proxy" style="font-weight: 500;">
                        🌐 Use Proxy
                      </label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="form-check" style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                      <input class="form-check-input" type="checkbox" id="modal-protect-links" checked style="margin-top: 0.4rem;">
                      <label class="form-check-label" for="modal-protect-links" style="font-weight: 500;">
                        🔒 Protect Links
                      </label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 8px;">⏱️ Send Delay (ms)</label>
                    <input type="number" class="form-control" id="modal-send-delay" value="500" min="0" style="padding: 12px;">
                  </div>
                </div>
              </div>

            </div>
            <div class="modal-footer" style="border-top: 2px solid rgba(99, 102, 241, 0.3); padding: 20px 30px;">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="padding: 10px 24px; font-weight: 600;">
                <i class="fas fa-times"></i> Cancel
              </button>
              <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 600; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border: none;">
                <i class="fas fa-save"></i> Create Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Campaign wizard for backward compatibility (hidden) -->
    <div style="display: none;">
      <div class="campaign-wizard">
        <!-- Old wizard content hidden but kept for backward compatibility -->
        <div class="wizard-steps">
          <div class="wizard-step active" data-step="1">
            <div class="step-circle">1</div>
            <div class="step-label">Setup</div>
          </div>
          <div class="wizard-step" data-step="2">
            <div class="step-circle">2</div>
            <div class="step-label">Content</div>
          </div>
          <div class="wizard-step" data-step="3">
            <div class="step-circle">3</div>
            <div class="step-label">Recipients</div>
          </div>
          <div class="wizard-step" data-step="4">
            <div class="step-circle">4</div>
            <div class="step-label">Options</div>
          </div>
          <div class="wizard-step" data-step="5">
            <div class="step-circle">5</div>
            <div class="step-label">Send</div>
          </div>
        </div>

        <!-- Step 1: Campaign Setup -->
        <div class="wizard-content" id="step-1">
          <h3 style="margin-bottom: 25px;">Campaign Setup</h3>

          <div class="form-group">
            <label class="form-label">Campaign Name</label>
            <input type="text" class="form-control" id="campaign-name" placeholder="e.g., Newsletter March 2024">
          </div>

          <div class="form-group">
            <label class="form-label">Campaign Mode</label>
            <select class="form-select" id="campaign-mode">
              <option value="email">Email Campaign</option>
              <option value="sms">SMS Campaign</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Sender Name</label>
            <input type="text" class="form-control" id="sender-name" placeholder="Your Company">
          </div>

          <div class="form-group" id="sender-email-group">
            <label class="form-label">Sender Email Address</label>
            <input type="email" class="form-control" id="sender-email" placeholder="noreply@yourcompany.com">
          </div>

          <div style="margin-top: 30px;">
            <button class="btn btn-primary" onclick="nextStep(1)">
              Next <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Step 2: Content Creation -->
        <div class="wizard-content" id="step-2" style="display: none;">
          <h3 style="margin-bottom: 25px;">Create Content</h3>

          <div class="form-group" id="email-subject-group">
            <label class="form-label">Subject Line</label>
            <input type="text" class="form-control" id="campaign-subject" placeholder="Your email subject">
          </div>

          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea class="form-control" id="campaign-message" rows="8" placeholder="Your message here...&#10;&#10;Tip: Use {{variable}} for personalization&#10;Use {{option1|option2|option3}} for text spinning"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Link (Optional)</label>
            <input type="url" class="form-control" id="campaign-link" placeholder="https://example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Select Attachments (Optional)</label>
            <div id="attachment-selector">
              <button type="button" class="btn btn-outline" onclick="openAttachmentPicker()">
                <i class="fas fa-paperclip"></i> Select from Library
              </button>
              <div id="selected-attachments" style="margin-top: 15px;"></div>
            </div>
          </div>

          <div style="margin-top: 30px; display: flex; gap: 15px;">
            <button class="btn btn-outline" onclick="prevStep(2)">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <button class="btn btn-primary" onclick="nextStep(2)">
              Next <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Step 3: Recipients -->
        <div class="wizard-content" id="step-3" style="display: none;">
          <h3 style="margin-bottom: 25px;">Add Recipients</h3>

          <div class="form-group" id="carrier-group" style="display: none;">
            <label class="form-label">SMS Carrier</label>
            <select class="form-select" id="campaign-carrier">
              <option value="">--Please choose a carrier--</option>
              <?php
              $carriers = array('uscellular','sprint','cellone','cellularone','gci','flat','telebeeper','rtsc','telus','telstra','allaumobile','smspup','smscentral','smsglobal','smsbroadcast','esendex','utbox','alaskacommunications','rogers','cricket','nex-tech','tmobile','att','westernwireless','freedommobile','verizon','republic','bluskyfrog','loopmobile','clearlydigital','comcast','corrwireless','cellularsouth','centennialwireless','carolinawestwireless','southwesternbell','fido','ideacellular','indianapaging','illinoisvalleycellular','alltel','centurytel','dobson','surewestcommunications','mobilcomm','clearnet','koodomobile','metrocall2way','boostmobile','onlinebeep','metrocall','mci','ameritechpaging','pcsone','metropcs','cspire','qwest','satellink','threeriverwireless','bluegrasscellular','edgewireless','goldentelecom','publicservicecellular','westcentralwireless','houstoncellular','mts','suncom','bellmobilitycanada','northerntelmobility','uswest','unicel','virginmobilecanada','virginmobile','airtelchennai','kolkataairtel','delhiairtel','tsrwireless','swisscom','mumbaibplmobile','vodafonejapan','gujaratcelforce','movistar','delhihutch','digitextjamacian','jsmtelepage','escotel','sunrisecommunications','teliadenmark','itelcel','mobileone','m1bermuda','o2mmail','telenor','mobistarbelgium','mobtelsrbija','telefonicamovistar','nextelmexico','globalstar','iridiumsatellitecommunications','oskar','meteor','smarttelecom','sunrisemobile','o2','oneconnectaustria','optusmobile','mobilfone','southernlinc','teletouch','vessotel','ntelos','rek2','chennairpgcellular','safaricom','satelindogsm','scs900','sfrfrance','mobiteltanzania','comviq','emt','geldentelecom','pandtluxembourg','netcom','primtel','tmobileaustria','tele2lativa','umc','uraltel','vodafoneitaly','lmt','tmobilegermany','dttmobile','tmobileuk','simplefreedom','tim','vodafone','wyndtell','projectfi');
              foreach($carriers as $carrier){
                echo "<option value='" . htmlspecialchars($carrier, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($carrier, ENT_QUOTES, 'UTF-8') . "</option>";
              }
              ?>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" id="recipients-label">Email Addresses (one per line)</label>
            <textarea class="form-control" id="campaign-recipients" rows="10" placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"></textarea>
          </div>

          <div id="email-validation-section">
            <div class="form-group">
              <label class="form-label">Additional Deny List (Optional)</label>
              <input type="text" class="form-control" id="denylist" placeholder="domain1.com, domain2.com">
            </div>
            <button class="btn btn-outline" onclick="validateRecipients()">
              <i class="fas fa-check"></i> Validate Emails
            </button>
            <span id="validation-result" style="margin-left: 15px; color: var(--success-color);"></span>
          </div>

          <div style="margin-top: 30px; display: flex; gap: 15px;">
            <button class="btn btn-outline" onclick="prevStep(3)">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <button class="btn btn-primary" onclick="nextStep(3)">
              Next <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Step 4: Advanced Options -->
        <div class="wizard-content" id="step-4" style="display: none;">
          <h3 style="margin-bottom: 25px;">Advanced Options</h3>

          <!-- SMTP Profile Selection -->
          <div class="collapse-header" onclick="toggleCollapse('smtp-section')">
            <span><i class="fas fa-server"></i> SMTP Profile</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="collapse-content" id="smtp-section">
            <div class="form-group" style="margin-top: 15px;">
              <label class="form-label">Select SMTP Profile</label>
              <select class="form-select" id="smtp-profile-select">
                <option value="">Use Default Configuration</option>
              </select>
            </div>
          </div>

          <!-- Link Protection -->
          <div class="collapse-header" onclick="toggleCollapse('link-section')">
            <span><i class="fas fa-shield-alt"></i> Link Protection</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="collapse-content" id="link-section">
            <div class="form-group" style="margin-top: 15px;">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-link-protection" checked>
                <label class="form-check-label" for="enable-link-protection">
                  Enable Military-Grade Link Protection
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Protection Level</label>
              <select class="form-select" id="link-protection-level">
                <option value="low">Low (3 steps)</option>
                <option value="medium">Medium (5 steps)</option>
                <option value="high" selected>High (7 steps)</option>
                <option value="maximum">Maximum (11 steps)</option>
              </select>
            </div>
          </div>

          <!-- Proxy Configuration -->
          <div class="collapse-header" onclick="toggleCollapse('proxy-section')">
            <span><i class="fas fa-globe"></i> Proxy Settings</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="collapse-content" id="proxy-section">
            <div class="form-group" style="margin-top: 15px;">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="use-proxy">
                <label class="form-check-label" for="use-proxy">
                  Use Configured Proxies
                </label>
              </div>
            </div>
          </div>

          <!-- Sending Options -->
          <div class="collapse-header" onclick="toggleCollapse('send-options-section')">
            <span><i class="fas fa-clock"></i> Sending Options</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="collapse-content" id="send-options-section">
            <div class="form-group" style="margin-top: 15px;">
              <label class="form-label">Delay Between Sends (milliseconds)</label>
              <input type="number" class="form-control" id="send-delay" value="500" min="0" step="100">
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-select" id="campaign-priority">
                <option value="low">Low Priority</option>
                <option value="normal" selected>Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <!-- Advanced Email Features -->
          <div class="collapse-header" onclick="toggleCollapse('advanced-features-section')">
            <span><i class="fas fa-magic"></i> Advanced Email Features <span class="badge bg-success" style="margin-left: 10px;">NEW</span></span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="collapse-content open" id="advanced-features-section">
            <div style="background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.9em;">
                <i class="fas fa-info-circle" style="color: #10b981;"></i> These features dramatically improve email deliverability and inbox placement
              </p>
            </div>

            <div class="form-group" style="margin-top: 15px;">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-custom-headers" checked>
                <label class="form-check-label" for="enable-custom-headers">
                  <strong>Custom Email Headers</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Applies provider-specific headers (Gmail, Outlook, Yahoo) to bypass spam filters
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-gmail-slow-mode" checked>
                <label class="form-check-label" for="enable-gmail-slow-mode">
                  <strong>Gmail Slow Mode</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Auto-detects Gmail recipients and applies 6-second delays to avoid rate limiting
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-warmup">
                <label class="form-check-label" for="enable-warmup">
                  <strong>SMTP Warmup Mode</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Gradual sending rate increase for new SMTP accounts (prevents blacklisting)
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-zero-width" checked>
                <label class="form-check-label" for="enable-zero-width">
                  <strong>Zero-Width Font Tracking</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Invisible tracking without images (works in all email clients)
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-attribute-shuffle" checked>
                <label class="form-check-label" for="enable-attribute-shuffle">
                  <strong>HTML Obfuscation</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Shuffles HTML attributes to make each email unique (bypasses mass-send detection)
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-macros" checked>
                <label class="form-check-label" for="enable-macros">
                  <strong>Macro Expansion</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Use {firstname}, {email}, {company} and more in your message
                    <a href="#" onclick="showMacroHelper(); return false;" style="color: #3b82f6; margin-left: 5px;">
                      <i class="fas fa-question-circle"></i> View macros
                    </a>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="enable-read-receipt">
                <label class="form-check-label" for="enable-read-receipt">
                  <strong>Read Receipts</strong>
                  <div style="font-size: 0.85em; color: rgba(255,255,255,0.6); margin-top: 3px;">
                    Request read/delivery receipts (not supported by all email providers)
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; display: flex; gap: 15px;">
            <button class="btn btn-outline" onclick="prevStep(4)">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <button class="btn btn-primary" onclick="nextStep(4)">
              Next <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Step 5: Review & Send -->
        <div class="wizard-content" id="step-5" style="display: none;">
          <h3 style="margin-bottom: 25px;">Review & Send Campaign</h3>

          <div class="card" id="campaign-summary">
            <div class="card-header">
              <i class="fas fa-info-circle"></i> Campaign Summary
            </div>
            <div id="summary-content"></div>
          </div>

          <div class="progress-section" id="send-progress" style="display: none;">
            <h4>Sending Progress</h4>
            <div class="progress-bar-container">
              <div class="progress-bar" id="progress-bar" style="width: 0%;">0%</div>
            </div>
            <div style="display: flex; justify-content: space-between; color: rgba(255,255,255,0.6);">
              <span>Sent: <strong id="progress-sent">0</strong></span>
              <span>Failed: <strong id="progress-failed">0</strong></span>
              <span>Total: <strong id="progress-total">0</strong></span>
            </div>
          </div>

          <div id="send-results" style="margin-top: 20px;"></div>

          <div style="margin-top: 30px; display: flex; gap: 15px;">
            <button class="btn btn-outline" onclick="prevStep(5)" id="back-btn-5">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <button class="btn btn-success" onclick="sendCampaign()" id="send-btn">
              <i class="fas fa-rocket"></i> Send Campaign
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Attachments Section -->
    <div id="attachments-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-paperclip"></i> Attachment Library</h2>
        <p class="subtitle">Upload and manage reusable attachments for your campaigns</p>
      </div>

      <div class="card">
        <div class="card-header">
          <i class="fas fa-upload"></i> Upload New Attachment
        </div>
        <div class="form-group">
          <input type="file" class="form-control" id="attachment-file" accept="*/*">
        </div>
        <div class="form-group">
          <label class="form-label">Attachment Name</label>
          <input type="text" class="form-control" id="attachment-name" placeholder="My Document">
        </div>
        <div class="form-group">
          <label class="form-label">Description (Optional)</label>
          <textarea class="form-control" id="attachment-description" rows="2" placeholder="Brief description"></textarea>
        </div>
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="attachment-use-as-html" style="width: 18px; height: 18px;">
            <span>
              <strong>Use as HTML Email Content</strong>
              <br>
              <small class="text-muted">When selected in a campaign, this file's content will be used as the email body instead of the campaign message</small>
            </span>
          </label>
        </div>
        <button class="btn btn-primary" onclick="uploadAttachment()">
          <i class="fas fa-upload"></i> Upload
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <i class="fas fa-list"></i> Your Attachments
        </div>
        <div id="attachments-list">
          <p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No attachments yet</p>
        </div>
      </div>
    </div>

    <!-- SMTP Combo Validator -->
    <div id="smtp-profiles-section" class="content-section">
      <div class="page-header">
        <div>
          <h2><i class="fas fa-server"></i> SMTP Profiles</h2>
          <p class="subtitle">Configure SMTP credentials and validate email:password combinations</p>
        </div>
      </div>

      <!-- SMTP Combo Validator Section -->
      <h3 style="color: rgba(255,255,255,0.9); margin-bottom: 15px; font-size: 1.3rem;">
        <i class="fas fa-check-circle"></i> SMTP Combo Validator
      </h3>

      <!-- Proxy Status Notice -->
      <div class="alert" id="comboProxyNotice" style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <i class="fas fa-info-circle"></i>
        <span id="comboProxyStatus">Checking proxy configuration...</span>
      </div>

      <!-- SMTP Status Notice -->
      <div class="alert" id="comboSmtpNotice" style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <i class="fas fa-info-circle"></i>
        <span id="comboSmtpStatus">Checking SMTP configuration...</span>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-upload"></i> Upload Combo List
        </div>
        <div class="card-body">
          <!-- Upload Area -->
          <div class="mb-3">
            <label class="form-label fw-bold">Upload Combo List</label>
            <input type="file" class="form-control" id="comboFileUpload" accept=".txt">
            <div class="form-text">Or paste combos below (one per line)</div>
          </div>

          <!-- Paste Area -->
          <div class="mb-3">
            <textarea
              class="form-control font-monospace"
              id="comboTextInput"
              rows="6"
              placeholder="user1@gmail.com:password123&#10;admin@yahoo.com:pass456&#10;test@outlook.com:mypass789"
              style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);"></textarea>
          </div>

          <!-- Options -->
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">Format</label>
              <select class="form-select" id="comboFormat">
                <option value="auto">Auto-detect</option>
                <option value="email:password">email:password</option>
                <option value="password:email">password:email</option>
                <option value="email|password">email|password</option>
                <option value="password|email">password|email</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Threads</label>
              <select class="form-select" id="comboThreads">
                <option value="1">1 thread</option>
                <option value="3">3 threads</option>
                <option value="5" selected>5 threads</option>
                <option value="10">10 threads</option>
                <option value="20">20 threads</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Options</label>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="skipBlacklist">
                <label class="form-check-label" for="skipBlacklist">
                  Skip blacklist check (faster)
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="useProxies">
                <label class="form-check-label" for="useProxies">
                  Use configured proxies (protects IP)
                </label>
              </div>
            </div>
          </div>

          <!-- Control Buttons -->
          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="startProcessing">
              <i class="fas fa-play-fill"></i> Start Processing
            </button>
            <button class="btn btn-warning" id="pauseProcessing" disabled>
              <i class="fas fa-pause-fill"></i> Pause
            </button>
            <button class="btn btn-danger" id="stopProcessing" disabled>
              <i class="fas fa-stop-fill"></i> Stop
            </button>
            <button class="btn btn-secondary" id="clearResults">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="card mb-4" id="progressCard" style="display: none;">
        <div class="card-header">
          <i class="fas fa-chart-line"></i> Processing Progress
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold">Progress</span>
            <span id="progressText">0/0 (0%)</span>
          </div>
          <div class="progress mb-3" style="height: 25px; background: rgba(255,255,255,0.1);">
            <div class="progress-bar progress-bar-striped progress-bar-animated"
                 id="progressBar"
                 role="progressbar"
                 style="width: 0%; background: var(--gradient-primary);">0%</div>
          </div>
          <div class="row text-center">
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(255,255,255,0.05);">
                <div class="text-muted small">Total</div>
                <div class="fs-4 fw-bold" id="statTotal">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(40,167,69,0.1);">
                <div class="text-muted small">Valid</div>
                <div class="fs-4 fw-bold text-success" id="statValid">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(220,53,69,0.1);">
                <div class="text-muted small">Invalid</div>
                <div class="fs-4 fw-bold text-danger" id="statInvalid">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(255,255,255,0.05);">
                <div class="text-muted small">Success Rate</div>
                <div class="fs-4 fw-bold" id="statSuccessRate">0%</div>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <small class="text-muted">Currently processing: <span id="currentCombo" class="font-monospace">-</span></small>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="card" id="resultsCard" style="display: none;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="fas fa-list"></i> Results</h5>
          <div class="btn-group">
            <button class="btn btn-sm btn-primary" id="importToSmtp" data-bs-toggle="modal" data-bs-target="#importSmtpModal">
              <i class="fas fa-file-import"></i> Import to SMTP
            </button>
            <button class="btn btn-sm btn-success" id="downloadTxt">
              <i class="fas fa-download"></i> TXT
            </button>
            <button class="btn btn-sm btn-success" id="downloadCsv">
              <i class="fas fa-download"></i> CSV
            </button>
            <button class="btn btn-sm btn-success" id="downloadJson">
              <i class="fas fa-download"></i> JSON
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <input type="text" class="form-control" id="resultsFilter" placeholder="Filter results..." style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);">
          </div>
          <div id="resultsContainer" style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
            <!-- Results will be populated here -->
          </div>
        </div>
      </div>

      <!-- Single SMTP Configuration Section -->
      <h3 style="color: rgba(255,255,255,0.9); margin: 30px 0 15px 0; font-size: 1.3rem;">
        <i class="fas fa-server"></i> Single SMTP Configuration
      </h3>

      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-cog"></i> Configure Single SMTP Account
        </div>
        <div class="card-body">
          <div id="singleSmtpResponse" class="mb-3"></div>

          <!-- SMTP Service Selection -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">SMTP Service (Optional)</label>
              <select class="form-select" id="singleSmtpService" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.3);">
                <option value="">--Please choose a Service--</option>
                <?php
                $smtpServices = array("126","163","1und1","AOL","DebugMail","DynectEmail","FastMail","GandiMail","Gmail","Godaddy","GodaddyAsia","GodaddyEurope","hot.ee","Hotmail","iCloud","mail.ee","Mail.ru","Maildev","Mailgun","Mailjet","Mailosaur","Mandrill","Naver","OpenMailBox","Outlook365","Postmark","QQ","QQex","SendCloud","SendGrid","SendinBlue","SendPulse","SES","SES-US-EAST-1","SES-US-WEST-2","SES-EU-WEST-1","Sparkpost","Yahoo","Yandex","Zoho","qiye.aliyun");
                foreach($smtpServices as $service){
                  echo "<option value='" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "</option>";
                }
                ?>
              </select>
              <small class="text-muted" style="color: rgba(255,255,255,0.7) !important;">Select the email service provider (Gmail, Outlook, Yahoo, etc.)</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">SSL/TLS</label>
              <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" id="singleSmtpSecure" checked>
                <label class="form-check-label" for="singleSmtpSecure">
                  Enable SSL/TLS
                </label>
              </div>
            </div>
          </div>

          <!-- SMTP Credentials -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Username/Email</label>
              <input type="text" class="form-control" id="singleSmtpUsername" placeholder="user@example.com" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.3);">
            </div>
            <div class="col-md-6">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" id="singleSmtpPassword" placeholder="••••••••" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.3);">
            </div>
          </div>

          <!-- Test Buttons -->
          <div class="d-flex gap-2 mb-3">
            <button type="button" class="btn btn-sm btn-info" onclick="testSingleSMTP()">
              <i class="fas fa-vial"></i> TEST
            </button>
            <button type="button" class="btn btn-sm btn-success" onclick="verifySingleSMTP()">
              <i class="fas fa-check-circle"></i> VERIFY
            </button>
            <button type="button" class="btn btn-sm btn-warning" onclick="healthSingleSMTP()">
              <i class="fas fa-heartbeat"></i> HEALTH
            </button>
            <span id="singleSmtpTestResult" class="ms-3"></span>
          </div>

          <div id="singleSmtpHealthResult" class="mb-3"></div>

          <!-- Save Button -->
          <button type="button" class="btn btn-primary" onclick="saveSingleSMTPConfig()">
            <i class="fas fa-save"></i> Save Configuration
          </button>
        </div>
      </div>

      <!-- Bulk SMTP Configuration Section -->
      <h3 style="color: rgba(255,255,255,0.9); margin: 30px 0 15px 0; font-size: 1.3rem;">
        <i class="fas fa-layer-group"></i> Bulk SMTP Configuration
      </h3>

      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-list"></i> Configure Multiple SMTP Accounts
        </div>
        <div class="card-body">
          <div id="bulkSmtpResponse" class="mb-3"></div>

          <!-- SMTP Service Selection -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">SMTP Service</label>
              <select class="form-select" id="bulkSmtpService" style="background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.3);">
                <option value="">-- Select Service --</option>
                <option value="none">Custom SMTP (provide host:port)</option>
                <option disabled>──────────</option>
                <?php
                foreach($smtpServices as $service){
                  echo "<option value='" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "</option>";
                }
                ?>
              </select>
              <small class="text-muted" style="color: rgba(255,255,255,0.7) !important;">Select a service or choose "Custom SMTP" for manual configuration</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">SSL/TLS</label>
              <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" id="bulkSmtpSecure" checked>
                <label class="form-check-label" for="bulkSmtpSecure">
                  Enable SSL/TLS
                </label>
              </div>
            </div>
          </div>

          <!-- Bulk SMTP List -->
          <div class="mb-3">
            <label class="form-label" id="bulkSmtpListLabel">Bulk SMTP List</label>
            <textarea class="form-control" id="bulkSmtpList" rows="6" placeholder="password123|user1@gmail.com&#10;mypass456|user2@yahoo.com&#10;secret789|user3@outlook.com" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.3); font-family: monospace;"></textarea>
            <small class="text-muted" id="bulkSmtpFormatHelp" style="color: rgba(255,255,255,0.7) !important;">
              <strong>With Service Selected:</strong> password|email (one per line)<br>
              <strong>Without Service (Custom):</strong> host|port|username|password (one per line)
            </small>
          </div>

          <!-- Test Buttons -->
          <div class="d-flex gap-2 mb-3">
            <button type="button" class="btn btn-sm btn-info" onclick="testBulkSMTP()">
              <i class="fas fa-vial"></i> TEST ALL
            </button>
            <button type="button" class="btn btn-sm btn-success" onclick="verifyBulkSMTP()">
              <i class="fas fa-check-circle"></i> VERIFY ALL
            </button>
            <span id="bulkSmtpTestResult" class="ms-3"></span>
          </div>

          <div id="bulkSmtpHealthResult" class="mb-3"></div>

          <!-- Save Button -->
          <button type="button" class="btn btn-primary" onclick="saveBulkSMTPConfig()">
            <i class="fas fa-save"></i> Save Configuration
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Section -->
    <!-- Proxies Section -->
    <div id="proxies-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-globe"></i> Proxies</h2>
        <p class="subtitle">Manage proxy rotation for enhanced privacy and deliverability</p>
      </div>

      <!-- Proxy Configuration Card -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <i class="fas fa-network-wired"></i> Proxy Configuration
          </div>
          <button class="btn btn-sm" onclick="toggleProxyModeInPage()" id="proxyModeToggleBtn" style="background: var(--primary-color); color: white; padding: 8px 16px;">
            <i class="fas fa-exchange-alt"></i> BULK MODE
          </button>
        </div>

        <div id="proxyConfigResponse" class="mb-3"></div>

        <!-- Single Proxy Mode -->
        <div id="proxy-single-mode">
          <div class="mb-3">
            <label class="form-label">Protocol</label>
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="proxyProtocolPage" id="proxyHTTPPage" value="http" checked>
                <label class="form-check-label" for="proxyHTTPPage">HTTP/HTTPS</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="proxyProtocolPage" id="proxySOCKS4Page" value="socks4">
                <label class="form-check-label" for="proxySOCKS4Page">SOCKS4</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="proxyProtocolPage" id="proxySOCKS5Page" value="socks5">
                <label class="form-check-label" for="proxySOCKS5Page">SOCKS5</label>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Proxy Address</label>
            <input type="text" class="form-control" id="proxySingleInput" placeholder="192.168.1.1:8080 or user:pass@192.168.1.1:8080">
            <small class="text-muted">Format: ip:port or user:pass@ip:port</small>
          </div>

          <button class="btn btn-primary" onclick="addSingleProxy()">
            <i class="fas fa-plus"></i> Add Proxy
          </button>
        </div>

        <!-- Bulk Proxy Mode -->
        <div id="proxy-bulk-mode" style="display: none;">
          <div class="mb-3">
            <label class="form-label">Protocol</label>
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="proxyProtocolBulkPage" id="proxyHTTPBulkPage" value="http" checked>
                <label class="form-check-label" for="proxyHTTPBulkPage">HTTP/HTTPS</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="proxyProtocolBulkPage" id="proxySOCKS4BulkPage" value="socks4">
                <label class="form-check-label" for="proxySOCKS4BulkPage">SOCKS4</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="proxyProtocolBulkPage" id="proxySOCKS5BulkPage" value="socks5">
                <label class="form-check-label" for="proxySOCKS5BulkPage">SOCKS5</label>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Upload Proxy File</label>
            <input type="file" class="form-control" id="proxyFileInput" accept=".txt,.csv" onchange="handleProxyFileUpload(event)">
            <small class="text-muted">Upload a .txt or .csv file with proxies (one per line)</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Or Paste Proxy List (one per line)</label>
            <textarea class="form-control" id="proxyBulkInput" rows="10" placeholder="192.168.1.1:8080&#10;user:pass@192.168.1.2:8080&#10;10.0.0.1:3128"></textarea>
            <small class="text-muted">Format: ip:port or user:pass@ip:port (one per line)</small>
          </div>

          <button class="btn btn-primary" onclick="addBulkProxies()">
            <i class="fas fa-list"></i> Add Proxies
          </button>
        </div>
      </div>

      <!-- Active Proxies List -->
      <div class="card" style="margin-top: 20px;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <i class="fas fa-list"></i> Active Proxies <span id="proxyCount" style="background: var(--primary-color); padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; margin-left: 10px;">0</span>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-sm" onclick="testSelectedProxies()" id="testProxiesBtn" style="background: #10b981; color: white; padding: 8px 16px; display: none;">
              <i class="fas fa-check-circle"></i> Test Selected
            </button>
            <button class="btn btn-sm" onclick="downloadSelectedProxies()" id="downloadProxiesBtn" style="background: #3b82f6; color: white; padding: 8px 16px; display: none;">
              <i class="fas fa-download"></i> Download Selected
            </button>
            <button class="btn btn-sm" onclick="deleteSelectedProxies()" id="deleteSelectedBtn" style="background: #f59e0b; color: white; padding: 8px 16px; display: none;">
              <i class="fas fa-trash-alt"></i> Delete Selected
            </button>
            <button class="btn btn-sm" onclick="removeFailedProxies()" id="removeFailedBtn" style="background: #ef4444; color: white; padding: 8px 16px; display: none;">
              <i class="fas fa-trash"></i> Remove Failed
            </button>
          </div>
        </div>
        <div id="proxyListContainer" style="padding: 0;">
          <p class="text-muted" style="padding: 20px; text-align: center;">Loading proxies...</p>
        </div>
      </div>
    </div>

    <!-- Inbox Searcher Section -->
    <div id="inbox-searcher-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-search"></i> Inbox Searcher</h2>
        <p class="subtitle">Search through email inboxes for specific keywords</p>
      </div>

      <!-- Proxy Requirement Notice -->
      <div class="alert" id="inboxProxyNotice" style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <i class="fas fa-info-circle"></i>
        <span id="inboxProxyStatus">Checking proxy configuration...</span>
      </div>

      <!-- Method Selection -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-cog"></i> Search Method
        </div>
        <div class="card-body">
          <div class="btn-group w-100 mb-3" role="group">
            <input type="radio" class="btn-check" name="inboxMethod" id="inboxMethodSmtp" value="smtp" checked onchange="switchInboxMethod('smtp')">
            <label class="btn btn-outline-primary" for="inboxMethodSmtp">
              <i class="fas fa-server"></i> SMTP / IMAP
            </label>

            <input type="radio" class="btn-check" name="inboxMethod" id="inboxMethodCookie" value="cookie" onchange="switchInboxMethod('cookie')">
            <label class="btn btn-outline-primary" for="inboxMethodCookie">
              <i class="fas fa-cookie-bite"></i> Cookie Authentication
            </label>
          </div>
          <small class="text-muted">
            <strong>SMTP/IMAP:</strong> Traditional login with email and password.
            <strong>Cookie:</strong> Import browser cookies for Gmail/Outlook (bypasses 2FA).
          </small>
        </div>
      </div>

      <!-- SMTP Method Card -->
      <div class="card mb-4" id="inboxSmtpCard">
        <div class="card-header">
          <i class="fas fa-upload"></i> SMTP Credentials
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label fw-bold">Upload or Paste SMTP List</label>
            <input type="file" class="form-control mb-2" id="inboxSmtpFile" accept=".txt">
            <textarea
              class="form-control font-monospace"
              id="inboxSmtpList"
              rows="8"
              placeholder="smtp.gmail.com|587|user1@gmail.com|password1&#10;smtp.yahoo.com|587|user2@yahoo.com|password2&#10;smtp-mail.outlook.com|587|user3@outlook.com|password3"
              style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);"></textarea>
            <small class="text-muted">Format: smtp|port|email|password (one per line)</small>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Search Keywords (comma-separated)</label>
            <input type="text" class="form-control" id="inboxKeywords" placeholder="invoice, payment, receipt, order" style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);">
            <small class="text-muted">Enter keywords to search for in email subjects and senders</small>
          </div>

          <div class="mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="inboxUseProxies">
              <label class="form-check-label" for="inboxUseProxies">
                Use configured proxies (protects IP)
              </label>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="inboxStartBtn" onclick="startInboxSearch()">
              <i class="fas fa-search"></i> Start Search
            </button>
            <button class="btn btn-warning" id="inboxPauseBtn" disabled>
              <i class="fas fa-pause"></i> Pause
            </button>
            <button class="btn btn-danger" id="inboxStopBtn" disabled>
              <i class="fas fa-stop"></i> Stop
            </button>
            <button class="btn btn-secondary" id="inboxClearBtn" onclick="clearInboxSearch()">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Cookie Method Card -->
      <div class="card mb-4" id="inboxCookieCard" style="display: none;">
        <div class="card-header">
          <i class="fas fa-cookie-bite"></i> Cookie Files Upload
        </div>
        <div class="card-body">
          <div class="alert" style="background: rgba(102, 126, 234, 0.1); border-left: 4px solid var(--primary-color); margin-bottom: 20px;">
            <i class="fas fa-info-circle"></i>
            <strong>How to export cookies:</strong>
            <ol class="mb-0 mt-2">
              <li>Login to Gmail or Outlook in your browser</li>
              <li>Use a browser extension like "EditThisCookie" or "Cookie-Editor" to export cookies</li>
              <li>Save each session as a .txt file (see cookie.txt sample format)</li>
              <li>Upload multiple .txt files here (max 50MB total)</li>
            </ol>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">
              <i class="fas fa-cloud-upload-alt"></i> Upload Cookie Files (.txt)
            </label>
            <input
              type="file"
              class="form-control mb-2"
              id="cookieFiles"
              accept=".txt"
              multiple
              onchange="handleCookieUpload()">
            <small class="text-muted">
              Select multiple .txt files or a folder containing cookie files. Max 50MB total.
            </small>
          </div>

          <div class="mb-3" id="cookieUploadStatus" style="display: none;">
            <div class="alert" id="cookieUploadAlert">
              <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status" id="cookieUploadSpinner">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <span id="cookieUploadMessage">Validating cookie files...</span>
              </div>
            </div>
          </div>

          <div class="mb-3" id="cookieAccountsList" style="display: none;">
            <label class="form-label fw-bold">
              <i class="fas fa-check-circle text-success"></i> Validated Accounts
            </label>
            <div id="cookieAccountsContainer" class="border rounded p-3" style="background: rgba(0,0,0,0.2); max-height: 200px; overflow-y: auto;">
              <!-- Validated accounts will be listed here -->
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Provider Filter (Optional)</label>
            <select class="form-select" id="cookieProvider" style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);">
              <option value="all" selected>All Providers</option>
              <option value="gmail">Gmail Only</option>
              <option value="outlook">Outlook Only</option>
            </select>
            <small class="text-muted">Filter which accounts to search based on provider</small>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Search Keywords (comma-separated)</label>
            <input type="text" class="form-control" id="cookieKeywords" placeholder="invoice, payment, receipt, order" style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);">
            <small class="text-muted">Enter keywords to search for in email subjects</small>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="cookieStartBtn" onclick="startCookieInboxSearch()" disabled>
              <i class="fas fa-search"></i> Start Cookie Search
            </button>
            <button class="btn btn-danger" id="cookieStopBtn" onclick="stopCookieInboxSearch()" disabled>
              <i class="fas fa-stop"></i> Stop
            </button>
            <button class="btn btn-secondary" id="cookieClearBtn" onclick="clearCookieInboxSearch()">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Card -->
      <div class="card mb-4" id="inboxProgressCard" style="display: none;">
        <div class="card-header">
          <i class="fas fa-chart-line"></i> Search Progress
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold">Progress</span>
            <span id="inboxProgressText">0/0 (0%)</span>
          </div>
          <div class="progress mb-3" style="height: 25px; background: rgba(255,255,255,0.1);">
            <div class="progress-bar progress-bar-striped progress-bar-animated"
                 id="inboxProgressBar"
                 role="progressbar"
                 style="width: 0%; background: var(--gradient-primary);">0%</div>
          </div>
          <div class="row text-center">
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(255,255,255,0.05);">
                <div class="text-muted small">Total Accounts</div>
                <div class="fs-4 fw-bold" id="inboxStatTotal">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(40,167,69,0.1);">
                <div class="text-muted small">Searched</div>
                <div class="fs-4 fw-bold text-success" id="inboxStatCompleted">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(220,53,69,0.1);">
                <div class="text-muted small">Failed</div>
                <div class="fs-4 fw-bold text-danger" id="inboxStatFailed">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(102,126,234,0.1);">
                <div class="text-muted small">Total Matches</div>
                <div class="fs-4 fw-bold text-primary" id="inboxStatMatches">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Card -->
      <div class="card" id="inboxResultsCard" style="display: none;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="fas fa-list"></i> Search Results</h5>
          <div class="btn-group">
            <button class="btn btn-sm btn-success" id="inboxDownloadTxt" onclick="downloadInboxResults('txt')">
              <i class="fas fa-download"></i> TXT
            </button>
            <button class="btn btn-sm btn-success" id="inboxDownloadCsv" onclick="downloadInboxResults('csv')">
              <i class="fas fa-download"></i> CSV
            </button>
            <button class="btn btn-sm btn-success" id="inboxDownloadJson" onclick="downloadInboxResults('json')">
              <i class="fas fa-download"></i> JSON
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <input type="text" class="form-control" id="inboxResultsFilter" placeholder="Filter results..." style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);">
          </div>
          <div id="inboxResultsContainer" style="max-height: 600px; overflow-y: auto;">
            <!-- Results will be populated here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Extractor Section -->
    <div id="contact-extractor-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-address-book"></i> Contact Extractor</h2>
        <p class="subtitle">Extract contact lists from email accounts</p>
      </div>

      <!-- Proxy Status Notice -->
      <div class="alert" id="contactProxyNotice" style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <i class="fas fa-info-circle"></i>
        <span id="contactProxyStatus">Checking proxy configuration...</span>
      </div>

      <!-- Upload/Input Card -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-upload"></i> SMTP Credentials
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label fw-bold">Upload or Paste SMTP List</label>
            <input type="file" class="form-control mb-2" id="contactSmtpFile" accept=".txt">
            <textarea
              class="form-control font-monospace"
              id="contactSmtpList"
              rows="8"
              placeholder="smtp.gmail.com|587|user1@gmail.com|password1&#10;smtp.yahoo.com|587|user2@yahoo.com|password2&#10;smtp-mail.outlook.com|587|user3@outlook.com|password3"
              style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);"></textarea>
            <small class="text-muted">Format: smtp|port|email|password (one per line)</small>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Options</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="contactDeduplicate" checked>
              <label class="form-check-label" for="contactDeduplicate">
                Merge & deduplicate contacts across all accounts
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="contactIncludePhone" checked>
              <label class="form-check-label" for="contactIncludePhone">
                Include phone numbers (if available)
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="contactUseProxies">
              <label class="form-check-label" for="contactUseProxies">
                Use configured proxies (protects IP)
              </label>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="contactStartBtn" onclick="startContactExtraction()">
              <i class="fas fa-download"></i> Start Extraction
            </button>
            <button class="btn btn-warning" id="contactPauseBtn" disabled>
              <i class="fas fa-pause"></i> Pause
            </button>
            <button class="btn btn-danger" id="contactStopBtn" disabled>
              <i class="fas fa-stop"></i> Stop
            </button>
            <button class="btn btn-secondary" id="contactClearBtn" onclick="clearContactExtraction()">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Card -->
      <div class="card mb-4" id="contactProgressCard" style="display: none;">
        <div class="card-header">
          <i class="fas fa-chart-line"></i> Extraction Progress
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold">Progress</span>
            <span id="contactProgressText">0/0 (0%)</span>
          </div>
          <div class="progress mb-3" style="height: 25px; background: rgba(255,255,255,0.1);">
            <div class="progress-bar progress-bar-striped progress-bar-animated"
                 id="contactProgressBar"
                 role="progressbar"
                 style="width: 0%; background: var(--gradient-primary);">0%</div>
          </div>
          <div class="row text-center">
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(255,255,255,0.05);">
                <div class="text-muted small">Total Accounts</div>
                <div class="fs-4 fw-bold" id="contactStatTotal">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(40,167,69,0.1);">
                <div class="text-muted small">Processed</div>
                <div class="fs-4 fw-bold text-success" id="contactStatCompleted">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(220,53,69,0.1);">
                <div class="text-muted small">Failed</div>
                <div class="fs-4 fw-bold text-danger" id="contactStatFailed">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(102,126,234,0.1);">
                <div class="text-muted small">Total Contacts</div>
                <div class="fs-4 fw-bold text-primary" id="contactStatContacts">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Card -->
      <div class="card" id="contactResultsCard" style="display: none;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="fas fa-address-book"></i> Extracted Contacts</h5>
          <div class="btn-group">
            <button class="btn btn-sm btn-success" id="contactDownloadCsv" onclick="downloadContactResults('csv')">
              <i class="fas fa-download"></i> CSV
            </button>
            <button class="btn btn-sm btn-success" id="contactDownloadVcf" onclick="downloadContactResults('vcf')">
              <i class="fas fa-download"></i> VCF
            </button>
            <button class="btn btn-sm btn-success" id="contactDownloadTxt" onclick="downloadContactResults('txt')">
              <i class="fas fa-download"></i> TXT
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <input type="text" class="form-control" id="contactResultsFilter" placeholder="Filter contacts..." style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);">
          </div>
          <div id="contactResultsContainer" style="max-height: 600px; overflow-y: auto;">
            <!-- Results will be populated here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Debounce Section -->
    <div id="debounce-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-filter"></i> Debounce Email Filter</h2>
        <p class="subtitle">Remove dangerous emails hosted by security companies and AV vendors</p>
      </div>

      <!-- Upload/Input Card -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-upload"></i> Email List Input
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label fw-bold">Upload or Paste Email List</label>
            <input type="file" class="form-control mb-2" id="debounceEmailFile" accept=".txt">
            <textarea
              class="form-control font-monospace"
              id="debounceEmailList"
              rows="10"
              placeholder="user1@example.com&#10;user2@company.com&#10;user3@domain.net&#10;&#10;Or paste comma-separated: user1@example.com, user2@company.com"
              style="background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1);"></textarea>
            <small class="text-muted">Accepts: One email per line, comma-separated, or mixed formats</small>
          </div>

          <div class="alert alert-info" style="background: rgba(23,162,184,0.1); border-color: rgba(23,162,184,0.3); color: #17a2b8;">
            <i class="fas fa-info-circle"></i> <strong>What gets filtered out:</strong>
            <ul class="mb-0 mt-2">
              <li>Emails hosted by 50+ security vendors (Proofpoint, FireEye, Barracuda, etc.)</li>
              <li>Government/military/education domains (.gov, .mil, .edu)</li>
              <li>Generic admin emails (staff@, admin@, support@, etc.)</li>
              <li>Emails with security-related MX records or PTR records</li>
            </ul>
            <p class="mb-0 mt-2"><strong>Average filter rate:</strong> ~50% of corporate emails</p>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="debounceStartBtn" onclick="startDebounce()">
              <i class="fas fa-filter"></i> Start Filtering
            </button>
            <button class="btn btn-secondary" id="debounceClearBtn" onclick="clearDebounce()">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Card -->
      <div class="card mb-4" id="debounceProgressCard" style="display: none;">
        <div class="card-header">
          <i class="fas fa-chart-line"></i> Filtering Progress
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold">Progress</span>
            <span id="debounceProgressText">0/0 (0%)</span>
          </div>
          <div class="progress mb-3" style="height: 25px; background: rgba(255,255,255,0.1);">
            <div class="progress-bar progress-bar-striped progress-bar-animated"
                 id="debounceProgressBar"
                 role="progressbar"
                 style="width: 0%; background: var(--gradient-primary);">0%</div>
          </div>

          <div class="row text-center mb-3">
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(255,255,255,0.05);">
                <div class="text-muted small">Total Emails</div>
                <div class="fs-4 fw-bold" id="debounceStatTotal">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(40,167,69,0.1);">
                <div class="text-muted small">Safe</div>
                <div class="fs-4 fw-bold text-success" id="debounceStatSafe">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(220,53,69,0.1);">
                <div class="text-muted small">Dangerous</div>
                <div class="fs-4 fw-bold text-danger" id="debounceStatDangerous">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(255,193,7,0.1);">
                <div class="text-muted small">Filter Rate</div>
                <div class="fs-4 fw-bold text-warning" id="debounceStatFilterRate">0%</div>
              </div>
            </div>
          </div>

          <div class="mb-2">
            <strong>Current Status:</strong> <span id="debounceCurrentStatus">Idle</span>
          </div>
          <div class="mb-2">
            <strong>Current Email:</strong> <code id="debounceCurrentEmail">-</code>
          </div>
          <div>
            <strong>Last Result:</strong> <span id="debounceLastResult">-</span>
          </div>
        </div>
      </div>

      <!-- Results Card -->
      <div class="card" id="debounceResultsCard" style="display: none;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><i class="fas fa-check-circle"></i> Filtering Results</span>
          <div>
            <button class="btn btn-sm btn-success" onclick="downloadDebounceResults('safe')">
              <i class="fas fa-download"></i> Download Safe Emails
            </button>
            <button class="btn btn-sm btn-danger" onclick="downloadDebounceResults('dangerous')">
              <i class="fas fa-download"></i> Download Dangerous Emails
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="alert alert-success">
            <strong><i class="fas fa-check-circle"></i> Filtering Complete!</strong>
            <p class="mb-0 mt-2">
              Processed <strong id="debounceFinalTotal">0</strong> emails.
              Found <strong id="debounceFinalSafe">0</strong> safe emails and
              <strong id="debounceFinalDangerous">0</strong> dangerous emails
              (filter rate: <strong id="debounceFinalFilterRate">0%</strong>).
            </p>
          </div>

          <!-- Tabs for Safe/Dangerous Lists -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item">
              <a class="nav-link active" data-bs-toggle="tab" href="#debounceSafeTab">
                <i class="fas fa-check text-success"></i> Safe Emails (<span id="debounceSafeCount">0</span>)
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-bs-toggle="tab" href="#debounceDangerousTab">
                <i class="fas fa-exclamation-triangle text-danger"></i> Dangerous Emails (<span id="debounceDangerousCount">0</span>)
              </a>
            </li>
          </ul>

          <div class="tab-content">
            <div class="tab-pane fade show active" id="debounceSafeTab">
              <textarea
                class="form-control font-monospace"
                id="debounceSafeList"
                rows="15"
                readonly
                style="background: rgba(40,167,69,0.05); color: #fff; border: 1px solid rgba(40,167,69,0.3);"></textarea>
            </div>
            <div class="tab-pane fade" id="debounceDangerousTab">
              <textarea
                class="form-control font-monospace"
                id="debounceDangerousList"
                rows="15"
                readonly
                style="background: rgba(220,53,69,0.05); color: #fff; border: 1px solid rgba(220,53,69,0.3);"></textarea>
              <small class="text-muted mt-2 d-block">Format: email | reason for filtering</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Redirectors Section -->
    <div id="redirectors-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-random"></i> Redirector Manager</h2>
        <p class="subtitle">Process and manage redirector URL lists for campaigns</p>
      </div>

      <!-- Create New List Card -->
      <div class="card">
        <div class="card-header">
          <i class="fas fa-plus"></i> Create New Redirector List
        </div>
        <div class="card-body">
          <!-- List Name -->
          <div class="mb-3">
            <label for="redirectorListName" class="form-label">List Name</label>
            <input
              type="text"
              class="form-control"
              id="redirectorListName"
              placeholder="e.g., Healthcare Campaign 2024"
              style="background: #2c3e50; color: #ecf0f1; border: 1px solid #34495e;">
          </div>

          <!-- Target Link -->
          <div class="mb-3">
            <label for="redirectorTargetLink" class="form-label">Target Link <small class="text-muted">(where all redirectors will point to)</small></label>
            <input
              type="url"
              class="form-control"
              id="redirectorTargetLink"
              placeholder="https://yourwebsite.com/offer"
              style="background: #2c3e50; color: #ecf0f1; border: 1px solid #34495e;">
          </div>

          <!-- Raw Redirector URLs -->
          <div class="mb-3">
            <label for="redirectorRawInput" class="form-label">Raw Redirector URLs</label>
            <textarea
              class="form-control"
              id="redirectorRawInput"
              rows="12"
              placeholder="Paste raw redirector URLs here (one per line)&#10;Supports formats:&#10;- https://track.adform.net/adfserve/?bn=12345;reviurl=http://example.com&#10;- https://secure.adnxs.com/seg?redir=http://target.com&#10;- 12345|https://tags.bluekai.com/site/35702?redir=http://site.com&#10;- https://p.rfihub.com/cm?forward=http://destination.io&#10;&#10;From UrlTeam archives (goo.gl, bit.ly dumps) or custom sources"
              style="background: #2c3e50; color: #ecf0f1; border: 1px solid #34495e; font-family: 'Courier New', monospace;"></textarea>
            <small class="text-muted">Extracts redirect parameters (grep "=http"), removes IDs (cut -d '|' -f 2), deduplicates, and embeds your target link</small>
          </div>

          <!-- Upload File Option -->
          <div class="mb-3">
            <label class="form-label">Or Upload File</label>
            <input
              type="file"
              class="form-control"
              id="redirectorFileUpload"
              accept=".txt"
              style="background: #2c3e50; color: #ecf0f1; border: 1px solid #34495e;"
              onchange="handleRedirectorFileUpload(event)">
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <button class="btn btn-info" onclick="previewRedirectors()">
              <i class="fas fa-eye"></i> Preview
            </button>
            <button class="btn btn-success" onclick="saveRedirectorList()">
              <i class="fas fa-save"></i> Save List
            </button>
            <button class="btn btn-secondary" onclick="clearRedirectorForm()">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Card (hidden by default) -->
      <div class="card mt-3" id="redirectorPreviewCard" style="display: none;">
        <div class="card-header">
          <i class="fas fa-eye"></i> Preview Results
        </div>
        <div class="card-body">
          <!-- Stats -->
          <div class="row mb-3">
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(52,152,219,0.1);">
                <div class="text-muted small">Extracted</div>
                <div class="fs-4 fw-bold" style="color: #3498db;" id="redirectorStatExtracted">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(46,204,113,0.1);">
                <div class="text-muted small">Unique</div>
                <div class="fs-4 fw-bold" style="color: #2ecc71;" id="redirectorStatUnique">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(155,89,182,0.1);">
                <div class="text-muted small">Final Count</div>
                <div class="fs-4 fw-bold" style="color: #9b59b6;" id="redirectorStatFinal">0</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2" style="background: rgba(241,196,15,0.1);">
                <div class="text-muted small">Target Link</div>
                <div class="fs-6 fw-bold text-truncate" style="color: #f1c40f;" id="redirectorStatTarget">-</div>
              </div>
            </div>
          </div>

          <!-- Preview List -->
          <div class="mb-3">
            <label class="form-label">Preview (first 10 redirectors)</label>
            <textarea
              class="form-control"
              id="redirectorPreviewList"
              rows="10"
              readonly
              style="background: #2c3e50; color: #ecf0f1; border: 1px solid #34495e; font-family: 'Courier New', monospace;"></textarea>
          </div>
        </div>
      </div>

      <!-- Saved Lists Card -->
      <div class="card mt-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><i class="fas fa-list"></i> Saved Redirector Lists</span>
          <button class="btn btn-sm btn-primary" onclick="loadRedirectorLists()">
            <i class="fas fa-sync"></i> Refresh
          </button>
        </div>
        <div class="card-body">
          <div id="redirectorListsContainer">
            <p style="color: #7f8c8d;">No redirector lists saved yet. Create one above!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Section -->
    <div id="settings-section" class="content-section">
      <div class="page-header">
        <h2><i class="fas fa-cog"></i> Settings</h2>
        <p class="subtitle">Configure global preferences and API settings</p>
      </div>

      <div class="card">
        <div class="card-header">
          <i class="fas fa-info-circle"></i> System Information
        </div>
        <p><strong>API Endpoint:</strong> <code id="api-endpoint"></code></p>
        <p><strong>Environment:</strong> <span id="environment"></span></p>
      </div>

      <!-- ChatGPT API Configuration Card -->
      <div class="card" style="margin-top: 20px;">
        <div class="card-header">
          <i class="fas fa-robot"></i> ChatGPT API Configuration
        </div>
        <p>Configure OpenAI API key for AI-powered message rephrasing.</p>
        <div id="chatgpt-api-response" class="mb-3"></div>
        <div class="mb-3">
          <label class="form-label">OpenAI API Key</label>
          <input type="password" class="form-control" id="chatgpt-api-key" placeholder="sk-...">
          <small class="text-muted">Your API key is stored locally in your browser (localStorage)</small>
        </div>
        <button class="btn btn-primary" onclick="saveChatGPTKey()">
          <i class="fas fa-save"></i> Save API Key
        </button>
        <button class="btn btn-outline" onclick="testChatGPTKey()" style="margin-left: 10px;">
          <i class="fas fa-vial"></i> Test Connection
        </button>
      </div>
    </div>

  </div>

  <!-- SMTP Configuration Modal -->
  <div class="modal fade" id="smtpConfigModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content" style="background: var(--card-bg); color: var(--text-light);">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-server"></i> SMTP Configuration</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div id="smtpConfigResponse" class="mb-3"></div>

          <!-- SMTP Service Selection -->
          <div class="mb-3">
            <label class="form-label">SMTP Service (Optional)</label>
            <select class="form-select" id="smtpService" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2);">
              <option value="">--Please choose a Service--</option>
              <?php
              $smtpServices = array("126","163","1und1","AOL","DebugMail","DynectEmail","FastMail","GandiMail","Gmail","Godaddy","GodaddyAsia","GodaddyEurope","hot.ee","Hotmail","iCloud","mail.ee","Mail.ru","Maildev","Mailgun","Mailjet","Mailosaur","Mandrill","Naver","OpenMailBox","Outlook365","Postmark","QQ","QQex","SendCloud","SendGrid","SendinBlue","SendPulse","SES","SES-US-EAST-1","SES-US-WEST-2","SES-EU-WEST-1","Sparkpost","Yahoo","Yandex","Zoho","qiye.aliyun");
              foreach($smtpServices as $service){
                echo "<option value='" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "</option>";
              }
              ?>
            </select>
            <small class="text-muted">Leave blank for custom SMTP configuration</small>
          </div>

          <!-- SSL/TLS Checkbox -->
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="smtpSecure" checked>
            <label class="form-check-label" for="smtpSecure">
              Enable SSL/TLS
            </label>
          </div>

          <!-- Mode Toggle Button -->
          <div class="mb-3">
            <button type="button" class="btn btn-outline-primary" id="smtpModeToggle" onclick="toggleSMTPMode()">
              BULK MODE
            </button>
            <small class="text-muted ms-2" id="smtpModeLabel">Currently: Normal Mode</small>
          </div>

          <!-- Normal Mode Fields -->
          <div id="smtpNormalMode">
            <div class="mb-3">
              <label class="form-label">Username/Email</label>
              <input type="text" class="form-control" id="smtpUsername" placeholder="user@example.com" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2);">
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" id="smtpPassword" placeholder="••••••••" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2);">
            </div>
          </div>

          <!-- Bulk Mode Fields -->
          <div id="smtpBulkMode" style="display: none;">
            <div class="mb-3">
              <label class="form-label">Bulk SMTP List (pass|email format)</label>
              <textarea class="form-control" id="smtpBulkList" rows="8" placeholder="password123|user1@gmail.com&#10;mypass456|user2@yahoo.com&#10;secret789|user3@outlook.com" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2); font-family: monospace;"></textarea>
              <small class="text-muted">Format: password|email (one per line)</small>
            </div>
          </div>

          <!-- Test Buttons -->
          <div class="mb-3">
            <button type="button" class="btn btn-sm btn-info" onclick="testSMTP()">
              <i class="fas fa-vial"></i> TEST
            </button>
            <button type="button" class="btn btn-sm btn-success" onclick="verifySMTP()">
              <i class="fas fa-check-circle"></i> VERIFY
            </button>
            <button type="button" class="btn btn-sm btn-warning" onclick="healthSMTP()">
              <i class="fas fa-heartbeat"></i> HEALTH
            </button>
            <span id="smtpTestResult" class="ms-3"></span>
          </div>

          <div id="smtpHealthResult" class="mb-3"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="saveSMTPConfig()">
            <i class="fas fa-save"></i> Save Configuration
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Import to SMTP Modal -->
  <div class="modal fade" id="importSmtpModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content" style="background: var(--card-bg); color: var(--text-light);">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-file-import"></i> Import to SMTP Configuration</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div id="importSmtpResponse" class="mb-3"></div>

          <!-- Valid Results Summary -->
          <div class="alert alert-info mb-3">
            <i class="fas fa-info-circle"></i>
            You have <strong id="importValidCount">0</strong> valid SMTP credentials ready to import.
          </div>

          <!-- Mode Selection -->
          <div class="mb-3">
            <label class="form-label fw-bold">Import Mode</label>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="importMode" id="importModeSingle" value="single" checked>
              <label class="form-check-label" for="importModeSingle">
                <strong>Single SMTP Mode</strong> - Use first valid credential for all campaigns
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="importMode" id="importModeBulk" value="bulk">
              <label class="form-check-label" for="importModeBulk">
                <strong>Bulk SMTP Mode</strong> - Import all valid credentials for rotation
              </label>
            </div>
          </div>

          <!-- Preview Section -->
          <div class="mb-3">
            <label class="form-label fw-bold">Preview</label>
            <div id="importPreview" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.9rem;">
              <!-- Preview will be populated here -->
            </div>
          </div>

          <!-- Service Selection -->
          <div class="mb-3">
            <label class="form-label">SMTP Service (Optional)</label>
            <select class="form-select" id="importSmtpService" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2);">
              <option value="">Auto-detect from domain</option>
              <?php
              $smtpServices = array("126","163","1und1","AOL","DebugMail","DynectEmail","FastMail","GandiMail","Gmail","Godaddy","GodaddyAsia","GodaddyEurope","hot.ee","Hotmail","iCloud","mail.ee","Mail.ru","Maildev","Mailgun","Mailjet","Mailosaur","Mandrill","Naver","OpenMailBox","Outlook365","Postmark","QQ","QQex","SendCloud","SendGrid","SendinBlue","SendPulse","SES","SES-US-EAST-1","SES-US-WEST-2","SES-EU-WEST-1","Sparkpost","Yahoo","Yandex","Zoho","qiye.aliyun");
              foreach($smtpServices as $service){
                echo "<option value='" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . "</option>";
              }
              ?>
            </select>
          </div>

          <!-- SSL/TLS Checkbox -->
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="importSmtpSecure" checked>
            <label class="form-check-label" for="importSmtpSecure">
              Enable SSL/TLS
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="executeImportToSMTP()">
            <i class="fas fa-check"></i> Import & Configure
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- SMTP Database Stats Modal -->
  <div class="modal fade" id="smtpDatabaseStatsModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content" style="background: var(--card-bg); color: var(--text-light);">
        <div class="modal-header" style="border-bottom: 2px solid rgba(99, 102, 241, 0.3);">
          <h5 class="modal-title"><i class="fas fa-database"></i> SMTP Database Statistics</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" style="padding: 30px;">
          <div id="databaseStatsContent">
            <div class="text-center">
              <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
              <p class="mt-3">Loading statistics...</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Proxy Configuration Modal -->
  <div class="modal fade" id="proxyConfigModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content" style="background: var(--card-bg); color: var(--text-light);">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-globe"></i> Proxy Configuration</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div id="proxyConfigResponse" class="mb-3"></div>

          <!-- Protocol Selection -->
          <div class="mb-3">
            <label class="form-label">Protocol</label>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="proxyProtocol" id="proxyHTTP" value="http" checked>
              <label class="form-check-label" for="proxyHTTP">
                HTTP/HTTPS
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="proxyProtocol" id="proxySOCKS4" value="socks4">
              <label class="form-check-label" for="proxySOCKS4">
                SOCKS4
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="proxyProtocol" id="proxySOCKS5" value="socks5">
              <label class="form-check-label" for="proxySOCKS5">
                SOCKS5
              </label>
            </div>
          </div>

          <!-- Proxy List -->
          <div class="mb-3">
            <label class="form-label">Proxy List</label>
            <textarea class="form-control" id="proxyList" rows="8" placeholder="192.168.1.1:8080&#10;user:pass@192.168.1.2:8080&#10;10.0.0.1:3128" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2); font-family: monospace;"></textarea>
            <small class="text-muted">Format: ip:port or user:pass@ip:port (one per line)</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="saveProxyConfig()">
            <i class="fas fa-save"></i> Add Proxies
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div class="spinner-overlay" id="spinner">
    <div class="spinner"></div>
  </div>

  <!-- Scripts -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/campaign.js"></script>
  <script>
    // SMTP Mode Toggle
    let smtpMode = 'normal';

    function toggleSMTPMode() {
      smtpMode = smtpMode === 'normal' ? 'bulk' : 'normal';
      const toggleBtn = document.getElementById('smtpModeToggle');
      const modeLabel = document.getElementById('smtpModeLabel');
      const normalMode = document.getElementById('smtpNormalMode');
      const bulkMode = document.getElementById('smtpBulkMode');

      if (smtpMode === 'bulk') {
        toggleBtn.textContent = 'NORMAL MODE';
        modeLabel.textContent = 'Currently: Bulk Mode';
        normalMode.style.display = 'none';
        bulkMode.style.display = 'block';
      } else {
        toggleBtn.textContent = 'BULK MODE';
        modeLabel.textContent = 'Currently: Normal Mode';
        normalMode.style.display = 'block';
        bulkMode.style.display = 'none';
      }
    }

    // Validate email format
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    // Validate pass|email or host|port|email|password format
    function validateBulkSMTP(lines, service) {
      const results = [];
      let hasErrors = false;
      const errors = [];

      if (lines.length === 0) {
        return { hasErrors: true, results: [], errors: ['Bulk list is empty'] };
      }

      const isCustomSMTP = !service || service === 'none';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split('|');

        if (isCustomSMTP) {
          // Custom SMTP: host|port|email|password
          if (parts.length !== 4) {
            hasErrors = true;
            results.push(line + ' - error (invalid format)');
            errors.push(`Line ${i + 1}: Must be in format "host|port|email|password"`);
            continue;
          }

          const [host, port, email, password] = parts.map(p => p.trim());

          if (!host) {
            hasErrors = true;
            results.push(line + ' - error (empty host)');
            errors.push(`Line ${i + 1}: Host cannot be empty`);
            continue;
          }

          const portNum = parseInt(port);
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            hasErrors = true;
            results.push(line + ' - error (invalid port)');
            errors.push(`Line ${i + 1}: Port must be between 1-65535`);
            continue;
          }

          if (!email || !isValidEmail(email)) {
            hasErrors = true;
            results.push(line + ' - error (invalid email)');
            errors.push(`Line ${i + 1}: Invalid email format`);
            continue;
          }

          if (!password) {
            hasErrors = true;
            results.push(line + ' - error (empty password)');
            errors.push(`Line ${i + 1}: Password cannot be empty`);
            continue;
          }

        } else {
          // Service-based SMTP: password|email
          if (parts.length !== 2) {
            hasErrors = true;
            results.push(line + ' - error (invalid format)');
            errors.push(`Line ${i + 1}: Must be in format "password|email"`);
            continue;
          }

          const password = parts[0].trim();
          const email = parts[1].trim();

          if (!password) {
            hasErrors = true;
            results.push(line + ' - error (empty password)');
            errors.push(`Line ${i + 1}: Password cannot be empty`);
            continue;
          }

          if (!email) {
            hasErrors = true;
            results.push(line + ' - error (empty email)');
            errors.push(`Line ${i + 1}: Email cannot be empty`);
            continue;
          }

          if (!isValidEmail(email)) {
            hasErrors = true;
            results.push(line + ' - error (invalid email)');
            errors.push(`Line ${i + 1}: Invalid email format`);
            continue;
          }
        }

        results.push(line);
      }

      return { hasErrors, results, errors };
    }

    // Save SMTP Configuration
    async function saveSMTPConfig() {
      try {
        const service = document.getElementById('smtpService').value;
        const secure = document.getElementById('smtpSecure').checked;
        let data = { service, secureConnection: secure };

        if (smtpMode === 'normal') {
          const username = document.getElementById('smtpUsername').value.trim();
          const password = document.getElementById('smtpPassword').value.trim();

          // Validate username (email format)
          if (!username) {
            showSMTPResponse('Username/Email is required', 'danger');
            document.getElementById('smtpUsername').focus();
            return;
          }

          if (!isValidEmail(username)) {
            showSMTPResponse('Please enter a valid email address', 'danger');
            document.getElementById('smtpUsername').focus();
            return;
          }

          // Validate password
          if (!password) {
            showSMTPResponse('Password is required', 'danger');
            document.getElementById('smtpPassword').focus();
            return;
          }

          if (password.length < 4) {
            showSMTPResponse('Password must be at least 4 characters', 'danger');
            document.getElementById('smtpPassword').focus();
            return;
          }

          data.user = username;
          data.pass = password;
          data.bulk = 'false';
        } else {
          const bulkText = document.getElementById('smtpBulkList').value.trim();
          if (!bulkText) {
            showSMTPResponse('Please enter bulk SMTP list (format: password|email)', 'danger');
            document.getElementById('smtpBulkList').focus();
            return;
          }

          const lines = bulkText.split('\n').filter(l => l.trim());
          const validation = validateBulkSMTP(lines);

          if (validation.hasErrors) {
            document.getElementById('smtpBulkList').value = validation.results.join('\n');
            const errorMsg = 'Invalid entries found:<br>' + validation.errors.slice(0, 5).join('<br>');
            if (validation.errors.length > 5) {
              showSMTPResponse(errorMsg + '<br>...and ' + (validation.errors.length - 5) + ' more errors', 'danger');
            } else {
              showSMTPResponse(errorMsg, 'danger');
            }
            return;
          }

          data.smtplist = lines;
          data.bulk = 'true';
        }

        showSMTPResponse('Configuring SMTP...', 'info');

        const response = await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.text();

        if (result === 'true' || result.includes('true')) {
          showSMTPResponse('SMTP configured successfully!', 'success');
          setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('smtpConfigModal')).hide();
          }, 1500);
        } else {
          showSMTPResponse('SMTP configuration failed', 'danger');
        }
      } catch (error) {
        console.error('SMTP config error:', error);
        showSMTPResponse('Error: ' + error.message, 'danger');
      }
    }

    // Test SMTP Connection
    async function testSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('singleSmtpService').value;
      const secure = document.getElementById('singleSmtpSecure').checked;
      const username = document.getElementById('singleSmtpUsername').value.trim();
      const password = document.getElementById('singleSmtpPassword').value.trim();

      // Validate before testing
      if (!service) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please select an SMTP service first</span>';
        return;
      }

      if (!username || !password) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please enter username and password first</span>';
        return;
      }

      document.getElementById('smtpTestResult').textContent = 'Testing connection...';

      try {
        // First save the config temporarily
        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then test it
        const response = await fetch(`${API_LEGACY}/smtp/test`, {
          method: 'POST'
        });
        const result = await response.text();

        if (result === 'true') {
          document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--success-color);">✓ Connection successful</span>';
        } else {
          document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Connection failed</span>';
        }
      } catch (error) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Test failed: ' + error.message + '</span>';
      }
    }

    // Verify SMTP Credentials
    async function verifySMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('singleSmtpService').value;
      const secure = document.getElementById('singleSmtpSecure').checked;
      const username = document.getElementById('singleSmtpUsername').value.trim();
      const password = document.getElementById('singleSmtpPassword').value.trim();

      // Validate before verifying
      if (!service) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please select an SMTP service first</span>';
        return;
      }

      if (!username || !password) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please enter username and password first</span>';
        return;
      }

      document.getElementById('smtpTestResult').textContent = 'Verifying credentials...';

      try {
        // First save the config temporarily
        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then verify it
        const response = await fetch(`${API_LEGACY}/smtp/verify`, {
          method: 'POST'
        });
        const result = await response.text();

        if (result === 'true') {
          document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--success-color);">✓ Credentials verified</span>';
        } else {
          document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Verification failed</span>';
        }
      } catch (error) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Error: ' + error.message + '</span>';
      }
    }

    // Check SMTP Health (MX, SPF, DMARC)
    async function healthSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('singleSmtpService').value;
      const secure = document.getElementById('singleSmtpSecure').checked;
      const username = document.getElementById('singleSmtpUsername').value.trim();
      const password = document.getElementById('singleSmtpPassword').value.trim();

      // Validate before checking health
      if (!service) {
        document.getElementById('smtpHealthResult').innerHTML = '<div class="alert alert-warning">⚠ Please select an SMTP service first</div>';
        return;
      }

      if (!username || !password) {
        document.getElementById('smtpHealthResult').innerHTML = '<div class="alert alert-warning">⚠ Please enter username and password first</div>';
        return;
      }

      document.getElementById('smtpHealthResult').textContent = 'Checking domain health...';

      try {
        // First save the config temporarily
        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then check health
        const response = await fetch(`${API_LEGACY}/smtp/health`, {
          method: 'POST'
        });
        const healthData = await response.json();

        if (healthData.ok) {
          const mx = healthData.hasMX ? 'Y' : 'N';
          const spf = healthData.hasSPF ? 'Y' : 'N';
          const dmarc = healthData.hasDMARC ? 'Y' : 'N';
          document.getElementById('smtpHealthResult').innerHTML = `
            <div class="alert alert-info">
              <strong>Domain Health for ${healthData.domain}:</strong><br>
              MX: <strong>${mx}</strong> | SPF: <strong>${spf}</strong> | DMARC: <strong>${dmarc}</strong>
            </div>
          `;
        } else {
          document.getElementById('smtpHealthResult').innerHTML = `<div class="alert alert-warning">${healthData.message}</div>`;
        }
      } catch (error) {
        document.getElementById('smtpHealthResult').innerHTML = '<div class="alert alert-danger">Health check failed: ' + error.message + '</div>';
      }
    }

    // ============================================
    // Single SMTP Configuration Functions
    // ============================================

    async function saveSingleSMTPConfig() {
      try {
        const service = document.getElementById('singleSmtpService').value;
        const secure = document.getElementById('singleSmtpSecure').checked;
        const username = document.getElementById('singleSmtpUsername').value.trim();
        const password = document.getElementById('singleSmtpPassword').value.trim();

        // Validate service selection
        if (!service) {
          showSingleSMTPResponse('Please select an SMTP service from the dropdown', 'danger');
          document.getElementById('singleSmtpService').focus();
          return;
        }

        // Validate username (email format)
        if (!username) {
          showSingleSMTPResponse('Username/Email is required', 'danger');
          document.getElementById('singleSmtpUsername').focus();
          return;
        }

        if (!isValidEmail(username)) {
          showSingleSMTPResponse('Please enter a valid email address', 'danger');
          document.getElementById('singleSmtpUsername').focus();
          return;
        }

        // Validate password
        if (!password) {
          showSingleSMTPResponse('Password is required', 'danger');
          document.getElementById('singleSmtpPassword').focus();
          return;
        }

        if (password.length < 4) {
          showSingleSMTPResponse('Password must be at least 4 characters', 'danger');
          document.getElementById('singleSmtpPassword').focus();
          return;
        }

        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        showSingleSMTPResponse('Configuring SMTP...', 'info');

        const response = await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.text();

        if (result === 'true' || result.includes('true')) {
          showSingleSMTPResponse('SMTP configured successfully!', 'success');
          // Update SMTP notices and dashboard stats
          updateSmtpNotices();
          updateDashboardSmtpStats();
        } else {
          showSingleSMTPResponse('SMTP configuration failed', 'danger');
        }
      } catch (error) {
        console.error('Single SMTP config error:', error);
        showSingleSMTPResponse('Error: ' + error.message, 'danger');
      }
    }

    async function testSingleSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('singleSmtpService').value;
      const secure = document.getElementById('singleSmtpSecure').checked;
      const username = document.getElementById('singleSmtpUsername').value.trim();
      const password = document.getElementById('singleSmtpPassword').value.trim();

      // Validate before testing
      if (!service) {
        document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please select an SMTP service first</span>';
        return;
      }

      if (!username || !password) {
        document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please enter username and password first</span>';
        return;
      }

      document.getElementById('singleSmtpTestResult').textContent = 'Testing connection...';

      try {
        // First save the config temporarily
        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then test it
        const response = await fetch(`${API_LEGACY}/smtp/test`, {
          method: 'POST'
        });
        const result = await response.text();

        if (result === 'true') {
          document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--success-color);">✓ Connection successful</span>';
        } else {
          document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Connection failed</span>';
        }
      } catch (error) {
        document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Test failed: ' + error.message + '</span>';
      }
    }

    async function verifySingleSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('singleSmtpService').value;
      const secure = document.getElementById('singleSmtpSecure').checked;
      const username = document.getElementById('singleSmtpUsername').value.trim();
      const password = document.getElementById('singleSmtpPassword').value.trim();

      // Validate before verifying
      if (!service) {
        document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please select an SMTP service first</span>';
        return;
      }

      if (!username || !password) {
        document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please enter username and password first</span>';
        return;
      }

      document.getElementById('singleSmtpTestResult').textContent = 'Verifying credentials...';

      try {
        // First save the config temporarily
        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then verify it
        const response = await fetch(`${API_LEGACY}/smtp/verify`, {
          method: 'POST'
        });
        const result = await response.text();

        if (result === 'true') {
          document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--success-color);">✓ Credentials verified</span>';
        } else {
          document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Verification failed</span>';
        }
      } catch (error) {
        document.getElementById('singleSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Error: ' + error.message + '</span>';
      }
    }

    async function healthSingleSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('singleSmtpService').value;
      const secure = document.getElementById('singleSmtpSecure').checked;
      const username = document.getElementById('singleSmtpUsername').value.trim();
      const password = document.getElementById('singleSmtpPassword').value.trim();

      // Validate before checking health
      if (!service) {
        document.getElementById('singleSmtpHealthResult').innerHTML = '<div class="alert alert-warning">⚠ Please select an SMTP service first</div>';
        return;
      }

      if (!username || !password) {
        document.getElementById('singleSmtpHealthResult').innerHTML = '<div class="alert alert-warning">⚠ Please enter username and password first</div>';
        return;
      }

      document.getElementById('singleSmtpHealthResult').textContent = 'Checking domain health...';

      try {
        // First save the config temporarily
        const data = {
          service,
          secureConnection: secure,
          user: username,
          pass: password,
          bulk: 'false'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then check health
        const response = await fetch(`${API_LEGACY}/smtp/health`, {
          method: 'POST'
        });
        const healthData = await response.json();

        if (healthData.ok) {
          const mx = healthData.hasMX ? 'Y' : 'N';
          const spf = healthData.hasSPF ? 'Y' : 'N';
          const dmarc = healthData.hasDMARC ? 'Y' : 'N';
          document.getElementById('singleSmtpHealthResult').innerHTML = `
            <div class="alert alert-info">
              <strong>Domain Health for ${healthData.domain}:</strong><br>
              MX: <strong>${mx}</strong> | SPF: <strong>${spf}</strong> | DMARC: <strong>${dmarc}</strong>
            </div>
          `;
        } else {
          document.getElementById('singleSmtpHealthResult').innerHTML = `<div class="alert alert-warning">${healthData.message}</div>`;
        }
      } catch (error) {
        document.getElementById('singleSmtpHealthResult').innerHTML = '<div class="alert alert-danger">Health check failed: ' + error.message + '</div>';
      }
    }

    function showSingleSMTPResponse(message, type) {
      const alertDiv = document.getElementById('singleSmtpResponse');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.innerHTML = message;
      alertDiv.style.display = 'block';
    }

    // ============================================
    // Bulk SMTP Configuration Functions
    // ============================================

    // Update bulk SMTP placeholder based on service selection
    function updateBulkSmtpPlaceholder() {
      const service = document.getElementById('bulkSmtpService').value;
      const textarea = document.getElementById('bulkSmtpList');
      const helpText = document.getElementById('bulkSmtpFormatHelp');

      if (service && service !== '' && service !== 'none') {
        // With service: password|email format
        textarea.placeholder = 'password123|user1@gmail.com\nmypass456|user2@yahoo.com\nsecret789|user3@outlook.com';
        helpText.innerHTML = '<strong style="color: #10b981;">Format:</strong> password|email (one per line)';
      } else {
        // Without service: host|port|username|password format
        textarea.placeholder = 'smtp.example.com|587|user@example.com|password123\nmail.domain.com|465|admin@domain.com|secret456';
        helpText.innerHTML = '<strong style="color: #f59e0b;">Format:</strong> host|port|username|password (one per line)';
      }
    }

    // Add event listener for service change
    document.addEventListener('DOMContentLoaded', function() {
      const bulkServiceSelect = document.getElementById('bulkSmtpService');
      if (bulkServiceSelect) {
        bulkServiceSelect.addEventListener('change', updateBulkSmtpPlaceholder);
        updateBulkSmtpPlaceholder(); // Set initial state
      }
    });

    async function saveBulkSMTPConfig() {
      try {
        const service = document.getElementById('bulkSmtpService').value;
        const secure = document.getElementById('bulkSmtpSecure').checked;
        const bulkText = document.getElementById('bulkSmtpList').value.trim();

        if (!bulkText) {
          showBulkSMTPResponse('Please enter bulk SMTP list (format: password|email)', 'danger');
          document.getElementById('bulkSmtpList').focus();
          return;
        }

        const lines = bulkText.split('\n').filter(l => l.trim());
        const validation = validateBulkSMTP(lines, service);

        if (validation.hasErrors) {
          document.getElementById('bulkSmtpList').value = validation.results.join('\n');
          const errorMsg = 'Invalid entries found:<br>' + validation.errors.slice(0, 5).join('<br>');
          if (validation.errors.length > 5) {
            showBulkSMTPResponse(errorMsg + '<br>...and ' + (validation.errors.length - 5) + ' more errors', 'danger');
          } else {
            showBulkSMTPResponse(errorMsg, 'danger');
          }
          return;
        }

        const data = {
          service,
          secureConnection: secure,
          smtplist: lines,
          bulk: 'true'
        };

        showBulkSMTPResponse('Configuring bulk SMTP...', 'info');

        const response = await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.text();

        if (result === 'true' || result.includes('true')) {
          showBulkSMTPResponse(`Successfully configured ${lines.length} SMTP accounts!`, 'success');
          // Update SMTP notices and dashboard stats
          updateSmtpNotices();
          updateDashboardSmtpStats();
        } else {
          showBulkSMTPResponse('Bulk SMTP configuration failed', 'danger');
        }
      } catch (error) {
        console.error('Bulk SMTP config error:', error);
        showBulkSMTPResponse('Error: ' + error.message, 'danger');
      }
    }

    async function testBulkSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('bulkSmtpService').value;
      const secure = document.getElementById('bulkSmtpSecure').checked;
      const bulkList = document.getElementById('bulkSmtpList').value.trim();

      // Validate before testing
      if (!service) {
        document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please select an SMTP service first</span>';
        return;
      }

      if (!bulkList) {
        document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please enter SMTP accounts list</span>';
        return;
      }

      const smtplist = bulkList.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      document.getElementById('bulkSmtpTestResult').textContent = `Testing ${smtplist.length} accounts...`;

      try {
        // Call the new bulk test endpoint
        const response = await fetch(`${API_LEGACY}/smtp/test-bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtplist: smtplist,
            service: service,
            secureConnection: secure
          })
        });

        const result = await response.json();

        if (!result.success) {
          document.getElementById('bulkSmtpTestResult').innerHTML = `<span style="color: var(--danger-color);">✗ Test failed: ${result.error}</span>`;
          return;
        }

        // Show summary
        const passed = result.passed || 0;
        const failed = result.failed || 0;
        const total = result.tested || 0;

        if (failed === 0) {
          document.getElementById('bulkSmtpTestResult').innerHTML = `<span style="color: var(--success-color);">✓ All ${passed} accounts connected successfully</span>`;
        } else {
          document.getElementById('bulkSmtpTestResult').innerHTML = `<span style="color: var(--warning-color);">⚠ ${passed} passed, ${failed} failed out of ${total}</span>`;
        }

        // Show detailed results in a scrollable section
        if (result.results && result.results.length > 0) {
          let detailsHTML = '<div style="margin-top: 15px; max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">';
          result.results.forEach(r => {
            if (r.success) {
              detailsHTML += `<div style="margin-bottom: 8px; color: #10b981;">✓ ${r.email} @ ${r.host}:${r.port} - ${r.message}</div>`;
            } else {
              detailsHTML += `<div style="margin-bottom: 8px; color: #ef4444;">✗ ${r.email} @ ${r.host}:${r.port} - ${r.error}</div>`;
            }
          });
          detailsHTML += '</div>';

          document.getElementById('bulkSmtpTestResult').innerHTML += detailsHTML;
        }

      } catch (error) {
        document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Test failed: ' + error.message + '</span>';
      }
    }

    async function verifyBulkSMTP() {
      // Get current form values (not saved config)
      const service = document.getElementById('bulkSmtpService').value;
      const secure = document.getElementById('bulkSmtpSecure').checked;
      const bulkList = document.getElementById('bulkSmtpList').value.trim();

      // Validate before verifying
      if (!service) {
        document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please select an SMTP service first</span>';
        return;
      }

      if (!bulkList) {
        document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--warning-color);">⚠ Please enter SMTP accounts list</span>';
        return;
      }

      document.getElementById('bulkSmtpTestResult').textContent = 'Verifying all accounts...';

      try {
        // First save the bulk config temporarily
        const smtplist = bulkList.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        const data = {
          service,
          secureConnection: secure,
          smtplist: smtplist,
          bulk: 'true'
        };

        await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // Then verify it
        const response = await fetch(`${API_LEGACY}/smtp/verify`, {
          method: 'POST'
        });
        const result = await response.text();

        if (result === 'true') {
          document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--success-color);">✓ All credentials verified</span>';
        } else {
          document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Verification failed</span>';
        }
      } catch (error) {
        document.getElementById('bulkSmtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Error: ' + error.message + '</span>';
      }
    }

    function showBulkSMTPResponse(message, type) {
      const alertDiv = document.getElementById('bulkSmtpResponse');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.innerHTML = message;
      alertDiv.style.display = 'block';
    }

    // Validate IP:port format
    function isValidProxy(proxy) {
      // Supports 3 formats:
      // 1. ip:port or hostname:port
      // 2. ip:port:user:pass
      // 3. user:pass@ip:port (handled elsewhere)

      if (!proxy || !proxy.includes(':')) {
        return false;
      }

      const parts = proxy.split(':');

      // IP address regex
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      // Hostname/domain regex (alphanumeric, hyphens, dots)
      const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

      if (parts.length === 2) {
        // Format: host:port
        const [host, port] = parts;

        // Validate port (1-65535)
        const portNum = parseInt(port);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          return false;
        }

        return ipRegex.test(host) || hostnameRegex.test(host);
      } else if (parts.length === 4) {
        // Format: ip:port:user:pass
        const [host, port, username, password] = parts;

        // Validate port (1-65535)
        const portNum = parseInt(port);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          return false;
        }

        // Validate host (must be IP or hostname)
        if (!ipRegex.test(host) && !hostnameRegex.test(host)) {
          return false;
        }

        // Validate credentials are not empty
        if (!username || !password) {
          return false;
        }

        return true;
      }

      return false;
    }

    // Validate proxy format with detailed errors
    function validateProxyList(lines) {
      const validProxies = [];
      const invalidProxies = [];
      const errors = [];

      if (lines.length === 0) {
        return {
          valid: [],
          invalid: [],
          errors: ['Proxy list is empty'],
          hasErrors: true
        };
      }

      lines.forEach((line, index) => {
        let proxy = line.trim();
        let original = proxy;
        let authPart = '';

        // Handle user:pass@ip:port format
        if (proxy.includes('@')) {
          const parts = proxy.split('@');
          if (parts.length !== 2) {
            invalidProxies.push(original + ' - error (invalid auth format)');
            errors.push(`Line ${index + 1}: Invalid format. Use user:pass@ip:port`);
            return;
          }
          authPart = parts[0];
          proxy = parts[1]; // Get ip:port part for validation

          // Validate auth part
          const authParts = authPart.split(':');
          if (authParts.length !== 2 || !authParts[0] || !authParts[1]) {
            invalidProxies.push(original + ' - error (invalid credentials)');
            errors.push(`Line ${index + 1}: Credentials must be in format user:pass`);
            return;
          }
        }

        // Validate host:port format
        if (!isValidProxy(proxy)) {
          invalidProxies.push(original + ' - error (invalid format)');

          // More specific error
          if (!proxy.includes(':')) {
            errors.push(`Line ${index + 1}: Missing port. Format: host:port or user:pass@host:port`);
          } else {
            const [host, port] = proxy.split(':');
            if (!host) {
              errors.push(`Line ${index + 1}: Host/IP address is empty`);
            } else if (!port) {
              errors.push(`Line ${index + 1}: Port is empty`);
            } else {
              const portNum = parseInt(port);
              if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                errors.push(`Line ${index + 1}: Invalid port "${port}" (must be 1-65535)`);
              } else {
                errors.push(`Line ${index + 1}: Invalid host "${host}". Use IP (e.g., 192.168.1.1) or domain (e.g., proxy.example.com)`);
              }
            }
          }
          return;
        }

        validProxies.push(original);
      });

      return {
        valid: validProxies,
        invalid: invalidProxies,
        errors: errors,
        hasErrors: errors.length > 0
      };
    }

    // Save Proxy Configuration
    async function saveProxyConfig() {
      try {
        const proxyText = document.getElementById('proxyList').value.trim();
        const protocolInput = document.querySelector('input[name="proxyProtocol"]:checked');

        // Validate protocol selection
        if (!protocolInput) {
          showProxyResponse('Please select a protocol (HTTP/SOCKS4/SOCKS5)', 'danger');
          return;
        }

        const protocol = protocolInput.value;

        // Validate proxy list
        if (!proxyText) {
          showProxyResponse('Please enter proxy list (format: ip:port or user:pass@ip:port)', 'danger');
          document.getElementById('proxyList').focus();
          return;
        }

        const lines = proxyText.split('\n').filter(l => l.trim());
        const validation = validateProxyList(lines);

        if (validation.hasErrors) {
          // Show invalid proxies in textarea
          if (validation.invalid.length > 0) {
            document.getElementById('proxyList').value = validation.invalid.join('\n');
          }

          // Show detailed errors
          const errorMsg = 'Invalid proxies found:<br>' + validation.errors.slice(0, 5).join('<br>');
          if (validation.errors.length > 5) {
            showProxyResponse(errorMsg + '<br>...and ' + (validation.errors.length - 5) + ' more errors', 'danger');
          } else {
            showProxyResponse(errorMsg, 'danger');
          }
          return;
        }

        if (validation.valid.length === 0) {
          showProxyResponse('No valid proxies found in the list', 'danger');
          return;
        }

        showProxyResponse(`Adding ${validation.valid.length} proxy(ies)...`, 'info');

        const response = await fetch(`${API_LEGACY}/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proxies: validation.valid,
            protocol: protocol
          })
        });

        const result = await response.text();

        if (result === 'true') {
          showProxyResponse(`✓ Successfully added ${validation.valid.length} proxy(ies)!`, 'success');
          setTimeout(() => {
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('proxyConfigModal'));
            if (modalInstance) modalInstance.hide();
            document.getElementById('proxyList').value = '';
          }, 1500);
        } else {
          showProxyResponse('Failed to add proxies to backend', 'danger');
        }
      } catch (error) {
        console.error('Proxy config error:', error);
        showProxyResponse('Network error: ' + error.message, 'danger');
      }
    }

    function showSMTPResponse(message, type) {
      const alertClass = type === 'success' ? 'alert-success' : type === 'danger' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
      document.getElementById('smtpConfigResponse').innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    }

    function showProxyResponse(message, type) {
      const alertClass = type === 'success' ? 'alert-success' : type === 'danger' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
      document.getElementById('proxyConfigResponse').innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    }

    // Cookie Functions for Sender Info
    function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    // Load sender info from cookies on page load
    document.addEventListener('DOMContentLoaded', function() {
      const senderName = getCookie('twilio_sender_stored');
      const senderAddress = getCookie('address_stored');
      const link = getCookie('link');

      if (senderName && document.getElementById('sender-name')) {
        document.getElementById('sender-name').value = senderName;
      }
      if (senderAddress && document.getElementById('sender-address')) {
        document.getElementById('sender-address').value = senderAddress;
      }
      if (link && document.getElementById('campaign-link')) {
        document.getElementById('campaign-link').value = link;
      }

      // Load campaigns list if on campaigns section
      if (document.getElementById('campaigns-section')) {
        loadCampaignsList();
        startCampaignsPolling();
      }
    });

    // Campaigns Management
    let campaignsPollingInterval = null;

    async function loadCampaignsList() {
      try {
        const response = await fetch(`${API_BASE}/campaigns`);
        const data = await response.json();

        if (data.success) {
          renderCampaignsList(data.campaigns);
          updateDashboardWithCampaignStats(data.campaigns);
        } else {
          throw new Error(data.error || 'Failed to load campaigns');
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        document.getElementById('campaigns-list-container').innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i> Failed to load campaigns. Please try again.
          </div>
        `;
      }
    }

    function renderCampaignsList(campaigns) {
      const container = document.getElementById('campaigns-list-container');

      if (!campaigns || campaigns.length === 0) {
        container.innerHTML = `
          <div class="text-center" style="padding: 60px 20px;">
            <i class="fas fa-inbox fa-4x" style="color: rgba(255,255,255,0.3);"></i>
            <h4 style="margin-top: 20px; color: rgba(255,255,255,0.6);">No Campaigns Yet</h4>
            <p style="color: rgba(255,255,255,0.4);">Click "New Campaign" to create your first campaign</p>
          </div>
        `;
        return;
      }

      // Save existing terminals before rebuilding DOM
      const existingTerminals = {};
      campaigns.forEach(campaign => {
        const terminal = document.getElementById(`campaign-terminal-${campaign.id}`);
        if (terminal) {
          existingTerminals[campaign.id] = terminal.cloneNode(true);
        }
      });

      const campaignsHTML = campaigns.map(campaign => {
        const statusColor = {
          'draft': 'secondary',
          'active': 'primary',
          'sending': 'warning',
          'completed': 'success',
          'paused': 'info',
          'failed': 'danger'
        }[campaign.status] || 'secondary';

        return `
          <div class="card" style="margin-bottom: 20px;" data-campaign-id="${campaign.id}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <h5 style="margin: 0 0 10px 0;">
                  ${escapeHTML(campaign.name)}
                  <span class="badge bg-${statusColor}" style="margin-left: 10px;">${campaign.status}</span>
                  <span class="badge bg-secondary">${campaign.mode}</span>
                </h5>
                <div class="campaign-stats-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0;">
                  <div>
                    <small style="color: rgba(255,255,255,0.6);">Total</small>
                    <div class="stat-total" style="font-size: 1.5rem; font-weight: bold;">${campaign.stats.total || 0}</div>
                  </div>
                  <div>
                    <small style="color: rgba(255,255,255,0.6);">Sent</small>
                    <div class="stat-sent" style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">${campaign.stats.sent || 0}</div>
                  </div>
                  <div>
                    <small style="color: rgba(255,255,255,0.6);">Failed</small>
                    <div class="stat-failed" style="font-size: 1.5rem; font-weight: bold; color: var(--danger-color);">${campaign.stats.failed || 0}</div>
                  </div>
                  <div>
                    <small style="color: rgba(255,255,255,0.6);">Success Rate</small>
                    <div class="stat-success-rate" style="font-size: 1.5rem; font-weight: bold;">${campaign.stats.successRate || 0}%</div>
                  </div>
                </div>
                <small style="color: rgba(255,255,255,0.5);">
                  Created: ${new Date(campaign.createdAt).toLocaleString()} |
                  Updated: ${new Date(campaign.updatedAt).toLocaleString()}
                </small>
              </div>
              <div style="display: flex; gap: 10px; margin-left: 20px;">
                <button class="btn btn-sm btn-info" onclick="viewCampaignDetails('${campaign.id}')" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="runCampaignNow('${campaign.id}')" title="Run Campaign">
                  <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editCampaignModal('${campaign.id}')" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCampaignConfirm('${campaign.id}')" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = campaignsHTML;

      // Reattach existing terminals after DOM rebuild
      Object.keys(existingTerminals).forEach(campaignId => {
        const campaignCard = document.querySelector(`[data-campaign-id="${campaignId}"]`);
        if (campaignCard) {
          campaignCard.appendChild(existingTerminals[campaignId]);
        }
      });
    }

    function escapeHTML(text) {
      const div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }

    // Handle modal mode change
    function handleModalModeChange() {
      const mode = document.getElementById('modal-campaign-mode').value;
      const emailGroup = document.getElementById('modal-sender-email-group');
      const carrierGroup = document.getElementById('modal-carrier-group');
      const subjectGroup = document.getElementById('modal-subject-group');
      const recipientsLabel = document.getElementById('modal-recipients-label');

      if (mode === 'email') {
        emailGroup.style.display = 'block';
        carrierGroup.style.display = 'none';
        subjectGroup.style.display = 'block';
        recipientsLabel.textContent = 'Email Addresses (one per line) *';
        document.getElementById('modal-sender-email').required = false; // Optional in bulk mode
        document.getElementById('modal-campaign-subject').required = true;
        document.getElementById('modal-campaign-carrier').required = false;
      } else {
        emailGroup.style.display = 'none';
        carrierGroup.style.display = 'block';
        subjectGroup.style.display = 'none';
        recipientsLabel.textContent = 'Phone Numbers (one per line) *';
        document.getElementById('modal-sender-email').required = false;
        document.getElementById('modal-campaign-subject').required = false;
        document.getElementById('modal-campaign-carrier').required = true;
      }
    }

    // Create campaign from modal
    async function createCampaignFromModal(event) {
      event.preventDefault();

      const mode = document.getElementById('modal-campaign-mode').value;
      const name = document.getElementById('modal-campaign-name').value.trim();
      const senderName = document.getElementById('modal-sender-name').value.trim();
      const senderEmail = document.getElementById('modal-sender-email').value.trim();
      const subject = document.getElementById('modal-campaign-subject').value.trim();
      const message = document.getElementById('modal-campaign-message').value.trim();

      // Get link configuration (direct link or redirector list)
      const linkConfig = getCampaignLinkConfig('modal');
      const link = linkConfig.type === 'direct' ? linkConfig.value : '';

      const recipientsText = document.getElementById('modal-campaign-recipients').value.trim();
      const carrier = document.getElementById('modal-campaign-carrier').value;
      const delay = document.getElementById('modal-send-delay').value;

      // Validate campaign name
      if (!name) {
        showTempAlert('Campaign name is required', 'danger');
        document.getElementById('modal-campaign-name').focus();
        return;
      }

      if (name.length < 3) {
        showTempAlert('Campaign name must be at least 3 characters', 'danger');
        document.getElementById('modal-campaign-name').focus();
        return;
      }

      // Validate sender name
      if (!senderName) {
        showTempAlert('Sender name is required', 'danger');
        document.getElementById('modal-sender-name').focus();
        return;
      }

      // Mode-specific validation
      if (mode === 'email') {
        // Validate sender email
        if (!senderEmail) {
          showTempAlert('Sender email is required for email campaigns', 'danger');
          document.getElementById('modal-sender-email').focus();
          return;
        }

        if (!isValidEmail(senderEmail)) {
          showTempAlert('Please enter a valid sender email address', 'danger');
          document.getElementById('modal-sender-email').focus();
          return;
        }

        // Validate subject
        if (!subject) {
          showTempAlert('Subject is required for email campaigns', 'danger');
          document.getElementById('modal-campaign-subject').focus();
          return;
        }

        if (subject.length < 3) {
          showTempAlert('Subject must be at least 3 characters', 'danger');
          document.getElementById('modal-campaign-subject').focus();
          return;
        }
      } else {
        // SMS mode - validate carrier
        if (!carrier) {
          showTempAlert('Please select an SMS carrier', 'danger');
          document.getElementById('modal-campaign-carrier').focus();
          return;
        }
      }

      // Validate message (optional for email with attachments, but recommended)
      if (!message && mode === 'sms') {
        showTempAlert('Message is required for SMS campaigns', 'danger');
        document.getElementById('modal-campaign-message').focus();
        return;
      }

      // Validate link format if provided
      if (link) {
        try {
          new URL(link);
        } catch (e) {
          showTempAlert('Please enter a valid URL (must start with http:// or https://)', 'danger');
          document.getElementById('modal-campaign-link').focus();
          return;
        }
      }

      // Validate recipients
      if (!recipientsText) {
        showTempAlert(`Please enter at least one recipient ${mode === 'email' ? 'email' : 'phone number'}`, 'danger');
        document.getElementById('modal-campaign-recipients').focus();
        return;
      }

      const recipients = recipientsText.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean);

      if (recipients.length === 0) {
        showTempAlert('No valid recipients found', 'danger');
        document.getElementById('modal-campaign-recipients').focus();
        return;
      }

      // Validate email recipients
      if (mode === 'email') {
        const invalidEmails = [];
        recipients.forEach((email, index) => {
          if (!isValidEmail(email)) {
            invalidEmails.push(`Line ${index + 1}: ${email}`);
          }
        });

        if (invalidEmails.length > 0) {
          const errorMsg = 'Invalid email addresses found:\n' + invalidEmails.slice(0, 5).join('\n');
          if (invalidEmails.length > 5) {
            showTempAlert(errorMsg + '\n...and ' + (invalidEmails.length - 5) + ' more', 'danger');
          } else {
            showTempAlert(errorMsg, 'danger');
          }
          document.getElementById('modal-campaign-recipients').focus();
          return;
        }
      }

      // Validate delay
      if (isNaN(delay) || delay < 0) {
        showTempAlert('Send delay must be a positive number', 'danger');
        document.getElementById('modal-send-delay').focus();
        return;
      }

      // Build campaign data
      const campaignData = {
        name: name,
        mode: mode,
        sender: {
          name: senderName,
          email: mode === 'email' ? senderEmail : ''
        },
        content: {
          subject: mode === 'email' ? subject : '',
          message: message,
          link: link,
          linkConfig: linkConfig // Include link configuration for rotation
        },
        recipients: recipients,
        options: {
          useProxy: document.getElementById('modal-use-proxy').checked,
          linkProtection: { enabled: document.getElementById('modal-protect-links').checked, level: 'high' },
          delay: parseInt(delay) || 500
        }
      };

      if (mode === 'sms') {
        campaignData.carrier = carrier;
      }

      try {
        const response = await fetch(`${API_BASE}/campaigns/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        });

        const result = await response.json();

        if (result.success) {
          // Close modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('newCampaignModal'));
          modal.hide();

          // Reset form
          document.getElementById('newCampaignForm').reset();

          // Show success message
          showTempAlert('Campaign created successfully!', 'success');

          // Reload campaigns list
          loadCampaignsList();

          // Save sender info to cookies
          setCookie('twilio_sender_stored', campaignData.sender.name, 3);
          if (campaignData.sender.email) {
            setCookie('address_stored', campaignData.sender.email, 3);
          }
          if (campaignData.content.link) {
            setCookie('link', campaignData.content.link, 3);
          }
        } else {
          showTempAlert('Failed to create campaign: ' + (result.error || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('Error creating campaign:', error);
        showTempAlert('Error creating campaign: ' + error.message, 'danger');
      }
    }

    // View campaign details
    async function viewCampaignDetails(id) {
      try {
        const response = await fetch(`${API_BASE}/campaigns/${id}`);
        const data = await response.json();

        if (data.success) {
          const campaign = data.campaign;
          alert(`Campaign: ${campaign.name}\nMode: ${campaign.mode}\nStatus: ${campaign.status}\n\nStats:\nTotal: ${campaign.stats.total}\nSent: ${campaign.stats.sent}\nFailed: ${campaign.stats.failed}\nSuccess Rate: ${campaign.stats.successRate}%`);
        }
      } catch (error) {
        showTempAlert('Failed to load campaign details', 'danger');
      }
    }

    // Validate campaign data before running
    function validateCampaignData(campaign) {
      const errors = [];

      // Basic validation
      if (!campaign.name) errors.push('Campaign name is required');
      if (!campaign.mode) errors.push('Campaign mode is required');
      if (!campaign.recipients || campaign.recipients.length === 0) {
        errors.push('At least one recipient is required');
      }

      // Mode-specific validation
      if (campaign.mode === 'email') {
        if (!campaign.sender?.name) errors.push('Sender name is required');
        // Sender email is optional in bulk mode - SMTP account email will be used
        if (!campaign.content?.subject) errors.push('Email subject is required');
        if (!campaign.content?.message) errors.push('Message content is required');
      } else if (campaign.mode === 'sms') {
        if (!campaign.sender?.name) errors.push('Sender name is required');
        if (!campaign.carrier) errors.push('SMS carrier is required');
        if (!campaign.content?.message) errors.push('Message content is required');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    }

    // Run campaign with validation and live logs
    let runningCampaigns = new Map(); // Track running campaigns

    async function runCampaignNow(id) {
      // Check if already running
      if (runningCampaigns.has(id)) {
        showTempAlert('Campaign is already running', 'warning');
        return;
      }

      try {
        // Fetch campaign data
        const response = await fetch(`${API_BASE}/campaigns/${id}`);
        const data = await response.json();

        if (!data.success) {
          showTempAlert('Failed to load campaign data', 'danger');
          return;
        }

        const campaign = data.campaign;

        // Validate campaign data
        const validation = validateCampaignData(campaign);
        if (!validation.valid) {
          // Show detailed error modal
          const errorList = validation.errors.map(err => `<li style="margin-bottom: 8px;"><i class="fas fa-times-circle" style="color: #ef4444;"></i> ${err}</li>`).join('');
          const errorHTML = `
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <h5 style="color: #ef4444; margin-bottom: 15px;"><i class="fas fa-exclamation-triangle"></i> Campaign Validation Failed</h5>
              <p style="margin-bottom: 10px;">Please fix the following issues before running this campaign:</p>
              <ul style="list-style: none; padding-left: 0;">${errorList}</ul>
            </div>
          `;
          showTempAlert(errorHTML, 'danger', 8000);
          return;
        }

        // Confirm before running
        if (!confirm(`Are you sure you want to start "${campaign.name}"?\n\nRecipients: ${campaign.recipients.length}\nMode: ${campaign.mode.toUpperCase()}`)) {
          return;
        }

        // Mark as running
        runningCampaigns.set(id, true);

        // Create terminal log display beneath campaign card
        createCampaignTerminal(id, campaign.name);

        // Log start message
        appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Starting campaign: ${campaign.name}`, 'info');
        appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Mode: ${campaign.mode.toUpperCase()}`, 'info');
        appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Recipients: ${campaign.recipients.length}`, 'info');
        appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Delay: ${campaign.options?.delay || 0}ms between sends`, 'info');

        // Update campaign status to 'sending'
        const updateResponse = await fetch(`${API_BASE}/campaigns/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'sending' })
        });

        if (updateResponse.ok) {
          appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Campaign status updated to SENDING`, 'success');

          // Execute campaign based on mode
          if (campaign.mode === 'sms') {
            // SMS Campaign Execution
            appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Executing SMS campaign via ${campaign.carrier} gateway...`, 'info');

            try {
              const smsResponse = await fetch(`${API_LEGACY}/campaign/execute-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  campaignId: id,
                  carrier: campaign.carrier,
                  recipients: campaign.recipients,
                  message: campaign.content.message,
                  sender: campaign.sender?.name || 'SMS Gateway',
                  delay: campaign.options?.delay || 1000
                })
              });

              const smsResult = await smsResponse.json();

              if (smsResult.success) {
                const results = smsResult.results;
                appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ✓ Sent ${results.sent}/${results.total} messages (${results.successRate}% success rate)`, results.sent === results.total ? 'success' : 'warning');

                if (results.failed > 0) {
                  appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ⚠ ${results.failed} messages failed`, 'warning');
                  // Log first few failures
                  results.failedList.slice(0, 3).forEach(fail => {
                    appendCampaignLog(id, `[${new Date().toLocaleTimeString()}]   • ${fail.phoneNumber}: ${fail.error}`, 'error');
                  });
                  if (results.failedList.length > 3) {
                    appendCampaignLog(id, `[${new Date().toLocaleTimeString()}]   ... and ${results.failedList.length - 3} more failures`, 'error');
                  }
                }

                // Update campaign status to completed
                await fetch(`${API_BASE}/campaigns/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    status: 'completed',
                    stats: {
                      sent: results.sent,
                      failed: results.failed,
                      total: results.total,
                      successRate: results.successRate,
                      completedAt: new Date().toISOString()
                    }
                  })
                });

                appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Campaign completed`, 'success');
              } else {
                appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ERROR: ${smsResult.error}`, 'error');
              }

            } catch (error) {
              appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ERROR: ${error.message}`, 'error');
            }

          } else {
            // Email Campaign Execution with WebSocket (Real-time updates)
            appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Executing email campaign...`, 'info');
            appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Recipients: ${campaign.recipients.length}`, 'info');
            appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] Subject: ${campaign.content.subject}`, 'info');

            try {
              await executeEmailCampaignViaWebSocket(id, campaign);
            } catch (error) {
              const errorMessage = error?.message || error?.error || String(error) || 'Unknown error occurred';
              appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ERROR: ${errorMessage}`, 'error');
              console.error('Campaign execution error:', error);

              // Update to failed status
              await fetch(`${API_BASE}/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: 'failed',
                  error: errorMessage
                })
              });
            }
          }

          // Mark as not running and refresh list
          runningCampaigns.delete(id);
          loadCampaignsList();

        } else {
          appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ERROR: Failed to update campaign status`, 'error');
          runningCampaigns.delete(id);
        }

      } catch (error) {
        appendCampaignLog(id, `[${new Date().toLocaleTimeString()}] ERROR: ${error.message}`, 'error');
        runningCampaigns.delete(id);
        showTempAlert('Failed to start campaign: ' + error.message, 'danger');
      }
    }

    // Execute email campaign via WebSocket with real-time updates
    async function executeEmailCampaignViaWebSocket(campaignId, campaign) {
      return new Promise((resolve, reject) => {
        const sessionId = `campaign-${campaignId}-${Date.now()}`;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:9090' : window.location.host;
        const wsUrl = `${protocol}//${host}/ws/email-campaign/${sessionId}`;

        appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] 🔌 Connecting to campaign server...`, 'info');
        console.log(`Connecting to WebSocket: ${wsUrl}`);

        let ws;
        let connectionTimeout;
        let isConnected = false;

        try {
          ws = new WebSocket(wsUrl);
        } catch (error) {
          const msg = `Failed to create WebSocket: ${error?.message || 'Unknown error'}`;
          appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] ❌ ${msg}`, 'error');
          return reject(new Error(msg));
        }

        // Set connection timeout (15 seconds)
        connectionTimeout = setTimeout(() => {
          if (!isConnected) {
            appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] ⏱️ Connection timeout`, 'error');
            ws.close();
            reject(new Error('WebSocket connection timeout after 15 seconds'));
          }
        }, 15000);

        let currentProgress = { sent: 0, failed: 0, total: campaign.recipients.length };

        ws.onopen = () => {
          isConnected = true;
          clearTimeout(connectionTimeout);
          appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] ✓ Connected to server`, 'success');
          console.log('WebSocket connection established');

          // Send campaign start command
          ws.send(JSON.stringify({
            type: 'start',
            payload: {
              campaignId,
              recipients: campaign.recipients,
              subject: campaign.content.subject || 'No Subject',
              message: campaign.content.message,
              sender: campaign.sender?.name || 'Email Gateway',
              senderAd: campaign.sender?.email || 'noreply@example.com',
              useProxy: campaign.options?.useProxy || false,
              delay: campaign.options?.delay || 500,
              protectLinks: campaign.options?.protectLinks || false,
              linkProtectionLevel: campaign.options?.linkProtectionLevel || 'high',
              attachmentIds: campaign.attachments || []
            }
          }));
        };

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            // Connection confirmed
            console.log('WebSocket connection confirmed:', data.sessionId);

          } else if (data.type === 'start') {
            appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] 🚀 Campaign started`, 'info');

          } else if (data.type === 'progress') {
            // Real-time progress update
            currentProgress = { sent: data.sent, failed: data.failed, total: data.progress.total };
            const percentage = data.progress.percentage;

            appendCampaignLog(
              campaignId,
              `[${new Date().toLocaleTimeString()}] 📧 Sending to ${data.currentRecipient} via ${data.currentSmtp} (${data.progress.current}/${data.progress.total} - ${percentage}%)`,
              'info'
            );

            // Update campaign stats in real-time
            updateCampaignStatsDisplay(campaignId, currentProgress);

          } else if (data.type === 'sent') {
            // Successful send
            appendCampaignLog(
              campaignId,
              `[${new Date().toLocaleTimeString()}] ✓ Sent to ${data.recipient} via ${data.smtp}`,
              'success'
            );

          } else if (data.type === 'failed') {
            // Failed send
            appendCampaignLog(
              campaignId,
              `[${new Date().toLocaleTimeString()}] ✗ Failed to ${data.recipient}: ${data.error}`,
              'error'
            );

          } else if (data.type === 'completed') {
            // Campaign completed
            const results = data.results;
            appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] ✅ Campaign completed!`, 'success');
            appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] Sent: ${results.sent}/${results.total} (${results.successRate}% success rate)`, results.successRate === 100 ? 'success' : 'warning');

            if (results.failed > 0) {
              appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] Failed: ${results.failed}`, 'warning');
            }

            // Update campaign status to completed
            await fetch(`${API_BASE}/campaigns/${campaignId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'completed',
                stats: {
                  sent: results.sent,
                  failed: results.failed,
                  total: results.total,
                  successRate: results.successRate,
                  completedAt: new Date().toISOString()
                }
              })
            });

            ws.close();
            resolve(results);

          } else if (data.type === 'error') {
            appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] ❌ ERROR: ${data.error}`, 'error');

            // Update campaign to failed status
            await fetch(`${API_BASE}/campaigns/${campaignId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'failed',
                error: data.error
              })
            });

            ws.close();
            reject(new Error(data.error));
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          const errorMsg = error?.message || error?.error || 'WebSocket connection failed';
          appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] ❌ WebSocket error: ${errorMsg}`, 'error');
          console.error('WebSocket error details:', error);
          reject(new Error(errorMsg));
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          const closeReason = event.wasClean
            ? `Connection closed cleanly (code: ${event.code})`
            : `Connection closed unexpectedly (code: ${event.code})`;
          appendCampaignLog(campaignId, `[${new Date().toLocaleTimeString()}] 🔌 ${closeReason}`, event.wasClean ? 'info' : 'warning');
          console.log(`WebSocket closed: wasClean=${event.wasClean}, code=${event.code}, reason=${event.reason}`);

          // If connection closed before completion, reject the promise
          if (!event.wasClean && !isConnected) {
            reject(new Error(`WebSocket connection closed unexpectedly (code: ${event.code})`));
          }
        };
      });
    }

    // Update campaign stats display in real-time
    function updateCampaignStatsDisplay(campaignId, stats) {
      const campaignCard = document.querySelector(`[data-campaign-id="${campaignId}"]`);
      if (!campaignCard) return;

      // Calculate success rate
      const successRate = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

      // Update individual stat elements
      const totalEl = campaignCard.querySelector('.stat-total');
      const sentEl = campaignCard.querySelector('.stat-sent');
      const failedEl = campaignCard.querySelector('.stat-failed');
      const successRateEl = campaignCard.querySelector('.stat-success-rate');

      if (totalEl) totalEl.textContent = stats.total || 0;
      if (sentEl) sentEl.textContent = stats.sent || 0;
      if (failedEl) failedEl.textContent = stats.failed || 0;
      if (successRateEl) successRateEl.textContent = `${successRate}%`;
    }

    // Create terminal-style log display beneath campaign
    function createCampaignTerminal(id, campaignName) {
      // Remove existing terminal if any
      const existingTerminal = document.getElementById(`campaign-terminal-${id}`);
      if (existingTerminal) {
        existingTerminal.remove();
      }

      // Find campaign card
      const campaignCard = document.querySelector(`[data-campaign-id="${id}"]`)?.closest('.card');
      if (!campaignCard) return;

      // Create terminal element
      const terminal = document.createElement('div');
      terminal.id = `campaign-terminal-${id}`;
      terminal.style.cssText = `
        background: #0d1117;
        color: #c9d1d9;
        padding: 15px;
        border-radius: 6px;
        margin-top: 15px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        max-height: 300px;
        overflow-y: auto;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
      `;
      terminal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #30363d;">
          <div style="display: flex; gap: 5px; align-items: center;">
            <span style="color: #58a6ff;">●</span>
            <span style="font-weight: bold;">Campaign Log: ${escapeHTML(campaignName)}</span>
          </div>
          <button onclick="closeCampaignTerminal('${id}')" style="background: none; border: none; color: #8b949e; cursor: pointer; font-size: 16px;" title="Close">✕</button>
        </div>
        <div id="campaign-log-${id}" style="white-space: pre-wrap; word-break: break-word;"></div>
      `;

      campaignCard.appendChild(terminal);
    }

    // Append log message to campaign terminal
    function appendCampaignLog(id, message, type = 'info') {
      const logContainer = document.getElementById(`campaign-log-${id}`);
      if (!logContainer) return;

      const colors = {
        info: '#58a6ff',
        success: '#3fb950',
        warning: '#d29922',
        error: '#f85149'
      };

      const logEntry = document.createElement('div');
      logEntry.style.color = colors[type] || colors.info;
      logEntry.textContent = message;
      logContainer.appendChild(logEntry);

      // Auto-scroll to bottom
      const terminal = document.getElementById(`campaign-terminal-${id}`);
      if (terminal) {
        terminal.scrollTop = terminal.scrollHeight;
      }
    }

    // Close campaign terminal
    function closeCampaignTerminal(id) {
      const terminal = document.getElementById(`campaign-terminal-${id}`);
      if (terminal) {
        terminal.style.opacity = '0';
        terminal.style.transition = 'opacity 0.3s';
        setTimeout(() => terminal.remove(), 300);
      }
    }

    // Edit campaign - Load campaign data and show in new campaign page
    let editingCampaignId = null;

    async function editCampaignModal(id) {
      try {
        const response = await fetch(`${API_BASE}/campaigns/${id}`);
        const data = await response.json();

        if (data.success) {
          const campaign = data.campaign;
          editingCampaignId = id;

          // Populate new campaign page with campaign data
          document.getElementById('page-campaign-name').value = campaign.name;
          document.getElementById('page-campaign-mode').value = campaign.mode;
          document.getElementById('page-sender-name').value = campaign.sender?.name || '';
          document.getElementById('page-sender-email').value = campaign.sender?.email || '';
          document.getElementById('page-campaign-subject').value = campaign.content?.subject || '';
          document.getElementById('page-campaign-message').value = campaign.content?.message || '';
          document.getElementById('page-campaign-link').value = campaign.content?.link || '';
          document.getElementById('page-campaign-recipients').value = (campaign.recipients || []).join('\n');
          document.getElementById('page-campaign-carrier').value = campaign.carrier || '';

          if (campaign.options) {
            document.getElementById('page-use-proxy').checked = campaign.options.useProxy || false;
            document.getElementById('page-protect-links').checked = campaign.options.protectLinks || false;
            document.getElementById('page-send-delay').value = campaign.options.delay || 500;
          }

          // Select attachments if any
          if (campaign.attachments && campaign.attachments.length > 0) {
            const attachmentSelect = document.getElementById('page-campaign-attachments');
            Array.from(attachmentSelect.options).forEach(option => {
              option.selected = campaign.attachments.includes(option.value);
            });
          }

          // Update button text to "Update Campaign"
          document.getElementById('createStepBtn').textContent = 'Update Campaign';

          // Show new campaign page
          currentCampaignStep = 1;
          switchSection('new-campaign');
          updateCampaignStepDisplay();
          setupCampaignModeHandler();
          loadAttachmentsDropdown();
        } else {
          showTempAlert('Failed to load campaign data', 'danger');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        showTempAlert('Error loading campaign: ' + error.message, 'danger');
      }
    }

    // Update campaign from modal
    async function updateCampaignFromModal(id) {
      const mode = document.getElementById('modal-campaign-mode').value;
      const campaignData = {
        name: document.getElementById('modal-campaign-name').value.trim(),
        mode: mode,
        sender: {
          name: document.getElementById('modal-sender-name').value.trim(),
          email: mode === 'email' ? document.getElementById('modal-sender-email').value.trim() : ''
        },
        content: {
          subject: mode === 'email' ? document.getElementById('modal-campaign-subject').value.trim() : '',
          message: document.getElementById('modal-campaign-message').value.trim(),
          link: document.getElementById('modal-campaign-link').value.trim()
        },
        recipients: document.getElementById('modal-campaign-recipients').value.trim().split(/[\n,;]+/).map(r => r.trim()).filter(Boolean),
        options: {
          useProxy: document.getElementById('modal-use-proxy').checked,
          linkProtection: { enabled: document.getElementById('modal-protect-links').checked, level: 'high' },
          delay: parseInt(document.getElementById('modal-send-delay').value) || 500
        }
      };

      if (mode === 'sms') {
        campaignData.carrier = document.getElementById('modal-campaign-carrier').value;
      }

      try {
        const response = await fetch(`${API_BASE}/campaigns/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        });

        const result = await response.json();

        if (result.success) {
          const modal = bootstrap.Modal.getInstance(document.getElementById('newCampaignModal'));
          modal.hide();
          showTempAlert('Campaign updated successfully!', 'success');
          loadCampaignsList();
        } else {
          showTempAlert('Failed to update campaign: ' + (result.error || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('Error updating campaign:', error);
        showTempAlert('Error updating campaign: ' + error.message, 'danger');
      }
    }

    // Delete campaign
    async function deleteCampaignConfirm(id) {
      if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return;

      try {
        const response = await fetch(`${API_BASE}/campaigns/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          showTempAlert('Campaign deleted successfully!', 'success');
          loadCampaignsList();
        }
      } catch (error) {
        showTempAlert('Failed to delete campaign', 'danger');
      }
    }

    // Real-time stats polling
    function startCampaignsPolling() {
      if (campaignsPollingInterval) clearInterval(campaignsPollingInterval);

      campaignsPollingInterval = setInterval(() => {
        const campaignsSection = document.getElementById('campaigns-section');
        if (campaignsSection && campaignsSection.classList.contains('active')) {
          loadCampaignsList();
        }
      }, 5000); // Poll every 5 seconds
    }

    function updateDashboardWithCampaignStats(campaigns) {
      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'active').length;
      const sendingCampaigns = campaigns.filter(c => c.status === 'sending');
      const totalSent = campaigns.reduce((sum, c) => sum + (c.stats.sent || 0), 0);

      // Update dashboard stats if elements exist
      if (document.getElementById('stat-campaigns-total')) {
        document.getElementById('stat-campaigns-total').textContent = totalCampaigns;
      }
      if (document.getElementById('stat-campaigns-active')) {
        document.getElementById('stat-campaigns-active').textContent = activeCampaigns;
      }
      if (document.getElementById('stat-total-sent')) {
        document.getElementById('stat-total-sent').textContent = totalSent;
      }

      // Update recent activity with running campaigns
      const activityContainer = document.getElementById('recent-activity');
      if (activityContainer) {
        if (sendingCampaigns.length > 0) {
          const activityHTML = sendingCampaigns.map(campaign => `
            <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-paper-plane" style="color: #f59e0b;"></i>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">${escapeHTML(campaign.name)}</div>
                <div style="font-size: 0.85em; color: rgba(255,255,255,0.6);">
                  <span class="badge bg-warning" style="margin-right: 8px;">SENDING</span>
                  ${campaign.mode.toUpperCase()} • ${campaign.recipients.length} recipients
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.2em; font-weight: 600; color: #10b981;">${campaign.stats.sent || 0}</div>
                <div style="font-size: 0.8em; color: rgba(255,255,255,0.5);">sent</div>
              </div>
            </div>
          `).join('');
          activityContainer.innerHTML = activityHTML;
        } else {
          activityContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No active campaigns</p>';
        }
      }
    }

    function showTempAlert(message, type, duration = 4000) {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.style.position = 'fixed';
      alertDiv.style.top = '20px';
      alertDiv.style.right = '20px';
      alertDiv.style.zIndex = '9999';
      alertDiv.style.minWidth = '300px';
      alertDiv.style.maxWidth = '600px';
      alertDiv.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
      alertDiv.innerHTML = `
        <div style="display: flex; align-items: start; gap: 10px;">
          <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
          <div style="flex: 1;">${message}</div>
        </div>
      `;
      document.body.appendChild(alertDiv);

      setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => alertDiv.remove(), 300);
      }, duration);
    }

    // Stop polling when leaving page
    window.addEventListener('beforeunload', () => {
      if (campaignsPollingInterval) clearInterval(campaignsPollingInterval);
    });

    // =================== Navigation System ===================

    // Mobile menu functions
    function toggleMobileMenu() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('mobileOverlay');
      const menuBtn = document.getElementById('mobileMenuBtn');

      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');

      // Change icon
      const icon = menuBtn.querySelector('i');
      if (sidebar.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    }

    function closeMobileMenu() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('mobileOverlay');
      const menuBtn = document.getElementById('mobileMenuBtn');

      sidebar.classList.remove('open');
      overlay.classList.remove('active');

      // Reset icon
      const icon = menuBtn.querySelector('i');
      icon.className = 'fas fa-bars';
    }

    // Switch section function with sidebar highlighting
    function switchSection(sectionName) {
      // Close mobile menu if open
      closeMobileMenu();

      // Remove active class from all nav links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      // Add active class to the clicked link
      const activeLink = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }

      // Hide all sections
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });

      // Show selected section
      const activeSection = document.getElementById(`${sectionName}-section`);
      if (activeSection) {
        activeSection.classList.add('active');
      }

      // Handle section-specific initialization
      if (sectionName === 'campaigns') {
        loadCampaignsList();
        startCampaignsPolling();
        stopProxyConfigPolling();
        stopSmtpConfigPolling();
      } else if (sectionName === 'new-campaign') {
        // Start SMTP config polling for new campaign section
        startSmtpConfigPolling();
        stopProxyConfigPolling();
      } else if (sectionName === 'smtp-profiles') {
        // Start proxy config polling for SMTP profiles section
        startProxyConfigPolling();
        stopSmtpConfigPolling();
      } else if (sectionName === 'inbox-searcher' || sectionName === 'contact-extractor') {
        // Start proxy config polling for these sections
        startProxyConfigPolling();
        stopSmtpConfigPolling();
      } else if (sectionName === 'proxies') {
        // Load proxies list and start polling to reflect real-time changes
        loadProxiesList();
        startProxyConfigPolling();
        stopSmtpConfigPolling();
      } else if (sectionName === 'attachments') {
        // Load attachments list when showing attachments section
        loadAttachmentsList();
        stopProxyConfigPolling();
        stopSmtpConfigPolling();
      } else {
        // Stop all polling when switching to other sections
        stopProxyConfigPolling();
        stopSmtpConfigPolling();
      }
    }

    // Show section (called from Quick Actions)
    function showSection(section) {
      if (section === 'campaign') {
        // Show new campaign page
        showNewCampaignPage();
      } else {
        switchSection(section);
      }
    }

    // =================== New Campaign Page Functions ===================

    let currentCampaignStep = 1;

    // Show new campaign page
    function showNewCampaignPage() {
      currentCampaignStep = 1;
      switchSection('new-campaign');
      updateCampaignStepDisplay();
      resetCampaignForm();
      setupCampaignModeHandler();
      loadAttachmentsDropdown();
    }

    // Setup campaign mode change handler
    function setupCampaignModeHandler() {
      const modeSelect = document.getElementById('page-campaign-mode');

      // Set initial state
      updateFieldsForMode(modeSelect.value);

      // Add change listener
      modeSelect.addEventListener('change', function() {
        updateFieldsForMode(this.value);
      });
    }

    // Update form fields based on campaign mode
    function updateFieldsForMode(mode) {
      const senderEmailGroup = document.getElementById('sender-email-group');
      const subjectGroup = document.getElementById('subject-group');
      const carrierGroup = document.getElementById('carrier-group');
      const attachmentsGroup = document.getElementById('attachments-group');
      const recipientsLabel = document.getElementById('recipients-label');
      const recipientsHint = document.getElementById('recipients-hint');
      const recipientsField = document.getElementById('page-campaign-recipients');

      if (mode === 'sms') {
        // SMS Mode: Hide email/subject/attachments, show carrier
        senderEmailGroup.style.display = 'none';
        subjectGroup.style.display = 'none';
        attachmentsGroup.style.display = 'none';
        carrierGroup.style.display = 'block';
        recipientsLabel.textContent = 'Phone Numbers *';
        recipientsHint.textContent = 'One phone number per line (10 digits)';
        recipientsField.placeholder = '1234567890\n9876543210\n5551234567';
      } else {
        // Email Mode: Show email/subject/attachments, hide carrier
        senderEmailGroup.style.display = 'block';
        subjectGroup.style.display = 'block';
        attachmentsGroup.style.display = 'block';
        carrierGroup.style.display = 'none';
        recipientsLabel.textContent = 'Recipients List *';
        recipientsHint.textContent = 'One email per line';
        recipientsField.placeholder = 'email1@example.com\nemail2@example.com\nemail3@example.com';
      }
    }

    // Load attachments dropdown
    async function loadAttachmentsDropdown() {
      try {
        const response = await fetch(`${API_BASE}/attachments`);
        const data = await response.json();

        const select = document.getElementById('page-campaign-attachments');
        select.innerHTML = '<option value="">No Attachment</option>';

        if (data.success && data.attachments && data.attachments.length > 0) {
          data.attachments.forEach(att => {
            const option = document.createElement('option');
            option.value = att.id;
            option.textContent = `${att.name} (${formatFileSize(att.size)})`;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Error loading attachments:', error);
      }
    }

    // Format file size helper
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Upload attachment
    async function uploadAttachment() {
      const fileInput = document.getElementById('attachment-file');
      const nameInput = document.getElementById('attachment-name');
      const descriptionInput = document.getElementById('attachment-description');
      const useAsHtmlCheckbox = document.getElementById('attachment-use-as-html');

      if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file to upload');
        return;
      }

      const file = fileInput.files[0];
      const name = nameInput.value.trim() || file.name;
      const description = descriptionInput.value.trim();
      const useAsHtmlContent = useAsHtmlCheckbox.checked;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('useAsHtmlContent', useAsHtmlContent);

      try {
        const response = await fetch(`${API_BASE}/attachments/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          showTempAlert('Attachment uploaded successfully', 'success');

          // Clear form
          fileInput.value = '';
          nameInput.value = '';
          descriptionInput.value = '';
          useAsHtmlCheckbox.checked = false;

          // Reload attachments list
          await loadAttachmentsList();
          await loadAttachmentsDropdown();
        } else {
          showTempAlert('Upload failed: ' + data.error, 'error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        showTempAlert('Upload failed. Please try again.', 'error');
      }
    }

    // Load attachments list for display
    async function loadAttachmentsList() {
      try {
        const response = await fetch(`${API_BASE}/attachments`);
        const data = await response.json();

        const listDiv = document.getElementById('attachments-list');

        if (data.success && data.attachments && data.attachments.length > 0) {
          let html = '';
          data.attachments.forEach(att => {
            const htmlBadge = att.useAsHtmlContent ?
              '<span style="background: var(--gradient-primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 10px;">HTML Content</span>' :
              '';

            html += `
              <div class="attachment-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px;">
                <div>
                  <h5 style="margin: 0; color: white; display: flex; align-items: center;">
                    <i class="fas fa-file" style="margin-right: 10px;"></i>
                    ${att.name}
                    ${htmlBadge}
                  </h5>
                  <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                    ${att.description || 'No description'} • ${formatFileSize(att.size)}
                  </p>
                </div>
                <button class="btn btn-danger" onclick="deleteAttachment('${att.id}')" style="margin-left: 15px;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `;
          });
          listDiv.innerHTML = html;
        } else {
          listDiv.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No attachments yet</p>';
        }
      } catch (error) {
        console.error('Error loading attachments list:', error);
      }
    }

    // Delete attachment
    async function deleteAttachment(id) {
      if (!confirm('Are you sure you want to delete this attachment?')) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/attachments/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          showTempAlert('Attachment deleted', 'success');
          await loadAttachmentsList();
          await loadAttachmentsDropdown();
        } else {
          showTempAlert('Delete failed: ' + data.error, 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        showTempAlert('Delete failed. Please try again.', 'error');
      }
    }

    // Navigate to next step
    function nextCampaignStep() {
      if (!validateCampaignStep(currentCampaignStep)) {
        return;
      }

      if (currentCampaignStep < 5) {
        currentCampaignStep++;
        updateCampaignStepDisplay();
      }
    }

    // Navigate to previous step
    function prevCampaignStep() {
      if (currentCampaignStep > 1) {
        currentCampaignStep--;
        updateCampaignStepDisplay();
      }
    }

    // Update step display
    function updateCampaignStepDisplay() {
      // Update progress indicators
      document.querySelectorAll('.campaign-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum < currentCampaignStep) {
          step.classList.add('completed');
        } else if (stepNum === currentCampaignStep) {
          step.classList.add('active');
        }
      });

      // Show/hide form steps
      document.querySelectorAll('.campaign-form-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentCampaignStep) {
          step.classList.add('active');
        }
      });

      // Update buttons
      const prevBtn = document.getElementById('prevStepBtn');
      const nextBtn = document.getElementById('nextStepBtn');
      const createBtn = document.getElementById('createStepBtn');

      if (currentCampaignStep === 1) {
        prevBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'inline-block';
      }

      if (currentCampaignStep === 5) {
        nextBtn.style.display = 'none';
        createBtn.style.display = 'inline-block';
      } else {
        nextBtn.style.display = 'inline-block';
        createBtn.style.display = 'none';
      }
    }

    // Validate current step
    function validateCampaignStep(step) {
      const mode = document.getElementById('page-campaign-mode').value;

      switch(step) {
        case 1:
          const name = document.getElementById('page-campaign-name').value.trim();
          if (!name) {
            showTempAlert('Please enter a campaign name', 'warning');
            return false;
          }
          return true;

        case 2:
          const senderName = document.getElementById('page-sender-name').value.trim();
          if (!senderName) {
            showTempAlert('Please enter sender name', 'warning');
            return false;
          }
          // Sender email is optional in bulk mode - SMTP account email will be used automatically
          return true;

        case 3:
          const message = document.getElementById('page-campaign-message').value.trim();
          if (!message) {
            showTempAlert('Please enter message content', 'warning');
            return false;
          }
          // Only validate subject for email mode
          if (mode === 'email') {
            const subject = document.getElementById('page-campaign-subject').value.trim();
            if (!subject) {
              showTempAlert('Please enter email subject', 'warning');
              return false;
            }
          }
          return true;

        case 4:
          const recipients = document.getElementById('page-campaign-recipients').value.trim();
          if (!recipients) {
            showTempAlert('Please add at least one recipient', 'warning');
            return false;
          }
          // Only validate carrier for SMS mode
          if (mode === 'sms') {
            const carrier = document.getElementById('page-campaign-carrier').value;
            if (!carrier) {
              showTempAlert('Please select a carrier', 'warning');
              return false;
            }
          }
          return true;

        default:
          return true;
      }
    }

    // Create or update campaign from page
    async function createCampaignFromPage() {
      if (!validateCampaignStep(5)) {
        return;
      }

      const mode = document.getElementById('page-campaign-mode').value;

      // Get selected attachments
      const attachmentsSelect = document.getElementById('page-campaign-attachments');
      const selectedAttachments = Array.from(attachmentsSelect.selectedOptions)
        .map(option => option.value)
        .filter(val => val !== '');

      // Get link configuration (direct link or redirector list)
      const pageLinkConfig = getCampaignLinkConfig('page');
      const pageLink = pageLinkConfig.type === 'direct' ? pageLinkConfig.value : '';

      const campaignData = {
        name: document.getElementById('page-campaign-name').value.trim(),
        mode: mode,
        sender: {
          name: document.getElementById('page-sender-name').value.trim()
        },
        content: {
          message: document.getElementById('page-campaign-message').value.trim(),
          link: pageLink,
          linkConfig: pageLinkConfig // Include link configuration for rotation
        },
        recipients: document.getElementById('page-campaign-recipients').value.trim().split('\n').filter(r => r.trim()),
        attachments: selectedAttachments,
        options: {
          useProxy: document.getElementById('page-use-proxy').checked,
          protectLinks: document.getElementById('page-protect-links').checked,
          delay: parseInt(document.getElementById('page-send-delay').value) || 0
        }
      };

      // Add mode-specific fields
      if (mode === 'email') {
        campaignData.sender.email = document.getElementById('page-sender-email').value.trim();
        campaignData.content.subject = document.getElementById('page-campaign-subject').value.trim();
      } else if (mode === 'sms') {
        campaignData.carrier = document.getElementById('page-campaign-carrier').value;
      }

      try {
        let response;
        if (editingCampaignId) {
          // Update existing campaign
          response = await fetch(`${API_BASE}/campaigns/${editingCampaignId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignData)
          });
        } else {
          // Create new campaign
          response = await fetch(`${API_BASE}/campaigns/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignData)
          });
        }

        const result = await response.json();

        if (result.success) {
          showTempAlert(editingCampaignId ? 'Campaign updated successfully!' : 'Campaign created successfully!', 'success');
          // Reset editing state
          editingCampaignId = null;
          document.getElementById('createStepBtn').textContent = 'Create Campaign';
          // Go back to campaigns list
          switchSection('campaigns');
          loadCampaignsList();
        } else {
          showTempAlert('Failed to save campaign: ' + (result.error || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('Error saving campaign:', error);
        showTempAlert('Error saving campaign: ' + error.message, 'danger');
      }
    }

    // Reset campaign form
    function resetCampaignForm() {
      document.getElementById('newCampaignPageForm').reset();
      document.getElementById('page-send-delay').value = '500';
      document.getElementById('page-protect-links').checked = true;
    }

    // =================== Proxies Page Functions ===================

    let proxyModeInPage = 'single'; // single or bulk

    // Toggle between single and bulk mode on Proxies page
    function toggleProxyModeInPage() {
      const toggleBtn = document.getElementById('proxyModeToggleBtn');
      const singleMode = document.getElementById('proxy-single-mode');
      const bulkMode = document.getElementById('proxy-bulk-mode');

      if (proxyModeInPage === 'single') {
        proxyModeInPage = 'bulk';
        toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> SINGLE MODE';
        singleMode.style.display = 'none';
        bulkMode.style.display = 'block';
      } else {
        proxyModeInPage = 'single';
        toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> BULK MODE';
        singleMode.style.display = 'block';
        bulkMode.style.display = 'none';
      }

      // Clear error messages when switching modes
      document.getElementById('proxyConfigResponse').innerHTML = '';
    }

    // Add single proxy
    async function addSingleProxy() {
      const proxyInput = document.getElementById('proxySingleInput').value.trim();
      const protocol = document.querySelector('input[name="proxyProtocolPage"]:checked').value;

      if (!proxyInput) {
        showProxyPageResponse('Please enter a proxy address', 'warning');
        document.getElementById('proxySingleInput').focus();
        return;
      }

      // Clear previous errors
      document.getElementById('proxyConfigResponse').innerHTML = '';

      // Validate proxy format
      const validation = validateProxyList([proxyInput]);

      if (validation.hasErrors) {
        showProxyPageResponse(validation.errors[0], 'danger');
        document.getElementById('proxySingleInput').focus();
        return;
      }

      try {
        const response = await fetch(`${API_LEGACY}/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proxies: [proxyInput],
            protocol: protocol
          })
        });

        const result = await response.json();

        if (result.success) {
          showProxyPageResponse(`✓ Proxy added successfully! (${protocol.toUpperCase()})`, 'success');
          document.getElementById('proxySingleInput').value = '';
          loadProxiesList();
        } else {
          showProxyPageResponse('Failed to add proxy: ' + (result.message || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('Proxy add error:', error);
        showProxyPageResponse('Network error: ' + error.message, 'danger');
      }
    }

    // Handle proxy file upload
    function handleProxyFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const content = e.target.result;
        const textarea = document.getElementById('proxyBulkInput');

        // Append to existing content or replace
        if (textarea.value.trim()) {
          textarea.value += '\n' + content;
        } else {
          textarea.value = content;
        }

        // Show success message
        const lineCount = content.split('\n').filter(l => l.trim()).length;
        showProxyPageResponse(`✓ Loaded ${lineCount} proxies from file "${file.name}"`, 'success');

        // Clear file input
        event.target.value = '';
      };

      reader.onerror = function() {
        showProxyPageResponse('Failed to read file', 'danger');
      };

      reader.readAsText(file);
    }

    // Add bulk proxies
    async function addBulkProxies() {
      const bulkText = document.getElementById('proxyBulkInput').value.trim();
      const protocol = document.querySelector('input[name="proxyProtocolBulkPage"]:checked').value;

      if (!bulkText) {
        showProxyPageResponse('Please enter proxy list', 'warning');
        document.getElementById('proxyBulkInput').focus();
        return;
      }

      // Clear previous errors
      document.getElementById('proxyConfigResponse').innerHTML = '';

      const lines = bulkText.split('\n').filter(l => l.trim());
      const validation = validateProxyList(lines);

      if (validation.hasErrors) {
        // Show invalid proxies in the textarea for user to fix
        if (validation.invalid.length > 0) {
          document.getElementById('proxyBulkInput').value = validation.invalid.join('\n');
        }

        const errorMsg = 'Invalid proxies found:<br>' + validation.errors.slice(0, 5).join('<br>');
        if (validation.errors.length > 5) {
          showProxyPageResponse(errorMsg + '<br>...and ' + (validation.errors.length - 5) + ' more errors', 'danger');
        } else {
          showProxyPageResponse(errorMsg, 'danger');
        }
        document.getElementById('proxyBulkInput').focus();
        return;
      }

      try {
        const response = await fetch(`${API_LEGACY}/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proxies: validation.valid,
            protocol: protocol
          })
        });

        const result = await response.json();

        if (result.success) {
          showProxyPageResponse(`✓ Successfully added ${validation.valid.length} proxy(ies)! (${protocol.toUpperCase()})`, 'success');
          document.getElementById('proxyBulkInput').value = '';
          loadProxiesList();
        } else {
          showProxyPageResponse('Failed to add proxies: ' + (result.message || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('Bulk proxy add error:', error);
        showProxyPageResponse('Network error: ' + error.message, 'danger');
      }
    }

    // Global proxy list state
    let currentProxies = [];
    let failedProxyIndices = [];
    let proxyCurrentPage = 1;
    let proxyItemsPerPage = 20;

    // Load proxies list from backend with pagination
    async function loadProxiesList(page = proxyCurrentPage) {
      try {
        const response = await fetch(`${API_LEGACY}/proxy/list`);
        const data = await response.json();

        const container = document.getElementById('proxyListContainer');
        const count = document.getElementById('proxyCount');

        if (!data.success || data.proxies.length === 0) {
          container.innerHTML = '<p class="text-muted" style="padding: 20px; text-align: center;">No proxies configured yet. Add proxies above to get started.</p>';
          count.textContent = '0';
          document.getElementById('testProxiesBtn').style.display = 'none';
          document.getElementById('removeFailedBtn').style.display = 'none';
          document.getElementById('deleteSelectedBtn').style.display = 'none';
          currentProxies = [];
          return;
        }

        currentProxies = data.proxies;
        count.textContent = data.count;
        proxyCurrentPage = page;

        // Calculate pagination
        const totalPages = Math.ceil(data.proxies.length / proxyItemsPerPage);
        const startIndex = (page - 1) * proxyItemsPerPage;
        const endIndex = startIndex + proxyItemsPerPage;
        const paginatedProxies = data.proxies.slice(startIndex, endIndex);

        // Show action buttons
        document.getElementById('testProxiesBtn').style.display = 'block';

        // Render proxy list with checkboxes
        container.innerHTML = `
          <div style="padding: 0;">
            <div style="display: flex; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1);">
              <input type="checkbox" id="selectAllProxies" onchange="toggleSelectAll(this)" style="margin-right: 15px; width: 18px; height: 18px; cursor: pointer;">
              <label for="selectAllProxies" style="margin: 0; cursor: pointer; user-select: none; flex: 1;">Select All (Page)</label>
              <div style="width: 200px; font-weight: 600; font-size: 0.9rem;">Open Mail Ports</div>
            </div>
            ${paginatedProxies.map((proxy, paginatedIndex) => {
              const actualIndex = startIndex + paginatedIndex;
              return `
              <div class="proxy-row" data-index="${actualIndex}" style="display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); transition: background 0.2s;">
                <input type="checkbox" class="proxy-checkbox" data-index="${actualIndex}" onchange="updateProxySelection()" style="margin-right: 15px; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1; display: flex; align-items: center; gap: 15px;">
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${proxy.host}:${proxy.port}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                      <span style="background: rgba(99, 102, 241, 0.2); padding: 2px 8px; border-radius: 4px; margin-right: 8px;">${proxy.protocol.toUpperCase()}</span>
                      <span id="proxy-status-${actualIndex}" style="padding: 2px 8px; border-radius: 4px; background: rgba(156, 163, 175, 0.2);">
                        <i class="fas fa-question-circle"></i> Unknown
                      </span>
                    </div>
                  </div>
                  <div id="proxy-ports-${actualIndex}" style="width: 200px; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                    -
                  </div>
                  <button class="btn btn-sm btn-outline" onclick="deleteProxy(${actualIndex})" style="padding: 6px 12px;">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>
          ${totalPages > 1 ? `
          <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">
              Showing ${startIndex + 1}-${Math.min(endIndex, data.proxies.length)} of ${data.proxies.length} proxies
            </div>
            <div style="display: flex; gap: 5px;">
              <button class="btn btn-sm btn-outline" onclick="loadProxiesList(1)" ${page === 1 ? 'disabled' : ''} style="padding: 6px 12px;">
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button class="btn btn-sm btn-outline" onclick="loadProxiesList(${page - 1})" ${page === 1 ? 'disabled' : ''} style="padding: 6px 12px;">
                <i class="fas fa-angle-left"></i>
              </button>
              <span style="padding: 6px 12px; color: rgba(255,255,255,0.8);">Page ${page} of ${totalPages}</span>
              <button class="btn btn-sm btn-outline" onclick="loadProxiesList(${page + 1})" ${page === totalPages ? 'disabled' : ''} style="padding: 6px 12px;">
                <i class="fas fa-angle-right"></i>
              </button>
              <button class="btn btn-sm btn-outline" onclick="loadProxiesList(${totalPages})" ${page === totalPages ? 'disabled' : ''} style="padding: 6px 12px;">
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
          ` : ''}
        `;
      } catch (error) {
        console.error('Failed to load proxies:', error);
        const container = document.getElementById('proxyListContainer');
        container.innerHTML = '<p class="text-muted" style="padding: 20px; text-align: center; color: #ef4444;">Failed to load proxies. Please try again.</p>';
      }
    }

    // Toggle select all checkboxes
    function toggleSelectAll(checkbox) {
      const checkboxes = document.querySelectorAll('.proxy-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
      });
      updateProxySelection();
    }

    // Update selection state and button visibility
    function updateProxySelection() {
      const checkboxes = document.querySelectorAll('.proxy-checkbox:checked');
      const testBtn = document.getElementById('testProxiesBtn');
      const downloadBtn = document.getElementById('downloadProxiesBtn');
      const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

      if (checkboxes.length > 0) {
        testBtn.innerHTML = `<i class="fas fa-check-circle"></i> Test Selected (${checkboxes.length})`;
        downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download Selected (${checkboxes.length})`;
        deleteSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> Delete Selected (${checkboxes.length})`;
        downloadBtn.style.display = 'block';
        deleteSelectedBtn.style.display = 'block';
      } else {
        testBtn.innerHTML = '<i class="fas fa-check-circle"></i> Test Selected';
        downloadBtn.style.display = 'none';
        deleteSelectedBtn.style.display = 'none';
      }
    }

    // Test selected proxies with real-time updates
    async function testSelectedProxies() {
      const checkboxes = document.querySelectorAll('.proxy-checkbox:checked');

      if (checkboxes.length === 0) {
        showProxyPageResponse('Please select at least one proxy to test', 'warning');
        return;
      }

      const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
      let testedCount = 0;
      const totalCount = indices.length;

      try {
        showProxyPageResponse(`Testing ${totalCount} proxy(ies)... 0/${totalCount}`, 'info');

        // Set all selected proxies to "Testing..." state
        indices.forEach(index => {
          const statusElement = document.getElementById(`proxy-status-${index}`);
          if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
            statusElement.style.background = 'rgba(59, 130, 246, 0.2)';
            statusElement.style.color = '#3b82f6';
          }
        });

        // Add timeout to fetch (3 minutes for testing multiple proxies)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

        let response;
        try {
          response = await fetch(`${API_LEGACY}/proxy/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ indices: indices }),
            signal: controller.signal
          });
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Proxy test timeout after 3 minutes');
          }
          throw error;
        }

        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.success) {
          failedProxyIndices = [];

          // Update status for each tested proxy
          data.results.forEach((result, idx) => {
            testedCount++;
            if (testedCount === totalCount) {
              // Last one - will show final message later
            } else {
              showProxyPageResponse(`Testing proxies... ${testedCount}/${totalCount}`, 'info');
            }
            const statusElement = document.getElementById(`proxy-status-${result.index}`);
            const portsElement = document.getElementById(`proxy-ports-${result.index}`);

            if (statusElement) {
              if (result.status === 'online') {
                const responseTime = result.responseTime ? ` (${result.responseTime}ms)` : '';
                statusElement.innerHTML = `<i class="fas fa-check-circle"></i> Online${responseTime}`;
                statusElement.style.background = 'rgba(16, 185, 129, 0.2)';
                statusElement.style.color = '#10b981';
                statusElement.title = result.message || 'Proxy is working';

                // Update open ports
                if (portsElement) {
                  if (result.openPorts && result.openPorts.length > 0) {
                    portsElement.innerHTML = result.openPorts.map(p =>
                      `<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; margin-right: 4px; display: inline-block; margin-bottom: 2px;">${p.port} (${p.responseTime}ms)</span>`
                    ).join('');
                  } else {
                    portsElement.innerHTML = '<span style="color: rgba(239, 68, 68, 0.8);">None open</span>';
                  }
                }
              } else {
                statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
                statusElement.style.background = 'rgba(239, 68, 68, 0.2)';
                statusElement.style.color = '#ef4444';
                statusElement.title = result.message || 'Proxy connection failed';
                failedProxyIndices.push(result.index);

                // Clear ports display
                if (portsElement) {
                  portsElement.innerHTML = '-';
                }
              }
            }
          });

          const onlineCount = data.results.filter(r => r.status === 'online').length;
          const failedCount = data.results.filter(r => r.status === 'failed').length;

          showProxyPageResponse(
            `Test complete! ${onlineCount} online, ${failedCount} failed`,
            failedCount > 0 ? 'warning' : 'success'
          );

          // Show remove failed button if there are failed proxies
          if (failedProxyIndices.length > 0) {
            document.getElementById('removeFailedBtn').style.display = 'block';
            document.getElementById('removeFailedBtn').innerHTML =
              `<i class="fas fa-trash"></i> Remove Failed (${failedProxyIndices.length})`;
          } else {
            document.getElementById('removeFailedBtn').style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Proxy test error:', error);
        showProxyPageResponse('Failed to test proxies: ' + error.message, 'danger');

        // Reset all testing proxies back to HTTP status
        indices.forEach(index => {
          const statusElement = document.getElementById(`proxy-status-${index}`);
          if (statusElement) {
            statusElement.innerHTML = '<span style="color: rgba(156, 163, 175, 1);">HTTP</span>';
            statusElement.style.background = 'transparent';
            statusElement.style.color = 'inherit';
          }
        });
      }
    }

    // Download selected proxies
    async function downloadSelectedProxies() {
      const checkboxes = document.querySelectorAll('.proxy-checkbox:checked');

      if (checkboxes.length === 0) {
        showProxyPageResponse('Please select at least one proxy to download', 'warning');
        return;
      }

      try {
        // Get proxy data from backend
        const response = await fetch(`${API_LEGACY}/proxy`);
        const data = await response.json();

        if (!data.success || !data.proxies) {
          showProxyPageResponse('Failed to fetch proxy data', 'danger');
          return;
        }

        const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
        const selectedProxies = data.proxies.filter((_, idx) => selectedIndices.includes(idx));

        // Convert proxies to text format
        const proxyLines = selectedProxies.map(p => {
          if (p.username && p.password) {
            return `${p.host}:${p.port}:${p.username}:${p.password}`;
          } else {
            return `${p.host}:${p.port}`;
          }
        });

        const content = proxyLines.join('\n');
        const filename = `proxies_${Date.now()}.txt`;

        // Create download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showProxyPageResponse(`Downloaded ${selectedProxies.length} proxy(ies) to ${filename}`, 'success');
      } catch (error) {
        console.error('Download proxies error:', error);
        showProxyPageResponse('Failed to download proxies: ' + error.message, 'danger');
      }
    }

    // Remove failed proxies
    async function removeFailedProxies() {
      if (failedProxyIndices.length === 0) {
        showProxyPageResponse('No failed proxies to remove', 'warning');
        return;
      }

      if (!confirm(`Remove ${failedProxyIndices.length} failed proxy(ies)?`)) {
        return;
      }

      try {
        const response = await fetch(`${API_LEGACY}/proxy/remove-failed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ failedIndices: failedProxyIndices })
        });

        const data = await response.json();

        if (data.success) {
          showProxyPageResponse(data.message, 'success');
          failedProxyIndices = [];
          document.getElementById('removeFailedBtn').style.display = 'none';
          loadProxiesList();
        } else {
          showProxyPageResponse('Failed to remove proxies: ' + data.message, 'danger');
        }
      } catch (error) {
        console.error('Remove failed proxies error:', error);
        showProxyPageResponse('Failed to remove proxies: ' + error.message, 'danger');
      }
    }

    // Delete individual proxy
    async function deleteProxy(index) {
      if (!confirm('Delete this proxy?')) {
        return;
      }

      try {
        const response = await fetch(`${API_LEGACY}/proxy/${index}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          showProxyPageResponse('Proxy deleted successfully', 'success');
          loadProxiesList();
        } else {
          showProxyPageResponse('Failed to delete proxy: ' + data.message, 'danger');
        }
      } catch (error) {
        console.error('Delete proxy error:', error);
        showProxyPageResponse('Failed to delete proxy: ' + error.message, 'danger');
      }
    }

    // Delete selected proxies
    async function deleteSelectedProxies() {
      const checkboxes = document.querySelectorAll('.proxy-checkbox:checked');

      if (checkboxes.length === 0) {
        showProxyPageResponse('Please select at least one proxy to delete', 'warning');
        return;
      }

      if (!confirm(`Delete ${checkboxes.length} selected proxy(ies)?`)) {
        return;
      }

      const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
      let deletedCount = 0;
      let errorCount = 0;

      showProxyPageResponse(`Deleting ${indices.length} proxies...`, 'info');

      // Delete proxies sequentially from highest index to lowest to maintain correct indices
      indices.sort((a, b) => b - a);

      for (const index of indices) {
        try {
          const response = await fetch(`${API_LEGACY}/proxy/${index}`, {
            method: 'DELETE'
          });

          const data = await response.json();

          if (data.success) {
            deletedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Delete proxy ${index} error:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        showProxyPageResponse(`✓ Successfully deleted ${deletedCount} proxy(ies)`, 'success');
      } else {
        showProxyPageResponse(`Deleted ${deletedCount} proxy(ies), ${errorCount} failed`, 'warning');
      }

      loadProxiesList();
    }

    // Show response message on Proxies page
    function showProxyPageResponse(message, type) {
      const alertClass = type === 'success' ? 'alert-success' : type === 'danger' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
      document.getElementById('proxyConfigResponse').innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

      setTimeout(() => {
        document.getElementById('proxyConfigResponse').innerHTML = '';
      }, 4000);
    }

    // =================== ChatGPT Functions ===================

    // Save ChatGPT API Key to localStorage
    function saveChatGPTKey() {
      const apiKey = document.getElementById('chatgpt-api-key').value.trim();

      if (!apiKey) {
        showChatGPTResponse('Please enter an API key', 'warning');
        return;
      }

      // Validate key format (OpenAI keys start with 'sk-')
      if (!apiKey.startsWith('sk-')) {
        showChatGPTResponse('Invalid API key format. OpenAI keys start with "sk-"', 'danger');
        return;
      }

      localStorage.setItem('chatgpt_api_key', apiKey);
      showChatGPTResponse('API key saved successfully!', 'success');
    }

    // Load ChatGPT API Key from localStorage
    function loadChatGPTKey() {
      const apiKey = localStorage.getItem('chatgpt_api_key');
      if (apiKey && document.getElementById('chatgpt-api-key')) {
        document.getElementById('chatgpt-api-key').value = apiKey;
      }
      return apiKey;
    }

    // Test ChatGPT API connection
    async function testChatGPTKey() {
      const apiKey = document.getElementById('chatgpt-api-key').value.trim() || loadChatGPTKey();

      if (!apiKey) {
        showChatGPTResponse('Please enter an API key first', 'warning');
        return;
      }

      showChatGPTResponse('Testing connection...', 'info');

      try {
        const response = await fetch(`${API_LEGACY}/chatgpt/rephrase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Hello, this is a test message.',
            apiKey: apiKey
          })
        });

        const result = await response.json();

        if (result.success) {
          showChatGPTResponse('Connection successful! API key is valid.', 'success');
        } else {
          showChatGPTResponse('Connection failed: ' + (result.error || 'Unknown error'), 'danger');
        }
      } catch (error) {
        showChatGPTResponse('Error testing connection: ' + error.message, 'danger');
      }
    }

    // Suggest with AI - Rephrase message
    async function suggestWithAI(textareaId) {
      const textarea = document.getElementById(textareaId);
      const message = textarea.value.trim();
      const apiKey = loadChatGPTKey();

      // Error handling
      if (!apiKey) {
        showTempAlert('Please set your OpenAI API key in Settings first', 'warning');
        return;
      }

      if (!message) {
        showTempAlert('Please enter a message to rephrase', 'warning');
        return;
      }

      // Show loading state
      const originalValue = textarea.value;
      textarea.disabled = true;
      showTempAlert('Rephrasing with AI...', 'info');

      try {
        const response = await fetch(`${API_LEGACY}/chatgpt/rephrase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            apiKey: apiKey
          })
        });

        const result = await response.json();

        if (result.success) {
          // Update textarea with rephrased message
          textarea.value = result.rephrased;
          showTempAlert('Message rephrased successfully!', 'success');
        } else {
          showTempAlert('Failed to rephrase: ' + (result.error || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('AI rephrase error:', error);
        showTempAlert('Error: ' + error.message, 'danger');
      } finally {
        textarea.disabled = false;
      }
    }

    function showChatGPTResponse(message, type) {
      const alertClass = type === 'success' ? 'alert-success' : type === 'danger' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
      document.getElementById('chatgpt-api-response').innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

      // Auto-hide after 4 seconds
      setTimeout(() => {
        document.getElementById('chatgpt-api-response').innerHTML = '';
      }, 4000);
    }

    // Load ChatGPT API key on page load
    document.addEventListener('DOMContentLoaded', function() {
      loadChatGPTKey();
    });

    // Duplicate testSMTP function - removing this one as the correct one is defined above
    /* REMOVED DUPLICATE - testSMTP already defined at line 2658 */
    /*
    async function testSMTP() {
      document.getElementById('smtpTestResult').textContent = 'Testing...';
      try {
        const response = await fetch(`${API_LEGACY}/smtp/test`, {
          method: 'POST'
        });
        const result = await response.text();

        if (result === 'true') {
          document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--success-color);">✓ Connection successful</span>';
        } else {
          document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Test failed</span>';
        }
      } catch (error) {
        document.getElementById('smtpTestResult').innerHTML = '<span style="color: var(--danger-color);">✗ Error</span>';
      }
    }

    // ============================================
    // SMTP MANAGEMENT CENTER - ALL 6 PHASES
    // JavaScript Functions
    // ============================================

    // ============================================
    // PHASE 1: AUTO-CONFIGURATION FUNCTIONS
    // Backend: ✅ Fully Implemented
    // ============================================

    // Store detected configuration globally for quick actions
    let detectedConfig = null;

    /**
     * Auto-detect SMTP settings from email address
     * Connects to backend API: POST /api/smtp/database/lookup
     */
    async function autoDetectSMTPFromEmail() {
      const email = document.getElementById('autoDetectEmail').value.trim();

      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }

      const btn = document.getElementById('autoDetectBtn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
      btn.disabled = true;

      // Hide previous results
      document.getElementById('autoDetectResults').style.display = 'none';

      try {
        const response = await fetch('/api/smtp/database/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success && data.found && data.smtp && data.smtp.primary) {
          detectedConfig = {
            email: email,
            domain: data.domain,
            primary: data.smtp.primary,
            alternates: data.smtp.alternates || [],
            auth: data.auth,
            features: data.features
          };

          // Show results section
          displayDetectedSettings(detectedConfig);
        } else {
          showNotificationAlert('⚠️ No auto-configuration found for this email provider. Try manual discovery or use custom settings.', 'warning');
        }
      } catch (error) {
        console.error('Auto-detect error:', error);
        showNotificationAlert('❌ Failed to auto-detect settings. Please check backend connection.', 'danger');
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    }

    /**
     * Display detected SMTP settings with all details
     */
    function displayDetectedSettings(config) {
      const resultsDiv = document.getElementById('autoDetectResults');
      const providerSpan = document.getElementById('detectedProvider');
      const settingsDiv = document.getElementById('detectedSettings');
      const alternateDiv = document.getElementById('alternateServers');
      const alternateList = document.getElementById('alternateServersList');

      // Show provider name
      providerSpan.textContent = config.domain.charAt(0).toUpperCase() + config.domain.slice(1);

      // Show primary settings
      const primary = config.primary;
      settingsDiv.innerHTML = `
        <div class="row mt-2">
          <div class="col-md-3"><strong>Host:</strong></div>
          <div class="col-md-9"><code>${primary.host}</code></div>
        </div>
        <div class="row">
          <div class="col-md-3"><strong>Port:</strong></div>
          <div class="col-md-9"><code>${primary.port}</code></div>
        </div>
        <div class="row">
          <div class="col-md-3"><strong>Security:</strong></div>
          <div class="col-md-9"><span class="badge bg-success">${primary.protocol}</span></div>
        </div>
        <div class="row">
          <div class="col-md-3"><strong>Username:</strong></div>
          <div class="col-md-9"><code>${config.auth.username}</code></div>
        </div>
      `;

      // Show alternate servers if available
      if (config.alternates && config.alternates.length > 0) {
        let alternatesHTML = '<div class="list-group">';
        config.alternates.forEach((alt, index) => {
          alternatesHTML += `
            <div class="list-group-item" style="background: rgba(255,255,255,0.05); margin-bottom: 5px;">
              <strong>Option ${index + 2}:</strong> ${alt.host}:${alt.port} (${alt.protocol})
              <button class="btn btn-sm btn-outline-primary float-end" onclick="useAlternateServer(${index})">
                <i class="fas fa-check"></i> Use This
              </button>
            </div>
          `;
        });
        alternatesHTML += '</div>';
        alternateList.innerHTML = alternatesHTML;
        alternateDiv.style.display = 'block';
      } else {
        alternateDiv.style.display = 'none';
      }

      // Show results
      resultsDiv.style.display = 'block';

      // Scroll to results
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Use an alternate server
     */
    function useAlternateServer(index) {
      if (detectedConfig && detectedConfig.alternates[index]) {
        detectedConfig.primary = detectedConfig.alternates[index];
        displayDetectedSettings(detectedConfig);
        showNotificationAlert(`✓ Switched to alternate server: ${detectedConfig.primary.host}`, 'success');
      }
    }

    /**
     * Apply detected settings to profile form
     */
    function applyDetectedSettings() {
      if (!detectedConfig) return;

      // Switch to Profiles tab
      const profilesTab = new bootstrap.Tab(document.getElementById('profiles-tab'));
      profilesTab.show();

      // Auto-fill form with detected settings
      const primary = detectedConfig.primary;
      document.getElementById('profile-host').value = primary.host;
      document.getElementById('profile-port').value = primary.port;
      document.getElementById('profile-secure').value = primary.ssl ? 'true' : 'false';
      document.getElementById('profile-user').value = detectedConfig.auth.username;
      document.getElementById('profile-name').value = detectedConfig.domain + ' Account';

      showNotificationAlert(`✅ Settings applied to profile form! Please add your password and save.`, 'success');
    }

    /**
     * Copy detected settings to clipboard
     */
    function copyDetectedSettings() {
      if (!detectedConfig) return;

      const primary = detectedConfig.primary;
      const text = `SMTP Settings for ${detectedConfig.domain}
Host: ${primary.host}
Port: ${primary.port}
Security: ${primary.protocol}
Username: ${detectedConfig.auth.username}`;

      navigator.clipboard.writeText(text).then(() => {
        showNotificationAlert('✓ Settings copied to clipboard!', 'success');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    }

    /**
     * Test detected connection (placeholder for now)
     */
    function testDetectedConnection() {
      if (!detectedConfig) return;

      showNotificationAlert('⚠️ Connection test feature coming soon! For now, apply settings and use "Test SMTP" in the main form.', 'info');

      // TODO: Implement actual connection test
      // This would require backend endpoint to test connection without saving
    }

    /**
     * Helper function to show notification alerts
     */
    function showNotificationAlert(message, type) {
      const alertClass = type === 'success' ? 'alert-success' :
                        type === 'danger' ? 'alert-danger' :
                        type === 'warning' ? 'alert-warning' : 'alert-info';

      const alertDiv = document.createElement('div');
      alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
      alertDiv.style.position = 'fixed';
      alertDiv.style.top = '20px';
      alertDiv.style.right = '20px';
      alertDiv.style.zIndex = '9999';
      alertDiv.style.minWidth = '300px';
      alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;

      document.body.appendChild(alertDiv);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        alertDiv.remove();
      }, 4000);
    }

    /**
     * Search SMTP database
     * Connects to backend API: GET /api/smtp/database/search
     */
    async function searchSMTPDatabase() {
      const query = document.getElementById('databaseSearch').value.trim();

      if (!query) {
        alert('Please enter a search term');
        return;
      }

      try {
        const response = await fetch(`/api/smtp/database/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        const resultsDiv = document.getElementById('searchResults');

        if (data.success && data.results.length > 0) {
          let html = '<div class="provider-grid">';

          data.results.forEach(result => {
            html += `
              <div class="provider-card" onclick="selectProvider('${result.domain}')">
                <div class="provider-name">${result.domain}</div>
                <div class="provider-details">${result.smtpServers.length} server(s)</div>
              </div>
            `;
          });

          html += '</div>';
          resultsDiv.innerHTML = html;
        } else {
          resultsDiv.innerHTML = '<p class="text-muted">No results found</p>';
        }
      } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
      }
    }

    /**
     * Show database statistics modal
     * Connects to backend API: GET /api/smtp/database/stats
     */
    async function showDatabaseStats() {
      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('smtpDatabaseStatsModal'));
      modal.show();

      try {
        const response = await fetch('/api/smtp/database/stats');
        const data = await response.json();

        if (data.success) {
          const stats = data.stats;

          // Build port distribution chart data
          let portChartHTML = '';
          if (stats.ports) {
            const totalPorts = Object.values(stats.ports).reduce((a, b) => a + b, 0);
            Object.entries(stats.ports).forEach(([port, count]) => {
              const percentage = ((count / totalPorts) * 100).toFixed(1);
              portChartHTML += `
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><strong>Port ${port}</strong></span>
                    <span>${count} servers (${percentage}%)</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            });
          }

          // Build login template distribution
          let templateChartHTML = '';
          if (stats.loginTemplates) {
            const totalTemplates = Object.values(stats.loginTemplates).reduce((a, b) => a + b, 0);
            Object.entries(stats.loginTemplates).forEach(([template, count]) => {
              const percentage = ((count / totalTemplates) * 100).toFixed(1);
              const templateName = template.replace(/%/g, '');
              templateChartHTML += `
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><code>${template}</code></span>
                    <span>${count} (${percentage}%)</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar bg-success" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            });
          }

          const statsHTML = `
            <div class="row">
              <div class="col-md-6">
                <div class="stat-card mb-3">
                  <div class="stat-icon" style="background: var(--gradient-primary);">
                    <i class="fas fa-database"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">${stats.totalDomains}</div>
                    <div class="stat-label">Total Domains</div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="stat-card mb-3">
                  <div class="stat-icon" style="background: var(--gradient-success);">
                    <i class="fas fa-server"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">${stats.totalServers}</div>
                    <div class="stat-label">SMTP Servers</div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="stat-card mb-3">
                  <div class="stat-icon" style="background: var(--info-color);">
                    <i class="fas fa-network-wired"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">${stats.uniqueHosts || 'N/A'}</div>
                    <div class="stat-label">Unique Hosts</div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="stat-card mb-3">
                  <div class="stat-icon" style="background: var(--warning-color);">
                    <i class="fas fa-calendar"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value" style="font-size: 16px;">${stats.version || '1.0'}</div>
                    <div class="stat-label">Database Version</div>
                  </div>
                </div>
              </div>
            </div>

            <h6 class="mt-4"><i class="fas fa-chart-bar"></i> Port Distribution</h6>
            ${portChartHTML || '<p class="text-muted">No port data available</p>'}

            <h6 class="mt-4"><i class="fas fa-key"></i> Login Template Distribution</h6>
            ${templateChartHTML || '<p class="text-muted">No template data available</p>'}

            <div class="alert alert-info mt-4">
              <i class="fas fa-info-circle"></i> <strong>Database Source:</strong> Mozilla Thunderbird Autoconfig
            </div>
          `;

          document.getElementById('databaseStatsContent').innerHTML = statsHTML;
        }
      } catch (error) {
        console.error('Stats error:', error);
        document.getElementById('databaseStatsContent').innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i> Failed to load statistics. Please try again.
          </div>
        `;
      }
    }

    /**
     * Load popular providers on Auto-Config tab
     * Connects to backend API: GET /api/smtp/database/popular
     */
    async function loadPopularProviders() {
      try {
        const response = await fetch('/api/smtp/database/popular');
        const data = await response.json();

        if (data.success && data.providers.length > 0) {
          const grid = document.getElementById('popularProvidersGrid');
          let html = '';

          data.providers.forEach(provider => {
            html += `
              <div class="provider-card" onclick="selectProvider('${provider.domain}')">
                <div class="provider-name">${provider.domain}</div>
                <div class="provider-details">${provider.smtpServers.length} server(s)</div>
              </div>
            `;
          });

          grid.innerHTML = html;
        }
      } catch (error) {
        console.error('Popular providers error:', error);
      }
    }

    /**
     * Select a provider and auto-fill settings
     * Connects to backend API: GET /api/smtp/database/:domain
     */
    async function selectProvider(domain) {
      try {
        const response = await fetch(`/api/smtp/database/${domain}`);
        const data = await response.json();

        if (data.success && data.config && data.config.smtpServers.length > 0) {
          const profilesTab = new bootstrap.Tab(document.getElementById('profiles-tab'));
          profilesTab.show();

          const server = data.config.smtpServers[0];
          document.getElementById('profile-host').value = server.host;
          document.getElementById('profile-port').value = server.port;
          document.getElementById('profile-secure').value = server.ssl ? 'true' : 'false';
          document.getElementById('profile-name').value = domain + ' Account';

          alert(`✅ Settings loaded for ${domain}`);
        }
      } catch (error) {
        console.error('Provider selection error:', error);
      }
    }

    /**
     * Quick fill SMTP settings when service dropdown changes
     */
    function quickFillSMTPSettings(service) {
      const settings = {
        'Gmail': { host: 'smtp.gmail.com', port: 465, secure: 'true' },
        'Outlook365': { host: 'smtp-mail.outlook.com', port: 587, secure: 'false' },
        'Yahoo': { host: 'smtp.mail.yahoo.com', port: 465, secure: 'true' },
        'SendGrid': { host: 'smtp.sendgrid.net', port: 587, secure: 'false' }
      };

      if (settings[service]) {
        document.getElementById('profile-host').value = settings[service].host;
        document.getElementById('profile-port').value = settings[service].port;
        document.getElementById('profile-secure').value = settings[service].secure;
      }
    }

    // Load popular providers when Auto-Config tab is shown
    document.getElementById('autoconfig-tab')?.addEventListener('shown.bs.tab', function() {
      loadPopularProviders();
    });

    // ============================================
    // PHASE 2: INTELLIGENT DISCOVERY
    // Backend: ✅ Fully Implemented
    // ============================================

    let discoveryResults = null;

    /**
     * Start SMTP discovery process
     * Performs 4-step discovery: MX lookup, port scan, connection test, capability detection
     */
    async function startSMTPDiscovery() {
      const input = document.getElementById('discoveryInput').value.trim();

      if (!input) {
        alert('Please enter a domain or email address');
        return;
      }

      const btn = event.target;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Discovering...';
      btn.disabled = true;

      // Show progress section
      const progressDiv = document.getElementById('discoveryProgress');
      const resultsDiv = document.getElementById('discoveryResults');
      progressDiv.style.display = 'block';
      resultsDiv.style.display = 'none';

      // Reset all steps
      resetDiscoverySteps();

      try {
        const response = await fetch('/api/smtp/discovery/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });

        const data = await response.json();

        if (data.success && data.steps) {
          discoveryResults = data;

          // Display each step
          for (let i = 0; i < data.steps.length; i++) {
            await displayDiscoveryStep(i + 1, data.steps[i]);
            await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
          }

          // Display final results
          displayDiscoveryResults(data);
        } else {
          showNotificationAlert('❌ Discovery failed: ' + (data.error || 'Unknown error'), 'danger');
          progressDiv.style.display = 'none';
        }

      } catch (error) {
        console.error('Discovery error:', error);
        showNotificationAlert('❌ Discovery failed. Please check backend connection.', 'danger');
        progressDiv.style.display = 'none';
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    }

    /**
     * Reset all discovery steps to initial state
     */
    function resetDiscoverySteps() {
      for (let i = 1; i <= 4; i++) {
        const stepDiv = document.getElementById(`step${i}`);
        if (stepDiv) {
          stepDiv.classList.remove('active', 'completed');
          const icon = stepDiv.querySelector('.step-icon i');
          if (icon) {
            icon.className = 'fas fa-circle';
          }
          const result = document.getElementById(`step${i}Result`);
          if (result) {
            result.innerHTML = '';
          }
        }
      }
    }

    /**
     * Display progress for a discovery step
     */
    async function displayDiscoveryStep(stepNum, stepData) {
      const stepDiv = document.getElementById(`step${stepNum}`);
      const resultDiv = document.getElementById(`step${stepNum}Result`);

      if (!stepDiv || !resultDiv) return;

      // Mark as active
      stepDiv.classList.add('active');
      const icon = stepDiv.querySelector('.step-icon i');
      if (icon) {
        icon.className = 'fas fa-spinner fa-spin';
      }

      // Wait a moment (simulating real-time progress)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mark as completed
      stepDiv.classList.remove('active');
      stepDiv.classList.add('completed');
      if (icon) {
        icon.className = stepData.success ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
      }

      // Display result
      let resultHTML = `<div class="alert ${stepData.success ? 'alert-success' : 'alert-warning'} py-2 mb-0">`;
      resultHTML += `<strong>${stepData.message || 'Completed'}</strong><br>`;

      if (stepNum === 1 && stepData.records && stepData.records.length > 0) {
        resultHTML += `<small>Found: ${stepData.records.map(r => r.exchange).slice(0, 3).join(', ')}</small>`;
      } else if (stepNum === 2 && stepData.openPorts && stepData.openPorts.length > 0) {
        resultHTML += `<small>Open ports: ${stepData.openPorts.map(p => `${p.host}:${p.port}`).slice(0, 3).join(', ')}</small>`;
      } else if (stepNum === 3 && stepData.workingServers && stepData.workingServers.length > 0) {
        resultHTML += `<small>Working: ${stepData.workingServers.map(s => `${s.host}:${s.port}`).join(', ')}</small>`;
      } else if (stepNum === 4 && stepData.serversWithCapabilities) {
        const hasStarttls = stepData.serversWithCapabilities.some(s => s.starttls);
        const hasSSL = stepData.serversWithCapabilities.some(s => s.ssl);
        resultHTML += `<small>STARTTLS: ${hasStarttls ? '✓' : '✗'}, SSL: ${hasSSL ? '✓' : '✗'}</small>`;
      }

      resultHTML += `</div>`;
      resultDiv.innerHTML = resultHTML;
    }

    /**
     * Display final discovery results
     */
    function displayDiscoveryResults(data) {
      const resultsDiv = document.getElementById('discoveryResults');
      const contentDiv = document.getElementById('discoveryResultsContent');

      if (!data.servers || data.servers.length === 0) {
        contentDiv.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i> <strong>No SMTP servers found</strong>
            <p class="mb-0">The domain may not have public SMTP servers or they may be behind a firewall.</p>
          </div>
        `;
        resultsDiv.style.display = 'block';
        return;
      }

      let html = `
        <div class="alert alert-success">
          <h6><i class="fas fa-check-circle"></i> Discovery Complete!</h6>
          <p>Found ${data.servers.length} SMTP server(s) for <strong>${data.domain}</strong></p>
          <small>Completed in ${data.duration}ms</small>
        </div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Host</th>
                <th>Port</th>
                <th>Protocol</th>
                <th>STARTTLS</th>
                <th>Auth Methods</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
      `;

      data.servers.forEach((server, index) => {
        const isRecommended = server.recommended;
        html += `
          <tr ${isRecommended ? 'class="table-success"' : ''}>
            <td>
              ${server.host}
              ${isRecommended ? '<span class="badge bg-success ms-2">Recommended</span>' : ''}
            </td>
            <td><code>${server.port}</code></td>
            <td><span class="badge bg-primary">${server.protocol}</span></td>
            <td>${server.starttls ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-muted"></i>'}</td>
            <td><small>${server.authMethods.join(', ') || 'N/A'}</small></td>
            <td>
              <button class="btn btn-sm btn-success" onclick="useDiscoveredServer(${index})">
                <i class="fas fa-check"></i> Use This
              </button>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;

      contentDiv.innerHTML = html;
      resultsDiv.style.display = 'block';

      // Scroll to results
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Use a discovered server
     */
    function useDiscoveredServer(index) {
      if (!discoveryResults || !discoveryResults.servers[index]) return;

      const server = discoveryResults.servers[index];

      // Switch to Profiles tab
      const profilesTab = new bootstrap.Tab(document.getElementById('profiles-tab'));
      profilesTab.show();

      // Auto-fill form
      document.getElementById('profile-host').value = server.host;
      document.getElementById('profile-port').value = server.port;
      document.getElementById('profile-secure').value = server.ssl ? 'true' : 'false';
      document.getElementById('profile-name').value = `${discoveryResults.domain} (Discovered)`;

      showNotificationAlert(`✅ Server ${server.host}:${server.port} applied to profile form!`, 'success');
    }

    // ============================================
    // PHASE 3: HEALTH MONITORING (TODO)
    // Backend: ❌ Not Implemented Yet
    // ============================================

    async function runHealthCheck() {
      alert('⚠️ Phase 3 Backend TODO\n\nNeeds implementation:\n- Health check system\n- Performance tracking\n- Auto-failover logic\n- Smart rotation');

      // TODO: Implement health monitoring backend
      // const response = await fetch('/api/smtp/health/check');
    }

    // ============================================
    // PHASE 4: ADVANCED FEATURES (Partial)
    // Backend: ⚠️ Blacklist checker exists, others TODO
    // ============================================

    async function configureConnectionPool() {
      alert('⚠️ Phase 4 Backend TODO\n\nConnection pooling needs implementation');

      // TODO: Implement connection pool configuration
      // const response = await fetch('/api/smtp/pool/config');
    }

    async function checkBlacklist() {
      const ip = document.getElementById('blacklistIP').value.trim();

      if (!ip) {
        alert('Please enter an IP address');
        return;
      }

      alert('⚠️ Backend exists (blacklistChecker.js) but needs API endpoint\n\nTODO: Create route in backend/server/enhancedRoutes.js');

      // TODO: Create API endpoint and connect
      // const response = await fetch('/api/smtp/blacklist/check', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ip })
      // });
    }

    // ============================================
    // PHASE 5: IMPORT/EXPORT (TODO)
    // Backend: ❌ Not Implemented Yet
    // ============================================

    async function startBulkImport() {
      const text = document.getElementById('importText').value.trim();

      if (!text) {
        alert('Please paste SMTP list to import');
        return;
      }

      alert('⚠️ Phase 5 Backend TODO\n\nNeeds implementation:\n- 3-format parser (email:pass, email|pass, pass|email)\n- Validation system\n- Bulk save to profiles');

      // TODO: Implement import parser backend
      // const response = await fetch('/api/smtp/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ data: text })
      // });
    }

    async function exportProfiles() {
      const format = document.getElementById('exportFormat').value;

      alert('⚠️ Phase 5 Backend TODO\n\nNeeds implementation:\n- Export to JSON/CSV/TXT\n- Backup/restore system');

      // TODO: Implement export backend
      // const response = await fetch(`/api/smtp/export?format=${format}`);
    }

    // ============================================
    // PHASE 6: ANALYTICS (TODO)
    // Backend: ❌ Not Implemented Yet
    // ============================================

    async function exportAnalyticsReport() {
      alert('⚠️ Phase 6 Backend TODO\n\nNeeds implementation:\n- Metrics tracking\n- Chart.js integration\n- Performance analysis');

      // TODO: Implement analytics backend
      // const response = await fetch('/api/smtp/analytics/report');
    }

    // Initialize Chart.js when Analytics tab is shown (if Chart.js is loaded)
    document.getElementById('analytics-tab')?.addEventListener('shown.bs.tab', function() {
      if (typeof Chart !== 'undefined') {
        const ctx = document.getElementById('performanceChart');
        if (ctx && !ctx.chart) {
          ctx.chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: 'Emails Sent',
                data: [],
                borderColor: 'rgb(79, 70, 229)',
                tension: 0.1
              }]
            }
          });
        }
      }
    });

    // ============================================================================
    // SMTP COMBO PROCESSOR
    // ============================================================================

    const ComboProcessor = {
      sessionId: null,
      websocket: null,
      results: {
        valid: [],
        invalid: []
      },
      isPaused: false,

      init() {
        // File upload handler
        const fileUpload = document.getElementById('comboFileUpload');
        if (fileUpload) {
          fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                document.getElementById('comboTextInput').value = event.target.result;
              };
              reader.readAsText(file);
            }
          });
        }

        // Control buttons
        const startBtn = document.getElementById('startProcessing');
        if (startBtn) {
          startBtn.addEventListener('click', () => this.start());
        }

        const pauseBtn = document.getElementById('pauseProcessing');
        if (pauseBtn) {
          pauseBtn.addEventListener('click', () => this.pause());
        }

        const stopBtn = document.getElementById('stopProcessing');
        if (stopBtn) {
          stopBtn.addEventListener('click', () => this.stop());
        }

        const clearBtn = document.getElementById('clearResults');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => this.clear());
        }

        // Download buttons
        const downloadTxt = document.getElementById('downloadTxt');
        if (downloadTxt) {
          downloadTxt.addEventListener('click', () => this.download('txt'));
        }

        const downloadCsv = document.getElementById('downloadCsv');
        if (downloadCsv) {
          downloadCsv.addEventListener('click', () => this.download('csv'));
        }

        const downloadJson = document.getElementById('downloadJson');
        if (downloadJson) {
          downloadJson.addEventListener('click', () => this.download('json'));
        }

        // Results filter
        const filterInput = document.getElementById('resultsFilter');
        if (filterInput) {
          filterInput.addEventListener('input', (e) => {
            this.filterResults(e.target.value);
          });
        }
      },

      async start() {
        const comboText = document.getElementById('comboTextInput').value.trim();
        if (!comboText) {
          alert('Please enter or upload combo list');
          return;
        }

        const format = document.getElementById('comboFormat').value;
        const threads = parseInt(document.getElementById('comboThreads').value);
        const skipBlacklist = document.getElementById('skipBlacklist').checked;
        const useProxies = document.getElementById('useProxies').checked;

        // Show progress card
        document.getElementById('progressCard').style.display = 'block';
        document.getElementById('resultsCard').style.display = 'none';

        // Update button states
        document.getElementById('startProcessing').disabled = true;
        document.getElementById('pauseProcessing').disabled = false;
        document.getElementById('stopProcessing').disabled = false;

        // Clear previous results
        this.results = { valid: [], invalid: [] };

        try {
          // Parse combos
          const parseResponse = await fetch('/api/smtp/combo/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: comboText, format })
          });

          const parseResult = await parseResponse.json();

          if (!parseResult.success) {
            alert('Error parsing combos: ' + parseResult.error);
            this.resetUI();
            return;
          }

          if (parseResult.errors.length > 0) {
            const proceed = confirm(
              `Found ${parseResult.errors.length} parsing errors. Continue with ${parseResult.combos.length} valid combos?`
            );
            if (!proceed) {
              this.resetUI();
              return;
            }
          }

          // Start processing
          const response = await fetch('/api/smtp/combo/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              combos: parseResult.combos,
              threads,
              options: {
                skipBlacklist,
                useProxy: useProxies
              }
            })
          });

          const result = await response.json();
          this.sessionId = result.sessionId;

          // Update total
          document.getElementById('statTotal').textContent = result.total;

          // Connect to WebSocket for real-time updates
          this.connectWebSocket();

        } catch (error) {
          console.error('Error starting processing:', error);
          alert('Error: ' + error.message);
          this.resetUI();
        }
      },

      connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/combo/process/${this.sessionId}`;

        console.log('Connecting to WebSocket:', wsUrl);
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
          console.log('WebSocket connected');
        };

        this.websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        this.websocket.onclose = () => {
          console.log('WebSocket closed');
        };
      },

      handleWebSocketMessage(data) {
        switch (data.type) {
          case 'connected':
            console.log('WebSocket session connected:', data.sessionId);
            break;

          case 'progress':
            this.updateProgress(data);
            break;

          case 'result':
            this.addResult(data.result);
            break;

          case 'complete':
            this.onComplete(data.summary);
            break;

          case 'error':
            console.error('Processing error:', data);
            break;
        }
      },

      updateProgress(data) {
        const percent = Math.round((data.current / data.total) * 100);

        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('progressBar').textContent = percent + '%';
        document.getElementById('progressText').textContent =
          `${data.current}/${data.total} (${percent}%)`;

        document.getElementById('statValid').textContent = data.valid;
        document.getElementById('statInvalid').textContent = data.invalid;

        const successRate = data.current > 0
          ? Math.round((data.valid / data.current) * 100)
          : 0;
        document.getElementById('statSuccessRate').textContent = successRate + '%';

        document.getElementById('currentCombo').textContent = data.currentCombo;
      },

      addResult(result) {
        if (result.valid) {
          this.results.valid.push(result);
        } else {
          this.results.invalid.push(result);
        }

        // Show results card if not visible
        if (document.getElementById('resultsCard').style.display === 'none') {
          document.getElementById('resultsCard').style.display = 'block';
        }

        // Update results display
        this.renderResults();
      },

      renderResults() {
        const container = document.getElementById('resultsContainer');
        const filter = document.getElementById('resultsFilter').value.toLowerCase();

        let html = '';

        // Valid results
        const validResults = this.results.valid.filter(r =>
          !filter || r.email.toLowerCase().includes(filter) || r.smtp.toLowerCase().includes(filter)
        );

        validResults.forEach(result => {
          html += `
            <div class="alert alert-success mb-2 font-monospace small">
              ✅ ${result.smtp}|${result.port}|${result.username}|${result.password}
              <small class="text-muted ms-2">(${result.phase})</small>
            </div>
          `;
        });

        // Invalid results (show last 10)
        const invalidResults = this.results.invalid
          .filter(r => !filter || r.email.toLowerCase().includes(filter))
          .slice(-10);

        invalidResults.forEach(result => {
          html += `
            <div class="alert alert-danger mb-2 small">
              ❌ ${result.email} - ${result.error}
            </div>
          `;
        });

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight; // Auto-scroll to bottom
      },

      filterResults(query) {
        this.renderResults();
      },

      onComplete(summary) {
        console.log('Processing complete:', summary);

        // Update final stats
        document.getElementById('statTotal').textContent = summary.total;
        document.getElementById('statValid').textContent = summary.valid;
        document.getElementById('statInvalid').textContent = summary.invalid;
        document.getElementById('statSuccessRate').textContent = summary.successRate + '%';

        // Update progress bar to 100%
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('progressBar').textContent = '100%';
        document.getElementById('progressBar').classList.remove('progress-bar-animated');

        document.getElementById('currentCombo').textContent = 'Complete!';

        // Close WebSocket
        if (this.websocket) {
          this.websocket.close();
        }

        // Reset button states
        this.resetUI();

        // Show notification
        alert(`Processing complete!\n\nValid: ${summary.valid}\nInvalid: ${summary.invalid}\nSuccess rate: ${summary.successRate}%`);
      },

      pause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pauseProcessing');

        if (this.isPaused) {
          btn.innerHTML = '<i class="fas fa-play-fill"></i> Resume';
          // Send pause message via WebSocket
          if (this.websocket) {
            this.websocket.send(JSON.stringify({ action: 'pause' }));
          }
        } else {
          btn.innerHTML = '<i class="fas fa-pause-fill"></i> Pause';
          // Send resume message via WebSocket
          if (this.websocket) {
            this.websocket.send(JSON.stringify({ action: 'resume' }));
          }
        }
      },

      stop() {
        if (!confirm('Are you sure you want to stop processing?')) {
          return;
        }

        // Send stop message via WebSocket
        if (this.websocket) {
          this.websocket.send(JSON.stringify({ action: 'stop' }));
          this.websocket.close();
        }

        this.resetUI();
      },

      clear() {
        if (this.sessionId && !confirm('Clear all results?')) {
          return;
        }

        document.getElementById('comboTextInput').value = '';
        document.getElementById('comboFileUpload').value = '';
        document.getElementById('progressCard').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'none';

        this.results = { valid: [], invalid: [] };
        this.sessionId = null;

        // Reset stats
        document.getElementById('statTotal').textContent = '0';
        document.getElementById('statValid').textContent = '0';
        document.getElementById('statInvalid').textContent = '0';
        document.getElementById('statSuccessRate').textContent = '0%';
      },

      resetUI() {
        document.getElementById('startProcessing').disabled = false;
        document.getElementById('pauseProcessing').disabled = true;
        document.getElementById('stopProcessing').disabled = true;
      },

      download(format) {
        if (this.results.valid.length === 0) {
          alert('No valid results to download');
          return;
        }

        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
          case 'txt':
            content = this.results.valid
              .map(r => `${r.smtp}|${r.port}|${r.username}|${r.password}`)
              .join('\n');
            filename = 'smtp_combos.txt';
            mimeType = 'text/plain';
            break;

          case 'csv':
            content = 'SMTP Server,Port,Username,Password,Phase,Blacklisted,Connection Time\n';
            content += this.results.valid
              .map(r => `${r.smtp},${r.port},${r.username},${r.password},${r.phase},${r.blacklisted},${r.connectionTime}`)
              .join('\n');
            filename = 'smtp_combos.csv';
            mimeType = 'text/csv';
            break;

          case 'json':
            content = JSON.stringify(this.results.valid, null, 2);
            filename = 'smtp_combos.json';
            mimeType = 'application/json';
            break;
        }

        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    // Initialize combo processor when page loads
    document.addEventListener('DOMContentLoaded', () => {
      ComboProcessor.init();
    });

    console.log('✅ SMTP Combo Validator initialized');

    // =====================================================
    // SMTP Import Functions
    // =====================================================

    // Open import modal and populate preview
    document.getElementById('importToSmtp')?.addEventListener('click', () => {
      const validResults = ComboProcessor.results.valid;

      if (validResults.length === 0) {
        alert('No valid SMTP credentials to import');
        return;
      }

      // Update count
      document.getElementById('importValidCount').textContent = validResults.length;

      // Update preview based on selected mode
      updateImportPreview();
    });

    // Update preview when mode changes
    document.querySelectorAll('input[name="importMode"]').forEach(radio => {
      radio.addEventListener('change', updateImportPreview);
    });

    function updateImportPreview() {
      const validResults = ComboProcessor.results.valid;
      const mode = document.querySelector('input[name="importMode"]:checked').value;
      const preview = document.getElementById('importPreview');

      if (mode === 'single') {
        // Show only first credential
        const first = validResults[0];
        preview.innerHTML = `
          <div style="color: #4ade80;">
            <strong>Single SMTP Configuration:</strong><br>
            Username: ${first.username}<br>
            Password: ${first.password.replace(/./g, '•')}<br>
            SMTP Host: ${first.smtp}<br>
            Port: ${first.port}<br>
            SSL: ${first.port === 465 ? 'Yes' : 'No'}
          </div>
        `;
      } else {
        // Show all credentials (limited to first 5 for preview)
        const displayCount = Math.min(validResults.length, 5);
        let html = `<div style="color: #4ade80;"><strong>Bulk SMTP List (${validResults.length} total):</strong><br><br>`;

        for (let i = 0; i < displayCount; i++) {
          const result = validResults[i];
          html += `${i + 1}. ${result.password}|${result.username}<br>`;
        }

        if (validResults.length > 5) {
          html += `<br>... and ${validResults.length - 5} more`;
        }

        html += `</div>`;
        preview.innerHTML = html;
      }
    }

    // Execute import to SMTP configuration
    async function executeImportToSMTP() {
      try {
        const validResults = ComboProcessor.results.valid;
        const mode = document.querySelector('input[name="importMode"]:checked').value;
        const service = document.getElementById('importSmtpService').value;
        const secureConnection = document.getElementById('importSmtpSecure').checked;
        const responseDiv = document.getElementById('importSmtpResponse');

        if (validResults.length === 0) {
          showImportResponse('No valid SMTP credentials to import', 'danger');
          return;
        }

        // Prepare data based on mode
        let data = {
          service: service,
          secureConnection: secureConnection
        };

        if (mode === 'single') {
          // Single SMTP Mode - use first valid credential
          const first = validResults[0];
          data.user = first.username;
          data.pass = first.password;
          data.bulk = 'false';

          showImportResponse('Importing single SMTP credential...', 'info');
        } else {
          // Bulk SMTP Mode - format all credentials as password|email
          const smtplist = validResults.map(r => `${r.password}|${r.username}`);
          data.smtplist = smtplist;
          data.bulk = 'true';

          showImportResponse(`Importing ${smtplist.length} SMTP credentials...`, 'info');
        }

        // Send to backend config endpoint
        const response = await fetch(`${API_LEGACY}/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.text();

        if (response.ok && (result === 'true' || result.includes('true'))) {
          showImportResponse(
            `✅ Successfully imported ${mode === 'single' ? '1 credential' : validResults.length + ' credentials'} to ${mode.toUpperCase()} mode`,
            'success'
          );

          // Close modal after 2 seconds
          setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('importSmtpModal'));
            modal.hide();

            // Clear response after modal closes
            setTimeout(() => {
              document.getElementById('importSmtpResponse').innerHTML = '';
            }, 500);
          }, 2000);
        } else {
          showImportResponse('❌ Failed to import SMTP configuration: ' + (result.message || 'Unknown error'), 'danger');
        }
      } catch (error) {
        console.error('Import error:', error);
        showImportResponse('❌ Error importing SMTP configuration: ' + error.message, 'danger');
      }
    }

    function showImportResponse(message, type) {
      const responseDiv = document.getElementById('importSmtpResponse');
      const alertClass = type === 'success' ? 'alert-success' :
                        type === 'danger' ? 'alert-danger' :
                        type === 'info' ? 'alert-info' : 'alert-warning';

      responseDiv.innerHTML = `
        <div class="alert ${alertClass} mb-0" role="alert">
          ${message}
        </div>
      `;
    }

    // ============================================================================
    // INBOX SEARCHER FUNCTIONALITY
    // ============================================================================

    let inboxSearchSessionId = null;
    let inboxSearchWs = null;
    let inboxSearchPaused = false;
    let inboxSearchResults = [];

    // Check proxy status on page load
    async function checkInboxProxyStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/inbox/proxy-check`);
        const result = await response.json();

        const statusElement = document.getElementById('inboxProxyStatus');
        const startButton = document.querySelector('#inbox-searcher-section button[onclick="startInboxSearch()"]');

        if (result.hasProxies) {
          statusElement.innerHTML = `<span style="color: #2ecc71;">✓ Proxies configured (${result.proxyCount} proxies available)</span>`;
          startButton.disabled = false;
        } else {
          statusElement.innerHTML = '<span style="color: #e74c3c;">✗ No proxies configured. Please add proxies in the Proxies section.</span>';
          startButton.disabled = true;
        }
      } catch (error) {
        console.error('Failed to check proxy status:', error);
        document.getElementById('inboxProxyStatus').innerHTML = '<span style="color: #e67e22;">⚠ Failed to check proxy status</span>';
      }
    }

    // Start inbox search
    async function startInboxSearch() {
      const smtpInput = document.getElementById('inboxSmtpInput').value.trim();
      const keywordsInput = document.getElementById('inboxKeywordsInput').value.trim();

      if (!smtpInput) {
        alert('Please enter SMTP credentials (one per line in format: password|email or email:password)');
        return;
      }

      if (!keywordsInput) {
        alert('Please enter keywords to search for (comma-separated)');
        return;
      }

      // Parse SMTP list
      const smtpList = smtpInput.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (smtpList.length === 0) {
        alert('No valid SMTP credentials found');
        return;
      }

      // Parse keywords
      const keywords = keywordsInput.split(',')
        .map(kw => kw.trim())
        .filter(kw => kw.length > 0);

      if (keywords.length === 0) {
        alert('No valid keywords found');
        return;
      }

      try {
        // Start search
        const response = await fetch(`${API_BASE_URL}/inbox/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ smtpList, keywords })
        });

        const result = await response.json();

        if (result.success) {
          inboxSearchSessionId = result.sessionId;
          inboxSearchResults = [];
          inboxSearchPaused = false;

          // Update UI
          document.getElementById('inboxTotalCount').textContent = smtpList.length;
          document.getElementById('inboxSearchedCount').textContent = '0';
          document.getElementById('inboxFailedCount').textContent = '0';
          document.getElementById('inboxMatchesCount').textContent = '0';

          // Clear results container
          document.getElementById('inboxResultsContainer').innerHTML = '<p style="color: #7f8c8d;">Connecting to email accounts...</p>';

          // Connect WebSocket for real-time updates
          connectInboxWebSocket(inboxSearchSessionId);

          // Disable start button, enable pause/stop
          document.querySelector('#inbox-searcher-section button[onclick="startInboxSearch()"]').disabled = true;
          document.querySelector('#inbox-searcher-section button[onclick="pauseInboxSearch()"]').disabled = false;
          document.querySelector('#inbox-searcher-section button[onclick="stopInboxSearch()"]').disabled = false;
        } else {
          alert('Failed to start inbox search: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error starting inbox search:', error);
        alert('Error starting inbox search: ' + error.message);
      }
    }

    // Connect to WebSocket for real-time updates
    function connectInboxWebSocket(sessionId) {
      const wsUrl = `ws://localhost:9090/ws/inbox/${sessionId}`;
      inboxSearchWs = new WebSocket(wsUrl);

      inboxSearchWs.onopen = () => {
        console.log('Inbox search WebSocket connected');
      };

      inboxSearchWs.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'progress') {
          // Update progress stats
          document.getElementById('inboxSearchedCount').textContent = data.searched;
          document.getElementById('inboxFailedCount').textContent = data.failed;
          document.getElementById('inboxMatchesCount').textContent = data.totalMatches;
        } else if (data.type === 'result') {
          // Add new result
          inboxSearchResults.push(data);
          renderInboxResult(data);
        } else if (data.type === 'complete') {
          // Search completed
          handleInboxSearchComplete();
        } else if (data.type === 'error') {
          console.error('Inbox search error:', data.message);
        }
      };

      inboxSearchWs.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      inboxSearchWs.onclose = () => {
        console.log('Inbox search WebSocket closed');
      };
    }

    // Render a single inbox result
    function renderInboxResult(result) {
      const container = document.getElementById('inboxResultsContainer');

      // Clear "connecting..." message if it's the first result
      if (inboxSearchResults.length === 1) {
        container.innerHTML = '';
      }

      const resultId = `inbox-result-${inboxSearchResults.length}`;
      const statusColor = result.success ? '#2ecc71' : '#e74c3c';
      const statusIcon = result.success ? '✓' : '✗';
      const matchCount = result.matches ? result.matches.length : 0;

      const resultHtml = `
        <div class="result-row" style="margin-bottom: 10px; border: 1px solid #34495e; border-radius: 4px; overflow: hidden;">
          <div class="result-header" style="padding: 12px; background: #2c3e50; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleInboxResult('${resultId}')">
            <div>
              <span style="color: ${statusColor}; font-weight: bold; margin-right: 10px;">${statusIcon}</span>
              <strong>${result.email}</strong>
              ${result.success ? `<span style="margin-left: 10px; color: #3498db;">(${matchCount} matches)</span>` : ''}
            </div>
            <i class="fas fa-chevron-down" id="${resultId}-icon"></i>
          </div>
          <div id="${resultId}" class="result-content" style="display: none; padding: 15px; background: #34495e; max-height: 400px; overflow-y: auto;">
            ${result.success ? renderInboxMatches(result.matches) : `<p style="color: #e74c3c;">Error: ${result.error}</p>`}
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', resultHtml);
    }

    // Render matches for an email account
    function renderInboxMatches(matches) {
      if (!matches || matches.length === 0) {
        return '<p style="color: #95a5a6;">No matches found</p>';
      }

      let html = '<div style="display: grid; gap: 10px;">';

      matches.forEach((match, index) => {
        html += `
          <div style="background: #2c3e50; padding: 12px; border-radius: 4px; border-left: 3px solid #3498db;">
            <div style="margin-bottom: 8px;">
              <strong style="color: #3498db;">From:</strong> ${escapeHtml(match.from || 'Unknown')}
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #3498db;">Subject:</strong> ${escapeHtml(match.subject || 'No subject')}
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #3498db;">Date:</strong> ${match.date ? new Date(match.date).toLocaleString() : 'Unknown'}
            </div>
            ${match.snippet ? `
              <div style="margin-top: 10px; padding: 10px; background: #1a252f; border-radius: 4px;">
                <div style="color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Snippet:</div>
                <div style="color: #ecf0f1; font-size: 0.9em;">${escapeHtml(match.snippet)}</div>
              </div>
            ` : ''}
          </div>
        `;
      });

      html += '</div>';
      return html;
    }

    // Toggle inbox result visibility
    function toggleInboxResult(resultId) {
      const content = document.getElementById(resultId);
      const icon = document.getElementById(resultId + '-icon');

      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
      } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
      }
    }

    // Handle search completion
    function handleInboxSearchComplete() {
      console.log('Inbox search completed');

      // Re-enable start button, disable pause/stop
      document.querySelector('#inbox-searcher-section button[onclick="startInboxSearch()"]').disabled = false;
      document.querySelector('#inbox-searcher-section button[onclick="pauseInboxSearch()"]').disabled = true;
      document.querySelector('#inbox-searcher-section button[onclick="stopInboxSearch()"]').disabled = true;

      // Close WebSocket
      if (inboxSearchWs) {
        inboxSearchWs.close();
        inboxSearchWs = null;
      }
    }

    // Pause inbox search
    function pauseInboxSearch() {
      // Note: Backend doesn't support pause, so we'll just close WebSocket
      // User can restart the search
      inboxSearchPaused = true;
      if (inboxSearchWs) {
        inboxSearchWs.close();
        inboxSearchWs = null;
      }
      alert('Search paused. Click Start to resume with a new search.');
      handleInboxSearchComplete();
    }

    // Stop inbox search
    async function stopInboxSearch() {
      if (!inboxSearchSessionId) return;

      try {
        await fetch(`${API_BASE_URL}/inbox/session/${inboxSearchSessionId}`, {
          method: 'DELETE'
        });

        if (inboxSearchWs) {
          inboxSearchWs.close();
          inboxSearchWs = null;
        }

        inboxSearchSessionId = null;
        handleInboxSearchComplete();
      } catch (error) {
        console.error('Error stopping inbox search:', error);
      }
    }

    // Clear inbox search
    function clearInboxSearch() {
      document.getElementById('inboxSmtpInput').value = '';
      document.getElementById('inboxKeywordsInput').value = '';
      document.getElementById('inboxTotalCount').textContent = '0';
      document.getElementById('inboxSearchedCount').textContent = '0';
      document.getElementById('inboxFailedCount').textContent = '0';
      document.getElementById('inboxMatchesCount').textContent = '0';
      document.getElementById('inboxResultsContainer').innerHTML = '<p style="color: #7f8c8d;">No results yet. Start a search to see results here.</p>';
      inboxSearchResults = [];

      if (inboxSearchSessionId) {
        stopInboxSearch();
      }
    }

    // Download inbox results
    function downloadInboxResults(format) {
      if (inboxSearchResults.length === 0) {
        alert('No results to download');
        return;
      }

      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'txt') {
        content = generateInboxTxtExport();
        filename = `inbox-search-results-${Date.now()}.txt`;
        mimeType = 'text/plain';
      } else if (format === 'csv') {
        content = generateInboxCsvExport();
        filename = `inbox-search-results-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'json') {
        content = JSON.stringify(inboxSearchResults, null, 2);
        filename = `inbox-search-results-${Date.now()}.json`;
        mimeType = 'application/json';
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Generate TXT export
    function generateInboxTxtExport() {
      let txt = 'INBOX SEARCH RESULTS\n';
      txt += '='.repeat(80) + '\n\n';

      inboxSearchResults.forEach((result, index) => {
        txt += `[${index + 1}] ${result.email}\n`;
        txt += '-'.repeat(80) + '\n';

        if (result.success) {
          txt += `Status: Success\n`;
          txt += `Matches: ${result.matches.length}\n\n`;

          result.matches.forEach((match, mIndex) => {
            txt += `  Match ${mIndex + 1}:\n`;
            txt += `    From: ${match.from || 'Unknown'}\n`;
            txt += `    Subject: ${match.subject || 'No subject'}\n`;
            txt += `    Date: ${match.date ? new Date(match.date).toLocaleString() : 'Unknown'}\n`;
            if (match.snippet) {
              txt += `    Snippet: ${match.snippet}\n`;
            }
            txt += '\n';
          });
        } else {
          txt += `Status: Failed\n`;
          txt += `Error: ${result.error}\n`;
        }

        txt += '\n';
      });

      return txt;
    }

    // Generate CSV export
    function generateInboxCsvExport() {
      let csv = 'Email,Status,Match Index,From,Subject,Date,Snippet\n';

      inboxSearchResults.forEach(result => {
        if (result.success && result.matches) {
          result.matches.forEach((match, index) => {
            const row = [
              result.email,
              'Success',
              index + 1,
              match.from || 'Unknown',
              match.subject || 'No subject',
              match.date ? new Date(match.date).toLocaleString() : 'Unknown',
              match.snippet || ''
            ];

            // Escape CSV values
            csv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
          });
        } else {
          csv += `"${result.email}","Failed",0,"","","","${result.error || 'Unknown error'}"\n`;
        }
      });

      return csv;
    }

    // ============================================================================
    // COOKIE-BASED INBOX SEARCHER FUNCTIONALITY
    // ============================================================================

    let cookieUploadSessionId = null;
    let cookieSearchSessionId = null;
    let cookieSearchWs = null;
    let cookieSearchResults = [];
    let validatedAccounts = [];

    // Switch between SMTP and Cookie methods
    function switchInboxMethod(method) {
      const smtpCard = document.getElementById('inboxSmtpCard');
      const cookieCard = document.getElementById('inboxCookieCard');

      if (method === 'smtp') {
        smtpCard.style.display = 'block';
        cookieCard.style.display = 'none';
      } else if (method === 'cookie') {
        smtpCard.style.display = 'none';
        cookieCard.style.display = 'block';
      }
    }

    // Handle cookie file upload
    async function handleCookieUpload() {
      const fileInput = document.getElementById('cookieFiles');
      const files = fileInput.files;

      if (!files || files.length === 0) {
        return;
      }

      // Show upload status
      document.getElementById('cookieUploadStatus').style.display = 'block';
      document.getElementById('cookieUploadSpinner').style.display = 'inline-block';
      document.getElementById('cookieUploadAlert').className = 'alert alert-info';
      document.getElementById('cookieUploadMessage').textContent = `Validating ${files.length} cookie file(s)...`;

      try {
        // Create FormData
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append('cookieFiles', files[i]);
        }

        // Upload and validate
        const response = await fetch(`${API_LEGACY}/cookie-inbox/upload`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          cookieUploadSessionId = result.sessionId;
          validatedAccounts = result.accounts;

          // Hide spinner
          document.getElementById('cookieUploadSpinner').style.display = 'none';

          // Show success message
          document.getElementById('cookieUploadAlert').className = 'alert alert-success';
          document.getElementById('cookieUploadMessage').innerHTML = `
            <i class="fas fa-check-circle"></i>
            <strong>Success!</strong> Validated ${result.validCount} of ${files.length} file(s).
            ${result.errorCount > 0 ? `<br><span class="text-warning">${result.errorCount} file(s) failed validation.</span>` : ''}
          `;

          // Show validated accounts
          if (result.validCount > 0) {
            displayValidatedAccounts(result.accounts);
            document.getElementById('cookieStartBtn').disabled = false;
          }

          // Show errors if any
          if (result.errors && result.errors.length > 0) {
            console.warn('Cookie validation errors:', result.errors);
          }

        } else {
          throw new Error(result.message || 'Upload failed');
        }

      } catch (error) {
        console.error('Cookie upload error:', error);

        document.getElementById('cookieUploadSpinner').style.display = 'none';
        document.getElementById('cookieUploadAlert').className = 'alert alert-danger';
        document.getElementById('cookieUploadMessage').innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <strong>Error!</strong> ${error.message}
        `;
      }
    }

    // Display validated accounts
    function displayValidatedAccounts(accounts) {
      const container = document.getElementById('cookieAccountsContainer');
      const list = document.getElementById('cookieAccountsList');

      let html = '<div class="list-group list-group-flush">';

      accounts.forEach((account, index) => {
        const providerIcon = account.provider === 'gmail' ? 'fa-google' : 'fa-microsoft';
        const providerColor = account.provider === 'gmail' ? '#ea4335' : '#00a4ef';

        html += `
          <div class="list-group-item d-flex justify-content-between align-items-center" style="background: transparent; border-color: rgba(255,255,255,0.1);">
            <div>
              <i class="fab ${providerIcon}" style="color: ${providerColor}; margin-right: 8px;"></i>
              <strong>${account.email}</strong>
            </div>
            <div>
              <span class="badge bg-secondary">${account.cookieCount} cookies</span>
              <span class="badge" style="background: ${providerColor};">${account.provider.toUpperCase()}</span>
            </div>
          </div>
        `;
      });

      html += '</div>';
      container.innerHTML = html;
      list.style.display = 'block';
    }

    // Start cookie-based inbox search
    async function startCookieInboxSearch() {
      const keywordsInput = document.getElementById('cookieKeywords').value.trim();
      const provider = document.getElementById('cookieProvider').value;

      if (!cookieUploadSessionId) {
        alert('Please upload cookie files first');
        return;
      }

      if (!keywordsInput) {
        alert('Please enter search keywords');
        return;
      }

      const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);

      if (keywords.length === 0) {
        alert('Please enter valid keywords');
        return;
      }

      try {
        const response = await fetch(`${API_LEGACY}/cookie-inbox/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: cookieUploadSessionId,
            keywords,
            provider
          })
        });

        const result = await response.json();

        if (result.success) {
          cookieSearchSessionId = result.searchSessionId;
          cookieSearchResults = [];

          // Show progress card
          document.getElementById('inboxProgressCard').style.display = 'block';
          document.getElementById('inboxResultsCard').style.display = 'block';

          // Update stats
          document.getElementById('inboxStatTotal').textContent = result.accountCount;
          document.getElementById('inboxStatCompleted').textContent = '0';
          document.getElementById('inboxStatFailed').textContent = '0';
          document.getElementById('inboxStatMatches').textContent = '0';

          // Clear results
          document.getElementById('inboxResultsContainer').innerHTML = '<p style="color: #7f8c8d;">Searching email accounts...</p>';

          // Connect WebSocket
          connectCookieInboxWebSocket(cookieSearchSessionId);

          // Update buttons
          document.getElementById('cookieStartBtn').disabled = true;
          document.getElementById('cookieStopBtn').disabled = false;

        } else {
          alert('Failed to start search: ' + (result.message || 'Unknown error'));
        }

      } catch (error) {
        console.error('Error starting cookie inbox search:', error);
        alert('Error starting search: ' + error.message);
      }
    }

    // Connect WebSocket for cookie inbox search
    function connectCookieInboxWebSocket(searchSessionId) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' ? 'localhost:9090' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws/cookie-inbox/${searchSessionId}`;
      cookieSearchWs = new WebSocket(wsUrl);

      cookieSearchWs.onopen = () => {
        console.log('Cookie inbox search WebSocket connected');
      };

      cookieSearchWs.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'result') {
          // Update progress
          if (data.progress) {
            const completed = data.progress.completed || 0;
            const failed = data.progress.failed || 0;
            const total = data.progress.total || 1;
            const percentage = Math.round(((completed + failed) / total) * 100);

            document.getElementById('inboxProgressText').textContent = `${completed + failed}/${total} (${percentage}%)`;
            document.getElementById('inboxProgressBar').style.width = percentage + '%';
            document.getElementById('inboxProgressBar').textContent = percentage + '%';

            document.getElementById('inboxStatCompleted').textContent = completed;
            document.getElementById('inboxStatFailed').textContent = failed;
          }

          // Update matches
          if (data.matchCount !== undefined) {
            const currentMatches = parseInt(document.getElementById('inboxStatMatches').textContent) || 0;
            document.getElementById('inboxStatMatches').textContent = currentMatches + data.matchCount;
          }

          // Add result
          cookieSearchResults.push({
            email: data.email,
            success: data.matchCount > 0,
            matches: data.matches || [],
            matchCount: data.matchCount || 0
          });

          renderCookieInboxResult(data);

        } else if (data.type === 'complete') {
          handleCookieInboxSearchComplete();

        } else if (data.type === 'error') {
          console.error('Cookie inbox search error:', data.error);

          // Update progress if provided
          if (data.progress) {
            const completed = data.progress.completed || 0;
            const failed = data.progress.failed || 0;
            const total = data.progress.total || 1;
            const percentage = Math.round(((completed + failed) / total) * 100);

            document.getElementById('inboxProgressText').textContent = `${completed + failed}/${total} (${percentage}%)`;
            document.getElementById('inboxProgressBar').style.width = percentage + '%';
            document.getElementById('inboxProgressBar').textContent = percentage + '%';

            document.getElementById('inboxStatCompleted').textContent = completed;
            document.getElementById('inboxStatFailed').textContent = failed;
          }

          // Add error to results display
          cookieSearchResults.push({
            email: data.email,
            success: false,
            error: data.error,
            matches: [],
            matchCount: 0
          });

          renderCookieInboxError(data);
        }
      };

      cookieSearchWs.onerror = (error) => {
        console.error('Cookie inbox WebSocket error:', error);
      };

      cookieSearchWs.onclose = () => {
        console.log('Cookie inbox search WebSocket closed');
      };
    }

    // Render a single cookie inbox result
    function renderCookieInboxResult(result) {
      const container = document.getElementById('inboxResultsContainer');

      // Clear "searching" message on first result
      if (cookieSearchResults.length === 1) {
        container.innerHTML = '';
      }

      const resultId = `cookie-inbox-result-${cookieSearchResults.length}`;
      const statusClass = result.matchCount > 0 ? 'success' : 'secondary';
      const statusIcon = result.matchCount > 0 ? 'check-circle' : 'times-circle';

      const resultHtml = `
        <div class="mb-3 border rounded" style="background: rgba(0,0,0,0.1); border-color: rgba(255,255,255,0.1) !important;">
          <div class="result-header" style="padding: 12px; background: #2c3e50; cursor: pointer; display: flex; justify-content: between; align-items: center;" onclick="toggleInboxResult('${resultId}')">
            <div>
              <i class="fas fa-${statusIcon} text-${statusClass}"></i>
              <strong>${result.email}</strong>
            </div>
            <div>
              <span class="badge bg-${statusClass}">${result.matchCount} matches</span>
            </div>
          </div>
          <div id="${resultId}" class="result-body" style="padding: 15px; display: block;">
            ${result.matchCount > 0 ? renderInboxMatches(result.matches) : `<p style="color: #e74c3c;">No matches found</p>`}
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', resultHtml);
    }

    // Render a cookie inbox error
    function renderCookieInboxError(errorData) {
      const container = document.getElementById('inboxResultsContainer');

      // Clear "searching" message on first result
      if (cookieSearchResults.length === 1) {
        container.innerHTML = '';
      }

      const resultId = `cookie-inbox-error-${cookieSearchResults.length}`;
      const errorMessage = errorData.error || 'Unknown error occurred';

      // Parse error type for user-friendly messages
      let userMessage = errorMessage;
      let actionMessage = '';

      if (errorMessage.includes('Failed to authenticate') || errorMessage.includes('expired or invalid')) {
        userMessage = 'Authentication Failed';
        actionMessage = 'The cookies for this account are expired or invalid. Please export fresh cookies from your browser.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'Connection Timeout';
        actionMessage = 'The search took too long. This account may require manual verification or have connectivity issues.';
      } else if (errorMessage.includes('navigation')) {
        userMessage = 'Navigation Error';
        actionMessage = 'Failed to navigate to the inbox. The email provider may have changed their interface.';
      }

      const errorHtml = `
        <div class="mb-3 border rounded" style="background: rgba(231, 76, 60, 0.1); border-color: rgba(231, 76, 60, 0.3) !important;">
          <div class="result-header" style="padding: 12px; background: rgba(231, 76, 60, 0.2); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleInboxResult('${resultId}')">
            <div>
              <i class="fas fa-exclamation-triangle text-danger"></i>
              <strong>${errorData.email}</strong>
            </div>
            <div>
              <span class="badge bg-danger">Failed</span>
            </div>
          </div>
          <div id="${resultId}" class="result-body" style="padding: 15px; display: block;">
            <div class="alert alert-danger mb-0" style="background: rgba(231, 76, 60, 0.2); border-color: rgba(231, 76, 60, 0.4);">
              <h6 class="alert-heading"><i class="fas fa-exclamation-circle"></i> ${userMessage}</h6>
              <p class="mb-2"><strong>Details:</strong> ${errorMessage}</p>
              ${actionMessage ? `<hr><p class="mb-0"><strong>Action Required:</strong> ${actionMessage}</p>` : ''}
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', errorHtml);
    }

    // Handle cookie inbox search completion
    function handleCookieInboxSearchComplete() {
      console.log('Cookie inbox search completed');

      // Update buttons
      document.getElementById('cookieStartBtn').disabled = false;
      document.getElementById('cookieStopBtn').disabled = true;

      // Close WebSocket
      if (cookieSearchWs) {
        cookieSearchWs.close();
        cookieSearchWs = null;
      }
    }

    // Stop cookie inbox search
    async function stopCookieInboxSearch() {
      if (!cookieSearchSessionId) return;

      try {
        await fetch(`${API_LEGACY}/cookie-inbox/session/${cookieSearchSessionId}`, {
          method: 'DELETE'
        });

        if (cookieSearchWs) {
          cookieSearchWs.close();
          cookieSearchWs = null;
        }

        cookieSearchSessionId = null;
        handleCookieInboxSearchComplete();

      } catch (error) {
        console.error('Error stopping cookie inbox search:', error);
      }
    }

    // Clear cookie inbox search
    function clearCookieInboxSearch() {
      // Reset file input
      document.getElementById('cookieFiles').value = '';
      document.getElementById('cookieKeywords').value = '';
      document.getElementById('cookieProvider').value = 'all';

      // Hide status sections
      document.getElementById('cookieUploadStatus').style.display = 'none';
      document.getElementById('cookieAccountsList').style.display = 'none';

      // Reset session IDs
      cookieUploadSessionId = null;
      cookieSearchSessionId = null;
      validatedAccounts = [];
      cookieSearchResults = [];

      // Reset buttons
      document.getElementById('cookieStartBtn').disabled = true;
      document.getElementById('cookieStopBtn').disabled = true;

      // Clear results
      document.getElementById('inboxResultsContainer').innerHTML = '<p style="color: #7f8c8d;">No results yet. Upload cookies and start a search.</p>';
      document.getElementById('inboxStatTotal').textContent = '0';
      document.getElementById('inboxStatCompleted').textContent = '0';
      document.getElementById('inboxStatFailed').textContent = '0';
      document.getElementById('inboxStatMatches').textContent = '0';

      // Stop search if running
      if (cookieSearchSessionId) {
        stopCookieInboxSearch();
      }
    }

    // ============================================================================
    // CONTACT EXTRACTOR FUNCTIONALITY
    // ============================================================================

    let contactSessionId = null;
    let contactWs = null;
    let contactPaused = false;
    let contactResults = [];

    // Start contact extraction
    async function startContactExtraction() {
      const smtpInput = document.getElementById('contactSmtpInput').value.trim();

      if (!smtpInput) {
        alert('Please enter SMTP credentials (one per line in format: password|email or email:password)');
        return;
      }

      // Parse SMTP list
      const smtpList = smtpInput.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (smtpList.length === 0) {
        alert('No valid SMTP credentials found');
        return;
      }

      // Get options
      const deduplicate = document.getElementById('contactDeduplicate').checked;
      const includePhone = document.getElementById('contactIncludePhone').checked;

      try {
        // Start extraction
        const response = await fetch(`${API_BASE_URL}/contact/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ smtpList, options: { deduplicate, includePhone } })
        });

        const result = await response.json();

        if (result.success) {
          contactSessionId = result.sessionId;
          contactResults = [];
          contactPaused = false;

          // Update UI
          document.getElementById('contactTotalCount').textContent = smtpList.length;
          document.getElementById('contactProcessedCount').textContent = '0';
          document.getElementById('contactFailedCount').textContent = '0';
          document.getElementById('contactContactsCount').textContent = '0';

          // Clear results container
          document.getElementById('contactResultsContainer').innerHTML = '<p style="color: #7f8c8d;">Extracting contacts from email accounts...</p>';

          // Connect WebSocket for real-time updates
          connectContactWebSocket(contactSessionId);

          // Disable start button, enable pause/stop
          document.querySelector('#contact-extractor-section button[onclick="startContactExtraction()"]').disabled = true;
          document.querySelector('#contact-extractor-section button[onclick="pauseContactExtraction()"]').disabled = false;
          document.querySelector('#contact-extractor-section button[onclick="stopContactExtraction()"]').disabled = false;
        } else {
          alert('Failed to start contact extraction: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error starting contact extraction:', error);
        alert('Error starting contact extraction: ' + error.message);
      }
    }

    // Connect to WebSocket for real-time updates
    function connectContactWebSocket(sessionId) {
      const wsUrl = `ws://localhost:9090/ws/contacts/${sessionId}`;
      contactWs = new WebSocket(wsUrl);

      contactWs.onopen = () => {
        console.log('Contact extraction WebSocket connected');
      };

      contactWs.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'progress') {
          // Update progress stats
          document.getElementById('contactProcessedCount').textContent = data.processed;
          document.getElementById('contactFailedCount').textContent = data.failed;
          document.getElementById('contactContactsCount').textContent = data.totalContacts;
        } else if (data.type === 'result') {
          // Add new contacts
          if (data.contacts && data.contacts.length > 0) {
            contactResults.push(...data.contacts);
            renderContactResults();
          }
        } else if (data.type === 'complete') {
          // Extraction completed
          handleContactExtractionComplete();
        } else if (data.type === 'error') {
          console.error('Contact extraction error:', data.message);
        }
      };

      contactWs.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      contactWs.onclose = () => {
        console.log('Contact extraction WebSocket closed');
      };
    }

    // Render contact results
    function renderContactResults() {
      const container = document.getElementById('contactResultsContainer');

      if (contactResults.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No contacts extracted yet...</p>';
        return;
      }

      let html = '<div style="display: grid; gap: 10px;">';

      // Group by first letter for better organization
      const grouped = {};
      contactResults.forEach(contact => {
        const firstLetter = (contact.name || contact.email).charAt(0).toUpperCase();
        if (!grouped[firstLetter]) grouped[firstLetter] = [];
        grouped[firstLetter].push(contact);
      });

      // Sort letters
      const letters = Object.keys(grouped).sort();

      letters.forEach(letter => {
        html += `<div style="margin-bottom: 20px;">`;
        html += `<h4 style="color: #3498db; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #3498db;">${letter}</h4>`;

        grouped[letter].forEach(contact => {
          html += `
            <div style="background: #2c3e50; padding: 12px; margin-bottom: 8px; border-radius: 4px; border-left: 3px solid #2ecc71;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  ${contact.name ? `<strong style="color: #ecf0f1;">${escapeHtml(contact.name)}</strong><br>` : ''}
                  <span style="color: #3498db;">${escapeHtml(contact.email)}</span>
                  ${contact.phone ? `<br><span style="color: #95a5a6;"><i class="fas fa-phone"></i> ${escapeHtml(contact.phone)}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        });

        html += '</div>';
      });

      html += '</div>';
      container.innerHTML = html;
    }

    // Handle extraction completion
    function handleContactExtractionComplete() {
      console.log('Contact extraction completed');

      // Re-enable start button, disable pause/stop
      document.querySelector('#contact-extractor-section button[onclick="startContactExtraction()"]').disabled = false;
      document.querySelector('#contact-extractor-section button[onclick="pauseContactExtraction()"]').disabled = true;
      document.querySelector('#contact-extractor-section button[onclick="stopContactExtraction()"]').disabled = true;

      // Close WebSocket
      if (contactWs) {
        contactWs.close();
        contactWs = null;
      }
    }

    // Pause contact extraction
    function pauseContactExtraction() {
      contactPaused = true;
      if (contactWs) {
        contactWs.close();
        contactWs = null;
      }
      alert('Extraction paused. Click Start to resume with a new extraction.');
      handleContactExtractionComplete();
    }

    // Stop contact extraction
    async function stopContactExtraction() {
      if (!contactSessionId) return;

      try {
        await fetch(`${API_BASE_URL}/contact/session/${contactSessionId}`, {
          method: 'DELETE'
        });

        if (contactWs) {
          contactWs.close();
          contactWs = null;
        }

        contactSessionId = null;
        handleContactExtractionComplete();
      } catch (error) {
        console.error('Error stopping contact extraction:', error);
      }
    }

    // Clear contact extraction
    function clearContactExtraction() {
      document.getElementById('contactSmtpInput').value = '';
      document.getElementById('contactTotalCount').textContent = '0';
      document.getElementById('contactProcessedCount').textContent = '0';
      document.getElementById('contactFailedCount').textContent = '0';
      document.getElementById('contactContactsCount').textContent = '0';
      document.getElementById('contactResultsContainer').innerHTML = '<p style="color: #7f8c8d;">No contacts extracted yet. Start extraction to see results here.</p>';
      contactResults = [];

      if (contactSessionId) {
        stopContactExtraction();
      }
    }

    // Download contact results
    function downloadContactResults(format) {
      if (contactResults.length === 0) {
        alert('No contacts to download');
        return;
      }

      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        content = generateContactCsvExport();
        filename = `contacts-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'vcf') {
        content = generateContactVcfExport();
        filename = `contacts-${Date.now()}.vcf`;
        mimeType = 'text/vcard';
      } else if (format === 'txt') {
        content = generateContactTxtExport();
        filename = `contacts-${Date.now()}.txt`;
        mimeType = 'text/plain';
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Generate CSV export
    function generateContactCsvExport() {
      let csv = 'Name,Email,Phone\n';

      contactResults.forEach(contact => {
        const row = [
          contact.name || '',
          contact.email || '',
          contact.phone || ''
        ];

        csv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
      });

      return csv;
    }

    // Generate VCF export
    function generateContactVcfExport() {
      let vcf = '';

      contactResults.forEach(contact => {
        vcf += 'BEGIN:VCARD\n';
        vcf += 'VERSION:3.0\n';

        if (contact.name) {
          vcf += `FN:${contact.name}\n`;
        }

        if (contact.email) {
          vcf += `EMAIL:${contact.email}\n`;
        }

        if (contact.phone) {
          vcf += `TEL:${contact.phone}\n`;
        }

        vcf += 'END:VCARD\n';
      });

      return vcf;
    }

    // Generate TXT export
    function generateContactTxtExport() {
      let txt = 'EXTRACTED CONTACTS\n';
      txt += '='.repeat(80) + '\n\n';
      txt += `Total Contacts: ${contactResults.length}\n\n`;

      contactResults.forEach((contact, index) => {
        txt += `[${index + 1}] `;
        if (contact.name) {
          txt += `${contact.name} `;
        }
        txt += `<${contact.email}>`;
        if (contact.phone) {
          txt += ` | Phone: ${contact.phone}`;
        }
        txt += '\n';
      });

      return txt;
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
      // Check proxy status for inbox searcher
      checkInboxProxyStatus();
    });

    // =====================================================
    // Debounce Email Filter
    // =====================================================
    let debounceSessionId = null;
    let debounceWs = null;
    let debounceResults = null;

    // File upload handler
    document.getElementById('debounceEmailFile')?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('debounceEmailList').value = event.target.result;
      };
      reader.readAsText(file);
    });

    async function startDebounce() {
      const emailText = document.getElementById('debounceEmailList').value.trim();

      if (!emailText) {
        alert('Please enter or upload an email list');
        return;
      }

      try {
        // Disable start button
        document.getElementById('debounceStartBtn').disabled = true;
        document.getElementById('debounceStartBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Start processing (concurrency: 50 for faster processing)
        const response = await fetch(`${API_BASE}/debounce/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailText, concurrency: 50 })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to start processing');
        }

        debounceSessionId = data.sessionId;

        // Show progress card
        document.getElementById('debounceProgressCard').style.display = 'block';
        document.getElementById('debounceResultsCard').style.display = 'none';
        document.getElementById('debounceStatTotal').textContent = data.totalEmails;

        // Connect WebSocket for real-time updates
        connectDebounceWebSocket(debounceSessionId);

      } catch (error) {
        console.error('Debounce error:', error);
        alert(`Error: ${error.message}`);
        document.getElementById('debounceStartBtn').disabled = false;
        document.getElementById('debounceStartBtn').innerHTML = '<i class="fas fa-filter"></i> Start Filtering';
      }
    }

    let debouncePollingInterval = null;

    function connectDebounceWebSocket(sessionId) {
      // Try WebSocket first (works in localhost)
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'localhost:9090'
        : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/debounce/${sessionId}`;

      console.log('Attempting WebSocket connection:', wsUrl);

      try {
        debounceWs = new WebSocket(wsUrl);

        let wsConnected = false;

        debounceWs.onopen = () => {
          console.log('✅ Debounce WebSocket connected');
          wsConnected = true;
          document.getElementById('debounceCurrentStatus').textContent = 'Connected (WebSocket)';
        };

        debounceWs.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Debounce update:', data);

          if (data.type === 'connected') {
            document.getElementById('debounceCurrentStatus').textContent = 'Starting...';
          } else if (data.type === 'progress') {
            updateDebounceProgress(data);
          } else if (data.type === 'completed') {
            handleDebounceComplete();
          } else if (data.type === 'error') {
            handleDebounceError(data.error);
          }
        };

        debounceWs.onerror = (error) => {
          console.warn('⚠️ WebSocket failed, falling back to polling:', error);
          if (!wsConnected) {
            // WebSocket failed to connect, use polling instead
            startDebouncePolling(sessionId);
          }
        };

        debounceWs.onclose = () => {
          console.log('🔌 Debounce WebSocket disconnected');
          if (!wsConnected) {
            // WebSocket never connected, use polling
            startDebouncePolling(sessionId);
          }
        };

        // If WebSocket doesn't connect in 2 seconds, fall back to polling
        setTimeout(() => {
          if (!wsConnected) {
            console.log('⏱️ WebSocket timeout, switching to polling');
            if (debounceWs) {
              debounceWs.close();
            }
            startDebouncePolling(sessionId);
          }
        }, 2000);

      } catch (error) {
        console.error('❌ WebSocket creation failed:', error);
        startDebouncePolling(sessionId);
      }
    }

    function startDebouncePolling(sessionId) {
      console.log('📡 Starting polling mode for session:', sessionId);
      document.getElementById('debounceCurrentStatus').textContent = 'Processing (Polling)';

      // Poll every 1 second
      debouncePollingInterval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE}/debounce/status/${sessionId}`);
          const data = await response.json();

          if (!data.success) {
            console.error('Polling error:', data.error);
            return;
          }

          if (data.status === 'completed') {
            clearInterval(debouncePollingInterval);
            handleDebounceComplete();
          } else if (data.status === 'error') {
            clearInterval(debouncePollingInterval);
            handleDebounceError(data.error);
          } else if (data.results) {
            // Still processing, show progress
            const stats = data.results.stats || {};
            if (stats.processed) {
              updateDebounceProgress({
                processed: stats.processed,
                total: stats.total,
                safe: stats.safe,
                dangerous: stats.dangerous,
                filterRate: stats.filterRate,
                currentEmail: 'Processing...',
                currentResult: 'CHECKING',
                currentReason: 'Polling for updates...'
              });
            }
          }
        } catch (error) {
          console.error('Polling fetch error:', error);
        }
      }, 1000); // Poll every 1 second
    }

    function updateDebounceProgress(data) {
      const { processed, total, safe, dangerous, filterRate, currentEmail, currentResult, currentReason } = data;

      // Update progress bar
      const percentage = (processed / total * 100).toFixed(1);
      document.getElementById('debounceProgressBar').style.width = percentage + '%';
      document.getElementById('debounceProgressBar').textContent = percentage + '%';
      document.getElementById('debounceProgressText').textContent = `${processed}/${total} (${percentage}%)`;

      // Update stats
      document.getElementById('debounceStatSafe').textContent = safe;
      document.getElementById('debounceStatDangerous').textContent = dangerous;
      document.getElementById('debounceStatFilterRate').textContent = filterRate + '%';

      // Update current status
      document.getElementById('debounceCurrentStatus').textContent = 'Filtering...';
      document.getElementById('debounceCurrentEmail').textContent = currentEmail || '-';

      const resultClass = currentResult === 'SAFE' ? 'text-success' : 'text-danger';
      document.getElementById('debounceLastResult').innerHTML =
        `<span class="${resultClass}">${currentResult}</span> - ${currentReason || ''}`;
    }

    async function handleDebounceComplete() {
      console.log('✅ Debounce filtering complete');

      // Close WebSocket
      if (debounceWs) {
        debounceWs.close();
        debounceWs = null;
      }

      // Fetch final results
      try {
        const response = await fetch(`${API_BASE}/debounce/results/${debounceSessionId}`);
        const data = await response.json();

        if (data.success) {
          debounceResults = data.results;
          displayDebounceResults(data.results);
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
        alert('Processing complete, but failed to fetch results');
      }

      // Re-enable start button
      document.getElementById('debounceStartBtn').disabled = false;
      document.getElementById('debounceStartBtn').innerHTML = '<i class="fas fa-filter"></i> Start Filtering';
      document.getElementById('debounceCurrentStatus').textContent = 'Complete';
    }

    function handleDebounceError(error) {
      console.error('❌ Debounce error:', error);
      alert(`Error during filtering: ${error}`);

      // Close WebSocket
      if (debounceWs) {
        debounceWs.close();
        debounceWs = null;
      }

      // Re-enable start button
      document.getElementById('debounceStartBtn').disabled = false;
      document.getElementById('debounceStartBtn').innerHTML = '<i class="fas fa-filter"></i> Start Filtering';
      document.getElementById('debounceCurrentStatus').textContent = 'Error';
    }

    function displayDebounceResults(results) {
      const { stats, safe, dangerous } = results;

      // Update final stats
      document.getElementById('debounceFinalTotal').textContent = stats.total;
      document.getElementById('debounceFinalSafe').textContent = stats.safe;
      document.getElementById('debounceFinalDangerous').textContent = stats.dangerous;
      document.getElementById('debounceFinalFilterRate').textContent = stats.filterRate + '%';

      // Update counts in tabs
      document.getElementById('debounceSafeCount').textContent = stats.safe;
      document.getElementById('debounceDangerousCount').textContent = stats.dangerous;

      // Populate safe emails list
      const safeEmails = safe.map(r => r.email).join('\n');
      document.getElementById('debounceSafeList').value = safeEmails;

      // Populate dangerous emails list with reasons
      const dangerousEmails = dangerous.map(r => `${r.email} | ${r.reason}`).join('\n');
      document.getElementById('debounceDangerousList').value = dangerousEmails;

      // Show results card
      document.getElementById('debounceResultsCard').style.display = 'block';
    }

    function downloadDebounceResults(type) {
      if (!debounceSessionId) {
        alert('No results to download');
        return;
      }

      const downloadUrl = `${API_BASE}/debounce/download/${debounceSessionId}?type=${type}`;
      window.open(downloadUrl, '_blank');
    }

    function clearDebounce() {
      // Clear input
      document.getElementById('debounceEmailList').value = '';
      document.getElementById('debounceEmailFile').value = '';

      // Hide cards
      document.getElementById('debounceProgressCard').style.display = 'none';
      document.getElementById('debounceResultsCard').style.display = 'none';

      // Reset stats
      document.getElementById('debounceStatTotal').textContent = '0';
      document.getElementById('debounceStatSafe').textContent = '0';
      document.getElementById('debounceStatDangerous').textContent = '0';
      document.getElementById('debounceStatFilterRate').textContent = '0%';
      document.getElementById('debounceProgressBar').style.width = '0%';
      document.getElementById('debounceProgressBar').textContent = '0%';
      document.getElementById('debounceProgressText').textContent = '0/0 (0%)';
      document.getElementById('debounceCurrentStatus').textContent = 'Idle';
      document.getElementById('debounceCurrentEmail').textContent = '-';
      document.getElementById('debounceLastResult').textContent = '-';

      // Clear results
      debounceSessionId = null;
      debounceResults = null;

      // Close WebSocket if open
      if (debounceWs) {
        debounceWs.close();
        debounceWs = null;
      }

      // Stop polling if active
      if (debouncePollingInterval) {
        clearInterval(debouncePollingInterval);
        debouncePollingInterval = null;
      }
    }

    // =====================================================
    // Redirector Manager
    // =====================================================
    let redirectorPreviewData = null;
    let savedRedirectorLists = [];

    // File upload handler
    async function handleRedirectorFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        document.getElementById('redirectorRawInput').value = text;
        alert(`Loaded ${text.split('\n').filter(l => l.trim()).length} lines from file`);
      } catch (error) {
        console.error('File upload error:', error);
        alert('Error reading file: ' + error.message);
      }
    }

    // Preview redirectors
    async function previewRedirectors() {
      const rawText = document.getElementById('redirectorRawInput').value.trim();
      const targetLink = document.getElementById('redirectorTargetLink').value.trim();

      if (!rawText) {
        alert('Please provide raw redirector URLs');
        return;
      }

      if (!targetLink) {
        alert('Please provide a target link');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/redirector/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText, targetLink })
        });

        const result = await response.json();

        if (result.success) {
          // Store preview data
          redirectorPreviewData = result;

          // Update stats
          document.getElementById('redirectorStatExtracted').textContent = result.stats.extracted;
          document.getElementById('redirectorStatUnique').textContent = result.stats.unique;
          document.getElementById('redirectorStatFinal').textContent = result.stats.final;
          document.getElementById('redirectorStatTarget').textContent = targetLink;

          // Show preview
          document.getElementById('redirectorPreviewList').value = result.preview.join('\n');

          // Show preview card
          document.getElementById('redirectorPreviewCard').style.display = 'block';

          alert(`✅ Preview generated!\n\nExtracted: ${result.stats.extracted}\nUnique: ${result.stats.unique}\nFinal: ${result.stats.final}`);
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Preview error:', error);
        alert('Error generating preview: ' + error.message);
      }
    }

    // Save redirector list
    async function saveRedirectorList() {
      const name = document.getElementById('redirectorListName').value.trim();
      const rawText = document.getElementById('redirectorRawInput').value.trim();
      const targetLink = document.getElementById('redirectorTargetLink').value.trim();

      if (!name) {
        alert('Please provide a list name');
        return;
      }

      if (!rawText) {
        alert('Please provide raw redirector URLs');
        return;
      }

      if (!targetLink) {
        alert('Please provide a target link');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/redirector/lists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, rawText, targetLink })
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ Redirector list saved!\n\nName: ${name}\nRedirectors: ${result.list.stats.final}\nTarget: ${targetLink}`);

          // Clear form
          clearRedirectorForm();

          // Reload lists
          await loadRedirectorLists();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Save error:', error);
        alert('Error saving list: ' + error.message);
      }
    }

    // Load redirector lists
    async function loadRedirectorLists() {
      try {
        const response = await fetch(`${API_BASE}/redirector/lists`);
        const result = await response.json();

        if (result.success) {
          savedRedirectorLists = result.lists;
          renderRedirectorLists(result.lists);
        } else {
          alert('Error loading lists: ' + result.error);
        }
      } catch (error) {
        console.error('Load lists error:', error);
        alert('Error loading lists: ' + error.message);
      }
    }

    // Render redirector lists
    function renderRedirectorLists(lists) {
      const container = document.getElementById('redirectorListsContainer');

      if (!lists || lists.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No redirector lists saved yet. Create one above!</p>';
        return;
      }

      let html = '<div class="table-responsive"><table class="table table-dark table-striped">';
      html += '<thead><tr>';
      html += '<th>Name</th>';
      html += '<th>Target Link</th>';
      html += '<th>Count</th>';
      html += '<th>Created</th>';
      html += '<th>Actions</th>';
      html += '</tr></thead><tbody>';

      lists.forEach(list => {
        const created = new Date(list.createdAt).toLocaleDateString();
        html += '<tr>';
        html += `<td><strong>${list.name}</strong></td>`;
        html += `<td><small style="color: #3498db;">${list.targetLink}</small></td>`;
        html += `<td><span class="badge" style="background: #9b59b6;">${list.count}</span></td>`;
        html += `<td>${created}</td>`;
        html += '<td>';
        html += `<button class="btn btn-sm btn-info" onclick="viewRedirectorList('${list.name}')"><i class="fas fa-eye"></i></button> `;
        html += `<button class="btn btn-sm btn-success" onclick="downloadRedirectorList('${list.name}')"><i class="fas fa-download"></i></button> `;
        html += `<button class="btn btn-sm btn-danger" onclick="deleteRedirectorList('${list.name}')"><i class="fas fa-trash"></i></button>`;
        html += '</td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      container.innerHTML = html;
    }

    // View redirector list
    async function viewRedirectorList(name) {
      try {
        const response = await fetch(`${API_BASE}/redirector/lists/${encodeURIComponent(name)}`);
        const result = await response.json();

        if (result.success) {
          const list = result.list;
          let message = `📋 Redirector List: ${list.name}\n\n`;
          message += `🎯 Target: ${list.targetLink}\n`;
          message += `📊 Statistics:\n`;
          message += `  - Extracted: ${list.stats.extracted}\n`;
          message += `  - Unique: ${list.stats.unique}\n`;
          message += `  - Final: ${list.stats.final}\n\n`;
          message += `📅 Created: ${new Date(list.createdAt).toLocaleString()}\n`;
          message += `🔄 Updated: ${new Date(list.updatedAt).toLocaleString()}\n\n`;
          message += `First 5 redirectors:\n${list.redirectors.slice(0, 5).join('\n')}`;

          alert(message);
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('View error:', error);
        alert('Error viewing list: ' + error.message);
      }
    }

    // Download redirector list
    async function downloadRedirectorList(name) {
      try {
        const response = await fetch(`${API_BASE}/redirector/lists/${encodeURIComponent(name)}/download`);

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          alert('Error downloading list');
        }
      } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading list: ' + error.message);
      }
    }

    // Delete redirector list
    async function deleteRedirectorList(name) {
      if (!confirm(`Are you sure you want to delete the list "${name}"?`)) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/redirector/lists/${encodeURIComponent(name)}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ List "${name}" deleted successfully`);
          await loadRedirectorLists();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting list: ' + error.message);
      }
    }

    // Clear redirector form
    function clearRedirectorForm() {
      document.getElementById('redirectorListName').value = '';
      document.getElementById('redirectorTargetLink').value = '';
      document.getElementById('redirectorRawInput').value = '';
      document.getElementById('redirectorFileUpload').value = '';
      document.getElementById('redirectorPreviewCard').style.display = 'none';
      redirectorPreviewData = null;
    }

    // Update Dashboard SMTP Stats
    async function updateDashboardSmtpStats() {
      try {
        const status = await checkSmtpStatus();
        const statProfilesEl = document.getElementById('stat-profiles');

        if (statProfilesEl) {
          if (status.configured) {
            if (status.type === 'single') {
              statProfilesEl.textContent = '1';
            } else if (status.type === 'bulk') {
              statProfilesEl.textContent = status.count || '0';
            }
          } else {
            statProfilesEl.textContent = '0';
          }
        }
      } catch (error) {
        console.error('Failed to update dashboard SMTP stats:', error);
      }
    }

    // Load redirector lists on page load for Redirectors section
    document.addEventListener('DOMContentLoaded', function() {
      // Check proxy status on page load
      updateProxyNotices();

      // Update SMTP stats on dashboard
      updateDashboardSmtpStats();

      // Load redirector lists when switching to redirectors section
      const redirectorsNavLink = document.querySelector('[data-section="redirectors"]');
      if (redirectorsNavLink) {
        redirectorsNavLink.addEventListener('click', function() {
          loadRedirectorLists();
        });
      }

      // Load redirector lists for campaign dropdowns
      loadRedirectorListsForCampaigns();
    });

    // =====================================================
    // Campaign Link Source Toggle Functions
    // =====================================================

    // Toggle modal link input
    function toggleModalLinkInput() {
      const source = document.getElementById('modal-campaign-link-source').value;
      const directContainer = document.getElementById('modal-direct-link-container');
      const redirectorContainer = document.getElementById('modal-redirector-list-container');

      if (source === 'direct') {
        directContainer.style.display = 'block';
        redirectorContainer.style.display = 'none';
      } else if (source === 'redirector') {
        directContainer.style.display = 'none';
        redirectorContainer.style.display = 'block';
      } else {
        directContainer.style.display = 'none';
        redirectorContainer.style.display = 'none';
      }
    }

    // Toggle page link input
    function togglePageLinkInput() {
      const source = document.getElementById('page-campaign-link-source').value;
      const directContainer = document.getElementById('page-direct-link-container');
      const redirectorContainer = document.getElementById('page-redirector-list-container');

      if (source === 'direct') {
        directContainer.style.display = 'block';
        redirectorContainer.style.display = 'none';
      } else if (source === 'redirector') {
        directContainer.style.display = 'none';
        redirectorContainer.style.display = 'block';
      } else {
        directContainer.style.display = 'none';
        redirectorContainer.style.display = 'none';
      }
    }

    // Load redirector lists for campaign dropdowns
    async function loadRedirectorListsForCampaigns() {
      try {
        const response = await fetch(`${API_BASE}/redirector/lists`);
        const result = await response.json();

        if (result.success && result.lists.length > 0) {
          // Populate modal dropdown
          const modalDropdown = document.getElementById('modal-campaign-redirector-list');
          modalDropdown.innerHTML = '<option value="">Select a redirector list...</option>';
          result.lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.name;
            option.textContent = `${list.name} (${list.count} redirectors → ${list.targetLink})`;
            modalDropdown.appendChild(option);
          });

          // Populate page dropdown
          const pageDropdown = document.getElementById('page-campaign-redirector-list');
          pageDropdown.innerHTML = '<option value="">Select a redirector list...</option>';
          result.lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.name;
            option.textContent = `${list.name} (${list.count} redirectors → ${list.targetLink})`;
            pageDropdown.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Error loading redirector lists for campaigns:', error);
      }
    }

    // Get campaign link configuration
    function getCampaignLinkConfig(prefix) {
      const sourceElement = document.getElementById(`${prefix}-campaign-link-source`);
      const source = sourceElement ? sourceElement.value : 'none';

      if (source === 'direct') {
        return {
          type: 'direct',
          value: document.getElementById(`${prefix}-campaign-link`).value.trim()
        };
      } else if (source === 'redirector') {
        return {
          type: 'redirector',
          value: document.getElementById(`${prefix}-campaign-redirector-list`).value
        };
      } else {
        return {
          type: 'none',
          value: ''
        };
      }
    }
  </script>
</body>
</html>
