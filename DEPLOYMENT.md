# SE Gateway - Deployment Guide

## Overview
SE Gateway is deployed as a combined PHP frontend + Node.js backend service on Render.com using Docker.

## Architecture
- **Frontend**: PHP 8.1 with Apache (Port 10000)
- **Backend**: Node.js 20.x (Port 9090 internal)
- **Deployment**: Single Docker container running both services
- **Platform**: Render.com (Starter plan - $25/month)

## New Features (v2.1.0)
### Inbox Searcher
- Search email inboxes for keywords using validated SMTP credentials
- Real-time WebSocket progress updates
- Export results in TXT, CSV, JSON formats
- Requires proxy configuration for operation

### Contact Extractor
- Extract contact lists from email accounts
- Automatic deduplication by email address
- Export in CSV, VCF (vCard), TXT formats
- WebSocket real-time extraction progress

## Prerequisites
- GitHub repository connected to Render
- Docker configured with necessary dependencies:
  - Node.js 20.x
  - PHP 8.1
  - Chromium (for puppeteer)
  - IMAP support (for inbox/contact features)

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Add inbox searcher and contact extractor features"
git push origin main
```

### 2. Render Configuration
The `render.yaml` file is pre-configured with:
- Service type: Web service (Docker)
- Region: Oregon
- Plan: Starter ($25/month)
- Port: 10000
- Health check: `/`
- Auto-deploy: Enabled

### 3. Environment Variables
Set in Render dashboard:
```
NODE_ENV=production
PHP_ENV=production
DEBUG=false
PORT=10000
```

### 4. Deploy
1. Push changes to GitHub
2. Render will automatically deploy
3. Monitor build logs for any issues
4. Access the service at: https://your-service.onrender.com

## File Structure
```
/var/www/html/
├── index.php                    # Main frontend
├── backend/
│   ├── server/
│   │   ├── app.js              # Main backend server
│   │   ├── inboxRoutes.js      # Inbox searcher API
│   │   ├── contactRoutes.js    # Contact extractor API
│   │   └── ...
│   ├── lib/
│   │   ├── imapHandler.js      # IMAP connection handler
│   │   ├── tempStorage.js      # Temp file storage
│   │   └── ...
│   └── data/                   # Data storage directory
├── logs/                       # Application logs
└── docker-entrypoint.sh        # Startup script
```

## WebSocket Endpoints
The application provides three WebSocket endpoints:
1. `ws://domain/ws/combo/process/:sessionId` - SMTP validation
2. `ws://domain/ws/inbox/:sessionId` - Inbox searching
3. `ws://domain/ws/contacts/:sessionId` - Contact extraction

## API Endpoints

### Inbox Searcher
- `GET /api/inbox/proxy-check` - Check proxy configuration
- `POST /api/inbox/search` - Start inbox search
- `GET /api/inbox/status/:sessionId` - Get search status
- `GET /api/inbox/results/:sessionId` - Get search results
- `DELETE /api/inbox/session/:sessionId` - Delete session
- `GET /api/inbox/sessions` - List all sessions

### Contact Extractor
- `POST /api/contact/extract` - Start contact extraction
- `GET /api/contact/status/:sessionId` - Get extraction status
- `GET /api/contact/results/:sessionId` - Get extraction results
- `DELETE /api/contact/session/:sessionId` - Delete session
- `GET /api/contact/sessions` - List all sessions

## Dependencies
### Node.js Packages
- `express` - Web framework
- `nodemailer` - Email sending
- `imap` - IMAP email access (NEW)
- `mailparser` - Email parsing (NEW)
- `uuid` - Session ID generation (NEW)
- `puppeteer` - Browser automation
- `ws` - WebSocket server
- Additional packages in `backend/package.json`

### System Dependencies
- Node.js 20.x LTS
- PHP 8.1
- Apache 2.4
- Chromium (for puppeteer)

## Monitoring

### Health Checks
Render performs health checks on `/` endpoint every 30 seconds.

### Logs
- Application logs: `/var/www/html/logs/backend.log`
- Apache logs: `/var/log/apache2/error.log`, `/var/log/apache2/access.log`
- View in Render dashboard: Logs tab

### Backend Status
Check backend health:
```bash
curl http://localhost:9090/
```

## Troubleshooting

### Backend Not Starting
1. Check logs: `/var/www/html/logs/backend.log`
2. Verify Node.js dependencies installed: `npm list`
3. Check port 9090 is available

### IMAP Connection Issues
1. Verify proxy configuration in Proxies section
2. Check IMAP credentials format: `password|email` or `email:password`
3. Review `imapHandler.js` logs for connection errors

### WebSocket Connection Failed
1. Verify backend is running on port 9090
2. Check WebSocket upgrade path in `docker-entrypoint.sh`
3. Ensure Apache proxy modules enabled: `proxy`, `proxy_http`

### Memory Issues
- Starter plan has 2GB RAM
- Monitor memory usage in Render dashboard
- Consider upgrading to higher plan if needed

## Scaling
Current configuration:
- Single instance (Starter plan)
- 2GB RAM, 1 vCPU
- No auto-scaling

To scale:
1. Upgrade to Pro plan for more resources
2. Add horizontal scaling (multiple instances)
3. Add Redis for session management (shared state)
4. Consider separate backend service

## Security
- All SMTP passwords stored temporarily in session files
- Session files auto-deleted after 24 hours
- Proxy validation enforced for inbox searcher
- HTML escaping in frontend to prevent XSS
- HTTPS enforced by Render

## Backup
Data directories to backup:
- `/var/www/html/backend/data/smtp_profiles/`
- `/var/www/html/backend/data/campaigns/`
- `/var/www/html/backend/data/attachments/`

Consider enabling Render persistent disk for data persistence.

## Performance Optimization
1. **Concurrent Processing**: Both features process 5 accounts in parallel
2. **Temp File Storage**: Results saved incrementally for real-time updates
3. **WebSocket Updates**: Efficient real-time communication
4. **Session Cleanup**: Auto-delete old sessions to save disk space

## Cost Estimate
- Render Starter: $25/month
- Optional persistent disk: $0.25/GB/month
- Bandwidth: Included (100GB/month)

## Support
For deployment issues:
1. Check Render dashboard logs
2. Review `backend.log` for Node.js errors
3. Check Apache error logs
4. Verify all environment variables set correctly
