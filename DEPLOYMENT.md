# Deployment Guide - Render.com

Complete step-by-step guide to deploy SE Gateway PHP Sender on Render.com with automatic GitHub deployments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Deploy](#quick-deploy)
- [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Custom Domain](#custom-domain)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. GitHub Repository
- Push your code to GitHub (public or private repository)
- Ensure all deployment files are committed:
  - `render.yaml`
  - `Dockerfile`
  - `docker-entrypoint.sh`
  - `build.sh`
  - `.env.production` (template only, not real values)

### 2. Render.com Account
- Sign up at [render.com](https://render.com)
- No credit card required for free tier
- Connect your GitHub account

### 3. SMTP Credentials
- Gmail: [Create App Password](https://myaccount.google.com/apppasswords) (if 2FA enabled)
- Or use any SMTP service credentials

---

## Quick Deploy

### Option 1: Deploy from Dashboard (Recommended)

1. **Login to Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Blueprint"

2. **Connect GitHub Repository**
   - Select your repository
   - Render will detect `render.yaml` automatically

3. **Configure Environment Variables**
   - Set required variables (see [Environment Variables](#environment-variables) section)

4. **Deploy**
   - Click "Apply" to deploy both services
   - Wait 5-10 minutes for first deployment

### Option 2: Deploy with render.yaml

If you have `render.yaml` in your repository root, Render will automatically configure both services.

---

## Manual Setup

### Step 1: Create Backend Service

1. **Dashboard → New Web Service**
   ```
   Name: se-gateway-backend
   Environment: Node
   Region: Oregon (or nearest)
   Branch: main
   Build Command: cd backend && npm install
   Start Command: node backend/server/app.js
   Plan: Free
   ```

2. **Set Environment Variables**
   ```env
   NODE_ENV=production
   PORT=10000
   SMTP_SERVICE=Gmail
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_SECURE=true
   ALLOWED_ORIGINS=https://se-gateway-frontend.onrender.com
   DEBUG=false
   ```

3. **Deploy Backend**
   - Click "Create Web Service"
   - Note the backend URL: `https://se-gateway-backend.onrender.com`

### Step 2: Create Frontend Service

1. **Dashboard → New Web Service**
   ```
   Name: se-gateway-frontend
   Environment: Docker
   Region: Oregon (or nearest)
   Branch: main
   Dockerfile Path: ./Dockerfile
   Plan: Free
   ```

2. **Set Environment Variables**
   ```env
   BACKEND_URL=https://se-gateway-backend.onrender.com
   BACKEND_INTERNAL_URL=http://se-gateway-backend:10000
   PHP_ENV=production
   ```

3. **Deploy Frontend**
   - Click "Create Web Service"
   - Your app will be live at: `https://se-gateway-frontend.onrender.com`

---

## Environment Variables

### Required Variables

#### Backend Service
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `10000` | Server port (Render default) |
| `SMTP_SERVICE` | `Gmail` | Email provider |
| `SMTP_USER` | Your email | SMTP username |
| `SMTP_PASS` | App password | SMTP password |
| `SMTP_SECURE` | `true` | Use SSL/TLS |
| `ALLOWED_ORIGINS` | Frontend URL | CORS origins |
| `DEBUG` | `false` | Disable debug mode |

#### Frontend Service
| Variable | Value | Description |
|----------|-------|-------------|
| `BACKEND_URL` | Backend URL | Public API endpoint |
| `BACKEND_INTERNAL_URL` | Internal URL | Service-to-service URL |
| `PHP_ENV` | `production` | PHP environment |

### How to Set Environment Variables

#### Method 1: Render Dashboard
1. Go to your service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Enter key and value
5. Click "Save Changes"

#### Method 2: render.yaml (Recommended)
Already configured in `render.yaml` - just update values in Render dashboard after deployment.

---

## Post-Deployment

### 1. Verify Backend Health
```bash
curl https://se-gateway-backend.onrender.com/
```
**Expected Response:**
```json
{"status": "Server is up!", "timestamp": "..."}
```

### 2. Test Frontend
Open: `https://se-gateway-frontend.onrender.com`
- Should see SE Gateway interface
- Click "Enhanced Mode" to test features

### 3. Test API Connection
In browser console (F12):
```javascript
fetch('https://se-gateway-backend.onrender.com/api/enhanced/smtp/stats')
  .then(r => r.json())
  .then(console.log)
```

### 4. Update Frontend API URL
If using hardcoded API URL in `assets/js/enhanced.js`:
```javascript
// Update this line
const API_BASE = 'https://se-gateway-backend.onrender.com/api/enhanced';
```

---

## Custom Domain

### Add Custom Domain to Frontend

1. **In Render Dashboard**
   - Go to se-gateway-frontend service
   - Click "Settings" → "Custom Domains"
   - Click "Add Custom Domain"
   - Enter your domain: `app.yourdomain.com`

2. **Update DNS Records**
   Render will provide DNS records (A or CNAME):
   ```
   Type: CNAME
   Name: app
   Value: se-gateway-frontend.onrender.com
   ```

3. **Wait for SSL Certificate**
   - Render automatically provisions Let's Encrypt SSL
   - Usually takes 5-15 minutes

4. **Update Environment Variables**
   Update `ALLOWED_ORIGINS` in backend:
   ```env
   ALLOWED_ORIGINS=https://app.yourdomain.com,https://yourdomain.com
   ```

---

## Automatic Deployments

### How It Works
```
GitHub Push → Render Webhook → Auto Build → Auto Deploy
```

### Configure Auto-Deploy

1. **In Render Dashboard**
   - Go to service → Settings
   - "Auto-Deploy" should be enabled by default

2. **Test Auto-Deploy**
   ```bash
   # Make a change
   echo "# Test" >> README.md
   git add .
   git commit -m "test: trigger auto deploy"
   git push origin main
   ```

3. **Monitor Deployment**
   - Go to Render Dashboard → Events tab
   - See real-time build logs

### Disable Auto-Deploy (Optional)
- Settings → Build & Deploy → Auto-Deploy: OFF
- Deploy manually via "Manual Deploy" button

---

## Monitoring & Logs

### View Logs

#### Backend Logs
```bash
# In Render Dashboard
se-gateway-backend → Logs tab
```

#### Frontend Logs
```bash
# In Render Dashboard
se-gateway-frontend → Logs tab
```

### Health Checks

Render automatically monitors:
- HTTP health check every 30s
- Auto-restart on failures
- Email notifications on downtime

### Metrics

Dashboard shows:
- CPU usage
- Memory usage
- Response times
- Request counts

---

## Scaling & Upgrading

### Free Tier Limitations
- 750 hours/month free
- Services spin down after 15min inactivity
- Cold start: ~30 seconds
- Shared resources

### Upgrade Options

#### Starter Plan ($7/month per service)
- Always-on (no cold starts)
- More CPU and RAM
- Priority support

#### Standard Plan ($25/month per service)
- Even more resources
- Horizontal scaling
- DDoS protection

### How to Upgrade
1. Dashboard → Service → Settings
2. Change Instance Type
3. Confirm payment

---

## Troubleshooting

### Issue: Build Failed

**Symptoms:**
```
Error: Build failed with exit code 1
```

**Solutions:**
1. Check `build.sh` has execute permissions:
   ```bash
   chmod +x build.sh docker-entrypoint.sh
   git add .
   git commit -m "fix: add execute permissions"
   git push
   ```

2. Check Composer dependencies:
   ```bash
   composer validate
   composer install
   ```

3. Check Node.js dependencies:
   ```bash
   cd backend
   npm install
   ```

### Issue: Backend Not Responding

**Symptoms:**
```
502 Bad Gateway
503 Service Unavailable
```

**Solutions:**
1. Check backend logs for errors
2. Verify environment variables are set
3. Check if backend health check is passing
4. Restart service: Dashboard → Manual Deploy

### Issue: Frontend Can't Connect to Backend

**Symptoms:**
- Frontend loads but features don't work
- Console errors: "Failed to fetch"

**Solutions:**
1. Check `ALLOWED_ORIGINS` includes frontend URL
2. Update `API_BASE` in `assets/js/enhanced.js`:
   ```javascript
   const API_BASE = 'https://se-gateway-backend.onrender.com/api/enhanced';
   ```
3. Clear browser cache (Ctrl+Shift+R)

### Issue: Cold Starts (Free Tier)

**Symptoms:**
- First request takes 30+ seconds
- Service spins down after inactivity

**Solutions:**
1. Upgrade to Starter plan ($7/month)
2. Use a monitoring service to ping every 10 minutes:
   - UptimeRobot (free)
   - Cron-job.org (free)
   - Set ping URL: `https://se-gateway-backend.onrender.com/`

### Issue: SMTP Authentication Failed

**Symptoms:**
```
Error: Invalid login
535 Authentication failed
```

**Solutions:**
1. **For Gmail:**
   - Enable 2FA: [Google Account Security](https://myaccount.google.com/security)
   - Create App Password: [App Passwords](https://myaccount.google.com/apppasswords)
   - Use app password in `SMTP_PASS`

2. **For Other Providers:**
   - Verify credentials are correct
   - Check if "Less secure apps" is enabled (if required)
   - Try different ports: 587 (TLS) or 465 (SSL)

### Issue: Logs Not Showing

**Solutions:**
1. Ensure `console.log` statements exist in code
2. Check LOG_LEVEL environment variable
3. Logs may take 10-30 seconds to appear

### Issue: Database Connection (If Added Later)

**Solutions:**
1. Add PostgreSQL via Render:
   - Dashboard → New → PostgreSQL
   - Copy connection URL
   - Add as `DATABASE_URL` environment variable

2. Update backend to use connection URL

---

## Performance Optimization

### 1. Enable Caching
Add to `backend/server/app.js`:
```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
});
```

### 2. Compress Responses
```bash
npm install compression
```
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Use CDN for Static Assets
- Upload assets to Cloudflare CDN
- Update asset URLs in HTML

---

## Security Best Practices

### 1. Environment Variables
- ✅ Store sensitive data in Render env vars
- ❌ Never commit `.env` with real values
- ✅ Use strong SMTP passwords
- ✅ Rotate credentials regularly

### 2. CORS Configuration
- Only allow trusted origins
- Update `ALLOWED_ORIGINS` to match your domains

### 3. Rate Limiting
Backend already includes rate limiting. Adjust in `backend/server/app.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### 4. HTTPS Only
- Render provides free SSL certificates
- Enforce HTTPS in backend:
```javascript
if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
  res.redirect(`https://${req.header('host')}${req.url}`);
}
```

---

## Rollback to Previous Version

### Method 1: Via Dashboard
1. Go to service → Events
2. Find previous successful deployment
3. Click "..." → "Rollback to this version"

### Method 2: Via Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## Cost Estimate

### Free Tier (Recommended for Testing)
- 2 services × $0 = **$0/month**
- 750 hours/month per service
- Spins down after 15min inactivity

### Starter Tier (Recommended for Production)
- 2 services × $7 = **$14/month**
- Always-on
- Better performance
- No cold starts

### Standard Tier (For High Traffic)
- 2 services × $25 = **$50/month**
- Horizontal scaling
- More resources
- Priority support

---

## Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Email: support@render.com

### SE Gateway Issues
- GitHub Issues: (your-repo-url)/issues
- Email: (your-email)

---

## Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Backend health check passing
- [ ] Frontend loads correctly
- [ ] API connection working
- [ ] SMTP credentials tested
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy enabled
- [ ] Monitoring set up
- [ ] Backup plan in place

---

**Deployment Date:** `date +%Y-%m-%d`
**Version:** SE Gateway v2.0 Enhanced
**Platform:** Render.com
**Status:** Production Ready ✅
