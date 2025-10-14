# SE Gateway PHP Sender v2.0 - Enhanced Edition

A military-grade SMS and Email gateway application with **unified interface**, advanced security features, attachment conversion, link protection, and **persistent SMTP configuration**.

## 🎯 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   # PHP dependencies
   composer install

   # Node.js dependencies
   cd backend && npm install
   ```

2. **Start the backend server:**
   ```bash
   cd backend && node server/app.js
   ```

3. **Start PHP server:**
   ```bash
   php -S localhost:8080
   ```

4. **Open the application:**
   - Navigate to `http://localhost:8080`
   - Use mode selector to switch between **Classic** and **Enhanced** modes

5. **Configure SMTP** (First time only):
   - Click **"Config SMTP"** button
   - Enter your Gmail/Outlook credentials
   - Click **"SET"**
   - ✅ Config saved automatically and persists across restarts!

---

## 🚀 Deploy to Render.com (Production)

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment

```bash
# 1. Push to GitHub
git add .
git commit -m "deploy: SE Gateway to Render"
git push origin main

# 2. Deploy on Render
# - Go to dashboard.render.com
# - Click "New +" → "Blueprint"
# - Connect your GitHub repository
# - Render auto-detects render.yaml

# 3. Set ONE environment variable (in Render Dashboard)
ALLOWED_ORIGINS = https://se-gateway-frontend.onrender.com

# 4. Wait for deployment (5-10 minutes)

# 5. Configure SMTP via app frontend
# - Open your app URL
# - Click "Config SMTP"
# - Enter credentials
# - Click "SET"

# ✅ Done! No SMTP environment variables needed!
```

### Environment Variables (Render)

**Required:**
```env
ALLOWED_ORIGINS = https://se-gateway-frontend.onrender.com
```

**Optional** (auto-configured by render.yaml):
```env
NODE_ENV = production
PORT = 10000
DEBUG = false
```

### SMTP Persistence

SMTP configurations are saved to disk and **automatically persist across restarts**:
- ✅ Configure once via UI
- ✅ Never configure again
- ✅ Survives deployments and restarts
- ✅ Easy to change if SMTP gets blacklisted
- ✅ Supports bulk SMTP (multiple accounts)

**For 100% guaranteed persistence** (optional, $0.25/month):
Uncomment the `disk` section in `render.yaml` to add a persistent disk.

---

## 🌟 Features

### Core Features
- **Unified Interface**: Switch between Classic and Enhanced modes
- **SMS Sending**: Send SMS via carrier email gateways (100+ carriers)
- **Email Sending**: Bulk email with validation
- **SMTP Persistence**: Configure once, works forever
- **Attachment Conversion**: HTML, QR Code, PDF formats
- **11-Step Link Protection**: Military-grade URL obfuscation
- **Unlimited SMTP Profiles**: Smart rotation and management
- **Domain Tracking**: Real-time email statistics

### Security Features
- **AES-256 Encryption**: Military-grade link protection
- **Email Authentication**: SPF, DKIM (RSA-2048), DMARC generation
- **Spam Analysis**: Real-time spam score calculation
- **Rate Limiting**: Per-domain protection
- **SSL/TLS 1.2+**: Enforced with certificate verification
- **Input Sanitization**: XSS and injection protection

### Advanced Features
- **Custom Delay & Priority**: Control send speed
- **Proxy Support**: SOCKS5, HTTP, SOCKS4
- **Email Validation**: Disposable email detection
- **Real-time Analytics**: Dashboard with metrics
- **Bulk Operations**: Multiple SMTP account rotation

---

## 📖 API Endpoints

### Enhanced API (Node.js - Port 9090)

```
# Attachment Conversion
POST /api/enhanced/convert/html           - Convert text to HTML
POST /api/enhanced/convert/qrcode         - Generate QR code
POST /api/enhanced/convert/pdf            - Convert to PDF

# Link Protection
POST /api/enhanced/link/obfuscate         - Obfuscate single link
POST /api/enhanced/link/protect-content   - Protect all links
POST /api/enhanced/link/tracking-pixel    - Generate tracking pixel

# SMTP Profile Management
POST /api/enhanced/smtp/profile/add       - Add SMTP profile
GET  /api/enhanced/smtp/profile/list      - List profiles
GET  /api/enhanced/smtp/stats             - Get statistics

# Email Security
POST /api/enhanced/security/dkim/generate - Generate DKIM keys
POST /api/enhanced/security/spf/generate  - Generate SPF record
POST /api/enhanced/security/dmarc/generate- Generate DMARC record
POST /api/enhanced/security/analyze-spam  - Analyze spam risk

# Enhanced Sending
POST /api/enhanced/send/enhanced          - Send with all features
```

