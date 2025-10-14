# SE Gateway PHP Sender v2.0 - Enhanced Edition

A military-grade SMS and Email gateway application with **unified interface**, advanced security features, attachment conversion, link protection, and unlimited SMTP profile management.

## 🎯 Quick Start

1. **Start the backend server:**
   ```bash
   cd backend && node server/app.js
   ```

2. **Open the application:**
   - Open `index.php` in your browser
   - Use the mode selector (top-right) to switch between **Classic** and **Enhanced** modes

3. **Choose your mode:**
   - **Classic Mode** - Original SMS client (default)
   - **Enhanced Mode** - Advanced features dashboard

> 📖 See [INTERFACE_GUIDE.md](INTERFACE_GUIDE.md) for complete interface documentation

## 🌟 Enhanced Features (NEW!)

### Core Features
- **Unified Interface**: Switch between Classic and Enhanced modes seamlessly 🆕
- **SMS Sending**: Send SMS messages via carrier email gateways
- **Email Sending**: Send bulk emails with validation
- **Attachment Conversion**: Convert to HTML, QR Code, PDF formats ✨
- **11-Step Link Protection**: Military-grade link obfuscation ✨
- **Unlimited SMTP Profiles**: Smart profile management with auto-selection ✨
- **Domain Tracking**: Real-time email count tracking across all domains ✨

### Security Features
- **Military-Grade Security**: AES-256 encryption, DKIM signing ✨
- **Email Authentication**: SPF, DKIM, DMARC generation & verification ✨
- **Spam Analysis**: Real-time spam score calculation ✨
- **Rate Limiting**: Per-domain protection ✨
- **SSL/TLS 1.2+**: Enforced with certificate verification

### Advanced Features
- **Custom Delay & Priority**: Control send speed and priority ✨
- **Proxy Support**: Enhanced SOCKS5, HTTP, SOCKS4 support
- **Link Obfuscation**: 11 protection steps with rotation ✨
- **Email Validation**: Reputation checking with disposable detection
- **Carrier Support**: 100+ mobile carriers worldwide
- **Profile Manager**: Intelligent SMTP selection based on usage ✨
- **Real-time Analytics**: Dashboard with statistics and metrics ✨

> ✨ = New Enhanced Feature | 🆕 = Latest Addition

## Prerequisites

- PHP 7.4 or higher
- Node.js 14.x or higher
- Composer
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd "SE Gateway php Sender"
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node.js dependencies

```bash
cd backend
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your SMTP credentials:

```env
SMTP_SERVICE=Gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 5. Create logs directory

```bash
mkdir -p logs
chmod 755 logs
```

## Usage

### Start the Backend Server

```bash
cd backend
npm start
```

The server will start on `http://localhost:9090`

### Access the Frontend

1. Configure your web server (Apache/Nginx) to serve the root directory
2. Or use PHP's built-in server:

```bash
php -S localhost:8080
```

3. Open `http://localhost:8080` in your browser

## Configuration

### SMTP Setup

1. Click **"Config SMTP"** button
2. Enter your backend API URL (e.g., `http://localhost:9090`)
3. Choose a service provider or use custom SMTP
4. Enter credentials:
   - **Normal Mode**: Single username/password
   - **Bulk Mode**: Multiple credentials (format: `user|pass` per line)
5. Click **TEST** to verify connection
6. Click **SET** to save configuration

### Proxy Setup

1. Click **"Proxy"** button
2. Select protocol (HTTP/HTTPS, SOCKS4, or SOCKS5)
3. Enter proxies:
   - Format: `ip:port` or `user:pass@ip:port`
   - One per line
4. Click **"Add Proxies"**

### SMS Mode

1. Enter sender name and address
2. Enter your message
3. Add link (optional)
4. Select carrier
5. Paste phone numbers (one per line)
6. Click **"Send SMS now!"**

### Email Mode

1. Click **"EMAIL MODE"** button
2. Enter sender name and email address
3. Enter subject and message
4. Paste email addresses (one per line or comma-separated)
5. Optionally add custom denylist domains
6. Click **"VALIDATE"** to clean the list
7. Click **"Send Email now!"**

## API Endpoints

### Enhanced API (NEW! - Node.js) ✨

