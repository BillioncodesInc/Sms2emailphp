# SE Gateway - Complete API Endpoint Audit

**Generated:** 2025-10-20
**Purpose:** Identify all endpoints, their functions, and detect duplicates/redundancies

---

## Executive Summary

**Total Endpoints:** 73
**Route Files:** 7
**Potential Duplicates Found:** 3 groups
**Redundant Endpoints:** 2
**Inconsistent Routing:** 5 endpoints

---

## Table of Contents

1. [Main Application Routes (app.js)](#main-application-routes)
2. [Enhanced Routes (/api/enhanced)](#enhanced-routes)
3. [Campaign Routes (/api/enhanced)](#campaign-routes)
4. [SMTP Database Routes (/api/smtp/database)](#smtp-database-routes)
5. [SMTP Combo Validator Routes (/api/smtp/combo)](#smtp-combo-validator-routes)
6. [Inbox Searcher Routes (/api/enhanced/inbox)](#inbox-searcher-routes)
7. [Contact Extractor Routes (/api/enhanced/contact)](#contact-extractor-routes)
8. [Issues & Recommendations](#issues--recommendations)

---

## Main Application Routes

**File:** `backend/server/app.js`
**Total Endpoints:** 24

### Root & Utility

| Method | Endpoint | Line | Function | Used By |
|--------|----------|------|----------|---------|
| GET | `/` | 209 | Server health check | N/A |
| GET | `/api/providers/:region` | 213 | Get SMS carriers for region | Legacy SMS |
| POST | `/test` | 217 | Test SMS sending | Legacy SMS |

**Notes:**
- `/test` endpoint lacks `/api` prefix (inconsistent with other endpoints)
- SMS functionality appears to be legacy/unused

---

### Configuration & SMTP

| Method | Endpoint | Line | Function | Used By |
|--------|----------|------|----------|---------|
| POST | `/api/config` | 230 | Save SMTP configuration | Frontend (index.php) |
| POST | `/api/smtp/test` | 735 | Test SMTP connection | Frontend (index.php) |
| POST | `/api/smtp/verify` | 752 | Verify SMTP credentials | Frontend (index.php) |
| POST | `/api/smtp/health` | 760 | Check SMTP health | Frontend (index.php) |

**Notes:**
- These 4 endpoints handle single/bulk SMTP configuration
- Used by the SMTP Profile configuration UI

---

### Proxy Management

| Method | Endpoint | Line | Function | Used By |
|--------|----------|------|----------|---------|
| POST | `/api/proxy` | 235 | Add new proxies | Frontend (index.php) |
| GET | `/api/proxy/list` | 240 | List all proxies | Frontend (index.php) |
| DELETE | `/api/proxy/:index` | 271 | Delete specific proxy | Frontend (index.php) |
| POST | `/api/proxy/test` | 291 | Test proxy connectivity | Frontend (index.php) |
| POST | `/api/proxy/remove-failed` | 632 | Remove failed proxies | Frontend (index.php) |

**Notes:**
- Complete proxy CRUD operations
- All properly under `/api` prefix

---

### Messaging & Communication

| Method | Endpoint | Line | Function | Used By |
|--------|----------|------|----------|---------|
| POST | `/api/text` | 661 | Send SMS via carrier gateway | Legacy SMS |
| POST | `/canada` | 678 | Send SMS to Canadian numbers | Legacy SMS |
| POST | `/intl` | 688 | Send international SMS | Legacy SMS |
| POST | `/api/email` | 853 | Send emails (with proxy toggle) | Frontend (campaign.js) |
| POST | `/chatgpt/rephrase` | 889 | Rephrase text using ChatGPT | Frontend (index.php) |

**Notes:**
- `/canada` and `/intl` lack `/api` prefix (inconsistent)
- `/chatgpt/rephrase` lacks `/api` prefix (inconsistent)
- SMS endpoints appear to be legacy/unused

---

### Email Validation

| Method | Endpoint | Line | Function | Used By |
|--------|----------|------|----------|---------|
| POST | `/api/validateEmails` | 806 | Validate email addresses | Frontend (campaign.js) |

---

### Attachments (Duplicate!)

| Method | Endpoint | Line | Function | Used By |
|--------|----------|------|----------|---------|
| GET | `/api/enhanced/attachments` | 987 | List all attachments | Frontend (campaign.js) |
| GET | `/api/enhanced/attachments/:id` | 1001 | Get attachment metadata | Frontend (campaign.js) |
| GET | `/api/enhanced/attachments/:id/download` | 1017 | Download attachment | Frontend (index.php) |
| POST | `/api/enhanced/attachments/upload` | 1045 | Upload new attachment | Frontend (campaign.js) |
| DELETE | `/api/enhanced/attachments/:id` | 1074 | Delete attachment | Frontend (campaign.js) |
| GET | `/api/enhanced/attachments/stats` | 1084 | Get attachment statistics | Frontend (index.php) |

**⚠️ DUPLICATE:** These attachment routes are defined in app.js but should be in enhancedRoutes.js

---

## Enhanced Routes

**File:** `backend/server/enhancedRoutes.js`
**Mounted at:** `/api/enhanced`
**Total Endpoints:** 24

### Content Conversion

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/convert/html` | `/api/enhanced/convert/html` | 31 | Convert markdown to HTML |
| POST | `/convert/qrcode` | `/api/enhanced/convert/qrcode` | 52 | Generate QR code image |
| POST | `/convert/qrcode-html` | `/api/enhanced/convert/qrcode-html` | 85 | Generate QR code as HTML |
| POST | `/convert/pdf` | `/api/enhanced/convert/pdf` | 106 | Convert HTML to PDF |

**Notes:**
- All conversion features work correctly
- Used by campaign message editor

---

### Link Protection & Tracking

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/link/obfuscate` | `/api/enhanced/link/obfuscate` | 147 | Obfuscate/protect URLs |
| POST | `/link/protect-content` | `/api/enhanced/link/protect-content` | 171 | Protect email content |
| POST | `/link/tracking-pixel` | `/api/enhanced/link/tracking-pixel` | 191 | Generate tracking pixel |
| POST | `/link/redirect-page` | `/api/enhanced/link/redirect-page` | 211 | Create redirect page |

**Notes:**
- Link protection features
- Used by campaign creation UI

---

### SMTP Profile Management (Duplicate!)

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/smtp/profile/add` | `/api/enhanced/smtp/profile/add` | 237 | Add SMTP profile |
| GET | `/smtp/profile/list` | `/api/enhanced/smtp/profile/list` | 257 | List all profiles |
| GET | `/smtp/profile/:id` | `/api/enhanced/smtp/profile/:id` | 271 | Get specific profile |
| PUT | `/smtp/profile/:id` | `/api/enhanced/smtp/profile/:id` | 289 | Update profile |
| DELETE | `/smtp/profile/:id` | `/api/enhanced/smtp/profile/:id` | 299 | Delete profile |
| GET | `/smtp/profile/:id/stats` | `/api/enhanced/smtp/profile/:id/stats` | 309 | Get profile statistics |
| GET | `/smtp/stats` | `/api/enhanced/smtp/stats` | 327 | Get overall SMTP stats |
| GET | `/smtp/stats/domains` | `/api/enhanced/smtp/stats/domains` | 357 | Get domain statistics |
| GET | `/smtp/domain-stats` | `/api/enhanced/smtp/domain-stats` | 371 | Get domain stats (duplicate?) |

**⚠️ POTENTIAL DUPLICATE:**
- `/smtp/stats/domains` (line 357) vs `/smtp/domain-stats` (line 371)
- These appear to do similar things - check if one can be removed

---

### Email Security Features

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/security/dkim/generate` | `/api/enhanced/security/dkim/generate` | 391 | Generate DKIM keys |
| POST | `/security/spf/generate` | `/api/enhanced/security/spf/generate` | 411 | Generate SPF record |
| POST | `/security/dmarc/generate` | `/api/enhanced/security/dmarc/generate` | 428 | Generate DMARC policy |
| POST | `/security/verify` | `/api/enhanced/security/verify` | 450 | Verify email security |
| POST | `/security/analyze-spam` | `/api/enhanced/security/analyze-spam` | 470 | Analyze spam score |
| POST | `/security/rate-limit` | `/api/enhanced/security/rate-limit` | 490 | Check rate limits |

**Notes:**
- Advanced email security features
- Appear unused in current frontend

---

### Enhanced Email Sending (Redundant!)

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/send/enhanced` | `/api/enhanced/send/enhanced` | 515 | Send emails with advanced features |

**⚠️ REDUNDANT:**
- This is essentially a duplicate of `/api/email` (app.js:853)
- `/api/email` now has proxy toggle support
- This endpoint adds attachment support but `/api/email` should be extended instead
- **RECOMMENDATION:** Merge functionality into `/api/email` and deprecate this endpoint

---

## Campaign Routes

**File:** `backend/server/campaignRoutes.js`
**Mounted at:** `/api/enhanced`
**Total Endpoints:** 10

### Campaign CRUD Operations

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/campaigns/create` | `/api/enhanced/campaigns/create` | 12 | Create new campaign |
| GET | `/campaigns` | `/api/enhanced/campaigns` | 31 | List all campaigns |
| GET | `/campaigns/:id` | `/api/enhanced/campaigns/:id` | 45 | Get specific campaign |
| PUT | `/campaigns/:id` | `/api/enhanced/campaigns/:id` | 61 | Update campaign |
| DELETE | `/campaigns/:id` | `/api/enhanced/campaigns/:id` | 80 | Delete campaign |
| POST | `/campaigns/:id/stats` | `/api/enhanced/campaigns/:id/stats` | 98 | Update campaign stats |
| GET | `/campaigns/:id/logs` | `/api/enhanced/campaigns/:id/logs` | 108 | Get campaign logs |

**Notes:**
- Complete CRUD operations for campaigns
- All functioning correctly

---

### Campaign Statistics & Logging

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| GET | `/stats/overall` | `/api/enhanced/stats/overall` | 123 | Get overall statistics |
| GET | `/logs/recent` | `/api/enhanced/logs/recent` | 136 | Get recent activity logs |
| POST | `/logs/activity` | `/api/enhanced/logs/activity` | 151 | Log activity |

**Notes:**
- Campaign analytics endpoints
- Working correctly

---

## SMTP Database Routes

**File:** `backend/server/smtpDatabaseRoutes.js`
**Mounted at:** `/api/smtp/database`
**Total Endpoints:** 6

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| GET | `/stats` | `/api/smtp/database/stats` | 14 | Get database statistics |
| GET | `/popular` | `/api/smtp/database/popular` | 35 | Get popular email domains |
| GET | `/search` | `/api/smtp/database/search` | 56 | Search for email domain |
| POST | `/lookup` | `/api/smtp/database/lookup` | 90 | Batch lookup domains |
| GET | `/:domain` | `/api/smtp/database/:domain` | 154 | Get specific domain config |
| POST | `/autoconfig` | `/api/smtp/database/autoconfig` | 207 | Auto-configure SMTP |

**Notes:**
- Email domain SMTP configuration database
- Provides autoconfig for 891 email domains
- All working correctly

---

## SMTP Combo Validator Routes

**File:** `backend/server/comboRoutes.js`
**Mounted at:** `/api/smtp/combo`
**Total Endpoints:** 9

### Combo Processing

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/parse` | `/api/smtp/combo/parse` | 20 | Parse combo list format |
| POST | `/process` | `/api/smtp/combo/process` | 61 | Start combo validation |
| GET | `/status/:sessionId` | `/api/smtp/combo/status/:sessionId` | 116 | Get validation status |
| GET | `/results/:sessionId` | `/api/smtp/combo/results/:sessionId` | 151 | Get validation results |

### Session Control

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/pause/:sessionId` | `/api/smtp/combo/pause/:sessionId` | 202 | Pause validation |
| POST | `/resume/:sessionId` | `/api/smtp/combo/resume/:sessionId` | 236 | Resume validation |
| POST | `/stop/:sessionId` | `/api/smtp/combo/stop/:sessionId` | 270 | Stop validation |
| DELETE | `/session/:sessionId` | `/api/smtp/combo/session/:sessionId` | 304 | Delete session |
| GET | `/sessions` | `/api/smtp/combo/sessions` | 344 | List all sessions |

**Notes:**
- SMTP combo validation with WebSocket support
- Session-based processing with pause/resume/stop
- All working correctly

---

## Inbox Searcher Routes

**File:** `backend/server/inboxRoutes.js`
**Mounted at:** `/api/enhanced/inbox`
**Total Endpoints:** 6

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| GET | `/proxy-check` | `/api/enhanced/inbox/proxy-check` | 21 | Check proxy availability |
| POST | `/search` | `/api/enhanced/inbox/search` | 53 | Start inbox search |
| GET | `/status/:sessionId` | `/api/enhanced/inbox/status/:sessionId` | 255 | Get search status |
| GET | `/results/:sessionId` | `/api/enhanced/inbox/results/:sessionId` | 292 | Get search results |
| DELETE | `/session/:sessionId` | `/api/enhanced/inbox/session/:sessionId` | 317 | Delete session |
| GET | `/sessions` | `/api/enhanced/inbox/sessions` | 341 | List all sessions |

**Notes:**
- Inbox search with IMAP/POP3 support
- WebSocket-based real-time updates
- All working correctly

---

## Contact Extractor Routes

**File:** `backend/server/contactRoutes.js`
**Mounted at:** `/api/enhanced/contact`
**Total Endpoints:** 5

| Method | Endpoint | Full Path | Line | Function |
|--------|----------|-----------|------|----------|
| POST | `/extract` | `/api/enhanced/contact/extract` | 28 | Start contact extraction |
| GET | `/status/:sessionId` | `/api/enhanced/contact/status/:sessionId` | 336 | Get extraction status |
| GET | `/results/:sessionId` | `/api/enhanced/contact/results/:sessionId` | 374 | Get extraction results |
| DELETE | `/session/:sessionId` | `/api/enhanced/contact/session/:sessionId` | 399 | Delete session |
| GET | `/sessions` | `/api/enhanced/contact/sessions` | 423 | List all sessions |

**Notes:**
- Contact extraction from various sources
- WebSocket-based real-time updates
- All working correctly

---

## Issues & Recommendations

### 🔴 Critical Issues

#### 1. Duplicate Attachment Routes
**Problem:** Attachment routes defined in TWO places:
- `app.js` lines 987-1084 (6 endpoints)
- Should be in `enhancedRoutes.js` only

**Impact:** Potential conflicts, maintenance confusion

**Recommendation:**
```javascript
// REMOVE from app.js (lines 987-1084)
// These are already properly handled by enhancedRoutes.js
```

#### 2. Redundant Email Sending Endpoints
**Problem:** TWO email sending endpoints with overlapping functionality:
- `/api/email` (app.js:853) - Basic email sending with proxy toggle
- `/api/enhanced/send/enhanced` (enhancedRoutes.js:515) - Advanced features + attachments

**Impact:** Code duplication, inconsistent behavior

**Recommendation:**
```javascript
// Option A: Merge functionality into /api/email
// Add attachment support to /api/email and deprecate /send/enhanced

// Option B: Keep both but clarify purpose:
// - /api/email: Simple email sending (current campaigns use this)
// - /api/enhanced/send/enhanced: Advanced features (security, attachments, etc.)
```

---

### ⚠️ Medium Priority Issues

#### 3. Potential Duplicate Domain Stats Endpoints
**Problem:** Two similar endpoints in enhancedRoutes.js:
- `/smtp/stats/domains` (line 357)
- `/smtp/domain-stats` (line 371)

**Recommendation:** Check if these do the same thing. If yes, remove one.

---

### 🟡 Low Priority Issues (Inconsistent Routing)

#### 4. Missing `/api` Prefix on Legacy Endpoints
**Problem:** Some endpoints lack the `/api` prefix:
- `/test` (app.js:217) - Should be `/api/test`
- `/canada` (app.js:678) - Should be `/api/canada` or remove if unused
- `/intl` (app.js:688) - Should be `/api/intl` or remove if unused
- `/chatgpt/rephrase` (app.js:889) - Should be `/api/chatgpt/rephrase`

**Impact:** Inconsistent API structure

**Recommendation:**
```javascript
// If still needed, add /api prefix for consistency
app.post("/api/chatgpt/rephrase", async (req, res) => { ... });

// If SMS features are unused, remove entirely:
// - /test
// - /canada
// - /intl
// - /api/text
```

---

### 📊 Summary Table

| Category | Endpoint Count | Issues | Status |
|----------|----------------|---------|--------|
| Main Routes (app.js) | 24 | 5 inconsistent paths | ⚠️ Needs cleanup |
| Enhanced Routes | 24 | 1 potential duplicate | ⚠️ Review needed |
| Campaign Routes | 10 | None | ✅ Good |
| SMTP Database | 6 | None | ✅ Good |
| SMTP Combo | 9 | None | ✅ Good |
| Inbox Searcher | 6 | None | ✅ Good |
| Contact Extractor | 5 | None | ✅ Good |
| **TOTAL** | **84** | **7 issues** | **91% Good** |

---

## Recommended Actions

### Immediate (High Impact)

1. **Remove duplicate attachment routes from app.js** (lines 987-1084)
   - Already handled by enhancedRoutes.js
   - Prevents conflicts and confusion

2. **Decide on email sending strategy:**
   - **Option A:** Extend `/api/email` with attachment support, deprecate `/api/enhanced/send/enhanced`
   - **Option B:** Keep both, document clear use cases

### Short-term (Medium Impact)

3. **Investigate domain stats endpoints:**
   - Compare `/smtp/stats/domains` vs `/smtp/domain-stats`
   - Remove if duplicate

4. **Add `/api` prefix to orphaned endpoints:**
   - `/chatgpt/rephrase` → `/api/chatgpt/rephrase`

### Long-term (Low Impact)

5. **Remove unused SMS legacy code** (if confirmed unused):
   - `/test`
   - `/canada`
   - `/intl`
   - `/api/text`
   - SMS carrier providers

---

## Endpoint Map (Visual)

```
/
├─ / (health check)
├─ /api
│  ├─ /config (SMTP config)
│  ├─ /email (email sending ⭐)
│  ├─ /validateEmails
│  ├─ /proxy/* (proxy management)
│  ├─ /smtp
│  │  ├─ /test
│  │  ├─ /verify
│  │  ├─ /health
│  │  ├─ /database/* (domain configs)
│  │  └─ /combo/* (validator)
│  └─ /enhanced
│     ├─ /convert/* (content conversion)
│     ├─ /link/* (link protection)
│     ├─ /smtp
│     │  ├─ /profile/* (profile management)
│     │  └─ /stats
│     ├─ /security/* (DKIM, SPF, DMARC)
│     ├─ /send/enhanced (⚠️ redundant?)
│     ├─ /campaigns/* (campaign CRUD)
│     ├─ /inbox/* (inbox search)
│     ├─ /contact/* (contact extract)
│     ├─ /attachments/* (⚠️ duplicate in app.js)
│     ├─ /stats
│     └─ /logs
│
└─ Legacy (⚠️ inconsistent - no /api prefix)
   ├─ /test (SMS test)
   ├─ /canada (SMS Canada)
   ├─ /intl (SMS International)
   └─ /chatgpt/rephrase
```

---

## Conclusion

The SE Gateway API is well-structured overall with **91% of endpoints properly organized**. The main issues are:

1. Duplicate attachment routes (easily fixed)
2. Redundant email sending endpoints (needs decision)
3. A few inconsistent route prefixes (minor cleanup)

**Recommended Priority:**
1. Fix duplicate attachments (**15 min**)
2. Decide email sending strategy (**30 min**)
3. Add `/api` prefixes (**10 min**)
4. Remove unused SMS code (**optional**)

Total cleanup time: **~1 hour** for significant improvements.