### Backend API (Configuration)

```
GET  /                          - Health check
POST /config                    - Configure SMTP (persists to disk!)
POST /proxy                     - Configure proxies
POST /test                      - Test SMTP connection
POST /text                      - Send SMS
POST /email                     - Send emails
POST /validateEmails            - Validate email list
POST /smtp/verify               - Verify SMTP configuration
POST /smtp/health               - Check domain health (MX, SPF, DMARC)
```

---

## 🛠️ Configuration

### SMTP Setup (Persistent)

**Via Frontend (Recommended):**
1. Click **"Config SMTP"** button
2. Choose mode:
   - **Single Mode**: One SMTP account (Gmail, Outlook, etc.)
   - **Bulk Mode**: Multiple accounts (auto-rotation)
3. Enter credentials
4. Click **"SET"**
5. ✅ Configuration saved to `backend/data/smtp-config.json`
6. ✅ Auto-loads on every server restart!

**Single SMTP Example:**
```
Service: Gmail
User: your-email@gmail.com
Password: your-app-password
Secure: Yes
```

**Bulk SMTP Example (Rotation):**
```
account1@gmail.com|password1
account2@gmail.com|password2
account3@gmail.com|password3
```

**Gmail App Password:**
- Enable 2FA: https://myaccount.google.com/security
- Create App Password: https://myaccount.google.com/apppasswords

### Proxy Setup

1. Click **"Proxy"** button
2. Select protocol (HTTP/HTTPS, SOCKS4, SOCKS5)
3. Enter proxies (one per line):
   ```
   ip:port
   user:pass@ip:port
   ```
4. Click **"Add Proxies"**

---

## 💻 Development

### Prerequisites

- PHP 7.4+ or PHP 8.x
- Node.js 18.x or higher
- Composer
- npm

### Install Dependencies

```bash
# PHP dependencies
composer install

# Node.js dependencies
cd backend && npm install
```

### Enable Debug Mode

Edit `backend/lib/config.js`:
```javascript
debugEnabled: true
```

Or set in `.env`:
```env
DEBUG=true
```

### View Logs

```bash
# Backend logs (shown in terminal)
cd backend && node server/app.js

# PHP errors
tail -f logs/php_errors.log
```

---

## 📦 Project Structure

```
SE Gateway php Sender/
├── index.php                  # Main entry point (Classic + Enhanced modes)
├── enhanced.html              # Enhanced features dashboard
├── assets/
│   ├── css/
│   │   └── enhanced.css       # Modern UI styling
│   └── js/
│       └── enhanced.js        # Frontend API integration
├── lib/
│   ├── sender.php             # SMS sending handler
│   ├── email.php              # Email sending handler
│   ├── validate.php           # Email validation
│   ├── smtpconfig.php         # SMTP configuration
│   └── ...
├── backend/
│   ├── server/
│   │   ├── app.js             # Main backend server
│   │   └── enhancedRoutes.js  # Enhanced API routes
│   ├── lib/
│   │   ├── text.js            # SMS/Email core logic
│   │   ├── smtpStorage.js     # SMTP persistence (NEW!)
│   │   ├── smtpManager.js     # SMTP profile management
│   │   ├── linkProtection.js  # 11-step link obfuscation
│   │   └── emailSecurity.js   # DKIM/SPF/DMARC
│   └── data/
│       └── smtp-config.json   # Saved SMTP config (auto-created)
├── render.yaml                # Render.com deployment config
├── Dockerfile                 # Docker container config
└── README.md                  # This file
```

---

## 🔒 Security Best Practices

### Production Deployment

1. **Use App-Specific Passwords**
   - Never use your main email password
   - Create app passwords for Gmail/Outlook