```
# Attachment Conversion
POST /api/enhanced/convert/html           - Convert text to HTML
POST /api/enhanced/convert/qrcode         - Generate QR code
POST /api/enhanced/convert/qrcode-html    - QR code HTML page
POST /api/enhanced/convert/pdf            - Convert to PDF

# Link Protection
POST /api/enhanced/link/obfuscate         - Obfuscate single link
POST /api/enhanced/link/protect-content   - Protect all links in content
POST /api/enhanced/link/tracking-pixel    - Generate tracking pixel
POST /api/enhanced/link/redirect-page     - Create redirect page

# SMTP Profile Management
POST /api/enhanced/smtp/profile/add       - Add SMTP profile
GET  /api/enhanced/smtp/profile/list      - List all profiles
GET  /api/enhanced/smtp/profile/:id       - Get profile by ID
PUT  /api/enhanced/smtp/profile/:id       - Update profile
DELETE /api/enhanced/smtp/profile/:id     - Delete profile
GET  /api/enhanced/smtp/profile/:id/stats - Get profile statistics
GET  /api/enhanced/smtp/stats/domains     - Get domain statistics

# Email Security
POST /api/enhanced/security/dkim/generate - Generate DKIM keys
POST /api/enhanced/security/spf/generate  - Generate SPF record
POST /api/enhanced/security/dmarc/generate - Generate DMARC record
POST /api/enhanced/security/verify        - Verify domain security
POST /api/enhanced/security/analyze-spam  - Analyze spam risk
POST /api/enhanced/security/rate-limit    - Check rate limit

# Enhanced Sending
POST /api/enhanced/send/enhanced          - Send with all features
```

### Backend API (Node.js)

```
GET  /                          - Health check
POST /config                    - Configure SMTP
POST /proxy                     - Configure proxies
POST /test                      - Test SMTP connection
POST /text                      - Send SMS
POST /email                     - Send emails
POST /validateEmails            - Validate email list
POST /smtp/verify               - Verify SMTP configuration
POST /smtp/health               - Check domain health (MX, SPF, DMARC)
```

### Frontend PHP Endpoints

```
lib/sender.php       - SMS sending handler
lib/email.php        - Email sending handler
lib/validate.php     - Email validation handler
lib/apicheck.php     - API health check
lib/proxifier.php    - Proxy configuration
lib/smtpconfig.php   - SMTP configuration
lib/smtpverify.php   - SMTP verification
lib/smtphealth.php   - Domain health check
```

## Security Features

- **XSS Protection**: All user inputs are sanitized
- **SSL/TLS**: Enforced TLS 1.2+ with certificate verification
- **Input Validation**: Comprehensive validation on all endpoints
- **Error Logging**: Errors logged to file, not displayed to users
- **CORS Control**: Configurable origin restrictions

## Troubleshooting

### SMTP Connection Issues

- **Gmail**: Use App Password if 2FA is enabled
- **Port 465**: Secure SSL connection
- **Port 587**: STARTTLS connection
- Check firewall settings

### SMS Not Sending

- Verify carrier selection matches recipient's carrier
- Check phone number format (10 digits, no country code for US)
- Ensure SMTP is configured correctly

### Email Validation Issues

- Backend server must be running
- Check API URL in browser console
- Verify network connectivity

### Proxy Issues

- Verify proxy format: `ip:port` or `user:pass@ip:port`
- Test proxy connectivity separately
- Check protocol selection (HTTP vs SOCKS)

## Development

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
# PHP errors
tail -f logs/php_errors.log

# Node.js console
# Already displayed in terminal where server is running
```

## Cloud Deployment (Render.com)

### Quick Deploy

Deploy to Render.com with automatic GitHub integration:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Step-by-Step Guide

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: add deployment configuration"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create 2 services
   - Configure environment variables (see `.env.production`)

3. **Configure Environment Variables**
   Required variables:
   ```env
   # Backend Service
   SMTP_SERVICE=Gmail
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ALLOWED_ORIGINS=https://your-frontend.onrender.com

   # Frontend Service
   BACKEND_URL=https://your-backend.onrender.com
   ```

4. **Access Your App**
   - Frontend: `https://se-gateway-frontend.onrender.com`
   - Backend: `https://se-gateway-backend.onrender.com`

**Complete deployment guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### Manual/VPS Deployment

For manual deployment on VPS or traditional hosting:

1. Set environment to production:

```env
NODE_ENV=production
DEBUG=false
```

2. Configure allowed origins:

```env
ALLOWED_ORIGINS=https://yourdomain.com
```

3. Use process manager (PM2):

```bash
npm install -g pm2
cd backend
pm2 start server/app.js --name sms-gateway
pm2 save
pm2 startup
```

4. Set up reverse proxy (Nginx example):

```nginx
location /api {
    proxy_pass http://localhost:9090;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions, please contact the development team.

## Credits

- Built by Billioncodes
- Based on TextBelt architecture
- Font Awesome for icons
