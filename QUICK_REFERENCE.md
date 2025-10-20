# SE Gateway - Quick Reference Guide

## 🚀 Latest Deployment

**All fixes have been pushed to production!**

The deployment will complete automatically via Render webhook in ~5 minutes.

---

## ✅ What Was Fixed

### 1. SMTP Test Buttons (CRITICAL FIX)
**Problem:** All TEST/VERIFY/HEALTH buttons showed `ECONNREFUSED 127.0.0.1:587`

**Solution:** All 8 test functions now read form values before testing

**What you'll see now:**
- Fill in service + credentials → Click TEST → Get real SMTP server response
- No more localhost errors
- Actual authentication errors from real mail servers

---

### 2. Bulk SMTP UI
**Problem:** Confusing format, hard to read text

**Solution:**
- Dynamic placeholder that changes based on service selection
- Added "Custom SMTP" option for manual configuration
- Better text contrast (white text on dark background)
- Color-coded format hints

**How to use:**
```
WITH SERVICE (Gmail, Yahoo, etc.):
password123|user@gmail.com
mypass456|user2@yahoo.com

WITHOUT SERVICE (Custom SMTP):
smtp.example.com|587|user@example.com|password123
mail.domain.com|465|admin@domain.com|secret456
```

---

### 3. Proxy Testing
**Problem:** Proxy test showed JSON parse errors

**Solution:**
- Fixed endpoint routing
- Added proxy authentication
- Proper tunneling through proxy for mail port tests

---

## 📋 Testing Your Setup

### Single SMTP Test
1. Go to **SMTP Profiles** tab
2. Select a service (e.g., "Gmail", "Hotmail")
3. Enter email and password
4. Click **TEST** button
5. Wait for result (may take 5-10 seconds)

**Expected Results:**
- ✅ Success: "Connection successful"
- ❌ Wrong password: "Invalid login" or "Authentication unsuccessful"
- ⚠️ Network issue: "Connection timeout"

---

### Bulk SMTP Test
1. Go to **SMTP Profiles** → **Configure Multiple SMTP Accounts**
2. Select service OR choose "Custom SMTP"
3. Enter accounts in correct format
4. Click **TEST ALL**

**Format depends on selection:**
- **With Service:** `password|email`
- **Custom SMTP:** `host|port|username|password`

---

## 🔧 Troubleshooting

### "Authentication unsuccessful" with Outlook/Hotmail

**Error Message:**
```
535 5.7.139 Authentication unsuccessful, basic authentication is disabled
```

**Cause:** Outlook requires app-specific passwords

**Solution:**
1. Go to https://account.microsoft.com/security
2. Navigate to "Security" → "Advanced security options"
3. Under "Additional security" → "App passwords"
4. Generate new app password
5. Use that password (NOT your regular password)

---

### "Connection timeout"

**Possible Causes:**
1. Firewall blocking SMTP ports (25, 465, 587)
2. Wrong SMTP server address
3. Network connectivity issues
4. Proxy misconfiguration

**Solution:**
- Check your network allows SMTP traffic
- Verify SMTP server address is correct
- Try different ports (465 for SSL, 587 for TLS)

---

### "Connection refused"

**If you still see localhost errors:**
1. Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
2. Clear browser cache
3. Wait 5 minutes for deployment to complete
4. Try again

**If issue persists after deployment:**
- Check browser console for JavaScript errors
- Verify you selected a service from dropdown
- Ensure all fields are filled

---

## 🎯 Best Practices

### SMTP Configuration

**Gmail:**
- Use app-specific password (not your regular password)
- Enable "Less secure app access" OR use OAuth2
- Format: `apppassword|yourname@gmail.com`

**Outlook/Hotmail:**
- MUST use app-specific password
- Basic auth disabled by default
- Format: `apppassword|yourname@outlook.com`

**Yahoo:**
- Generate app password from account security
- Format: `apppassword|yourname@yahoo.com`

**Custom SMTP:**
- Get settings from your email provider
- Common ports: 25 (plain), 465 (SSL), 587 (TLS)
- Format: `smtp.yourprovider.com|587|user|pass`

---

### Bulk SMTP

**Performance Tips:**
- Start with 5-10 accounts for testing
- Bulk test can take time (2-5 seconds per account)
- Monitor for rate limiting from providers

**Format Validation:**
- Each line = one account
- Use pipe `|` as separator (NOT comma or space)
- No spaces around separators
- One account per line

---

## 📊 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Single SMTP Test | ✅ Working | Tests current form values |
| Bulk SMTP Test | ✅ Working | Tests all accounts |
| SMTP Verify | ✅ Working | Same as TEST |
| SMTP Health | ✅ Working | Checks DNS records |
| Proxy Test | ✅ Working | Real connectivity check |
| Attachment Upload | ✅ Working | Fixed download path |
| Proxy Add | ✅ Working | Accumulates proxies |

---

## 🆘 Support

### Quick Checks

**TEST button not working?**
1. Service selected? ✓
2. Username filled? ✓
3. Password filled? ✓
4. Deployment complete? (wait 5 minutes) ✓

**Still showing localhost errors?**
1. Clear browser cache
2. Hard refresh page
3. Check browser console for errors
4. Verify deployment completed on Render

**Text hard to read?**
- Contrast improved in latest deployment
- If still hard to read, report specific fields

---

## 📁 Related Files

- `DEPLOYMENT_SUMMARY.md` - Full technical documentation
- `README.md` - Complete project documentation
- `index.php` - Frontend SMTP forms (lines 1700-3300)
- `backend/server/app.js` - SMTP test endpoints

---

## 🔄 Version History

**Current Session (Oct 20, 2025):**
- ✅ Fixed all SMTP test functions
- ✅ Fixed proxy testing infrastructure
- ✅ Improved bulk SMTP UI/UX
- ✅ Enhanced text contrast
- ✅ Added dynamic placeholders

**Previous Session:**
- README comprehensive update
- Connection pooling implementation
- Inbox searcher & contact extractor

---

**Last Updated:** October 20, 2025
**Deployment Status:** ✅ All changes pushed to production