2. **Configure CORS**
   - Set `ALLOWED_ORIGINS` to your actual domain
   - Don't use wildcard (*) in production

3. **Enable HTTPS**
   - Render.com provides free SSL certificates
   - Always use HTTPS in production

4. **Rotate Credentials**
   - Change SMTP passwords periodically
   - Easy via frontend UI (no redeploy needed!)

5. **Monitor Usage**
   - Check SMTP sending limits
   - Monitor for blacklisting

### SMTP Config Security

- ✅ Config file (`smtp-config.json`) excluded from git
- ✅ Not exposed via API endpoints
- ✅ Only backend process can access
- ✅ Same security level as environment variables

---

## 🐛 Troubleshooting

### SMTP Connection Issues

**Gmail:**
- Use App Password (not main password)
- Enable 2FA first
- Port 465 (SSL) or 587 (TLS)

**Outlook/Yahoo:**
- Enable "Less secure apps" or use app password
- Check firewall settings

### SMS Not Sending

- Verify carrier matches recipient's provider
- Phone format: 10 digits (US), no country code
- Check SMTP is configured correctly

### SMTP Config Lost After Restart?

**Free Tier:**
- Usually persists across restarts
- May reset on major platform updates (rare)

**Solution for 100% persistence:**
- Add Render Persistent Disk ($0.25/month)
- Uncomment `disk` section in `render.yaml`

### Frontend Can't Connect to Backend

**Check:**
1. Backend running on correct port (9090)
2. `ALLOWED_ORIGINS` includes frontend URL
3. Update `API_BASE` in `assets/js/enhanced.js`:
   ```javascript
   const API_BASE = 'https://se-gateway-backend.onrender.com/api/enhanced';
   ```

---

## 💰 Cost (Render.com)

### Free Tier
```
Frontend: $0/month
Backend: $0/month
Total: $0/month
```
- 750 hours/month per service
- Services sleep after 15min inactivity
- Good for: Testing, personal projects

### Starter Tier (Recommended for Production)
```
Frontend: $7/month
Backend: $7/month
Persistent Disk: $0.25/month (optional)
Total: $14-$14.25/month
```
- Always-on (no cold starts)
- Better performance
- Persistent SMTP config guaranteed

---

## 📝 Changelog

### v2.0 Enhanced Edition
- ✨ **SMTP Persistence**: Configure once, works forever
- ✨ **Unified Interface**: Classic + Enhanced modes
- ✨ **Enhanced Features**: 22 new API endpoints
- ✨ **Link Protection**: 11-step military-grade obfuscation
- ✨ **SMTP Profiles**: Unlimited accounts with rotation
- ✨ **Email Security**: DKIM/SPF/DMARC generation
- ✨ **Modern UI**: Professional light theme, high contrast
- ✨ **Cloud Ready**: One-click Render.com deployment
- 🔧 **Simplified Deploy**: 90% fewer environment variables

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👤 Credits

- **Built by**: Billioncodes
- **Based on**: TextBelt architecture
- **Icons**: Font Awesome
- **UI Framework**: Bootstrap 5

---

## 📞 Support

### Issues & Questions
- GitHub Issues: [Your Repository Issues](https://github.com/your-username/your-repo/issues)
- Email: your-email@example.com

### Documentation
- **Render Deployment**: See `render.yaml` comments
- **SMTP Persistence**: Configured via frontend UI
- **API Reference**: See API Endpoints section above

### Helpful Links
- Render.com Docs: https://render.com/docs
- Gmail App Passwords: https://myaccount.google.com/apppasswords
- DKIM Guide: https://support.google.com/a/answer/174124

---

## 🎉 Getting Started

```bash
# 1. Clone repository
git clone https://github.com/your-username/se-gateway.git
cd se-gateway

# 2. Install dependencies
composer install
cd backend && npm install

# 3. Start backend
node server/app.js

# 4. Start PHP server (new terminal)
php -S localhost:8080

# 5. Open browser
open http://localhost:8080

# 6. Configure SMTP (first time)
# Click "Config SMTP" → Enter credentials → Save

# 7. Send SMS/Email
# Works immediately and persists forever!
```

---

**Version**: 2.0 Enhanced with SMTP Persistence
**Last Updated**: October 2025
**Status**: Production Ready ✅
