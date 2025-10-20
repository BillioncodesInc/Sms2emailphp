# SE Gateway - Complete Workflow Verification

**Date:** 2025-10-20
**Purpose:** Verify all user workflows and tool integrations

---

## Overview

This document verifies the complete end-to-end functionality of SE Gateway, ensuring all features work as described and all tool integrations are properly connected.

---

## 1. Attachments Workflow

### User Flow
1. **Upload** attachment via UI
2. **Save** to disk automatically
3. **View** list of uploaded attachments
4. **Select** attachments when creating campaigns
5. **Download** attachments when needed

### Technical Implementation

**Upload Endpoint:**
```
POST /api/enhanced/attachments/upload
- Accepts multipart/form-data
- Saves to backend/data/attachments/
- Returns attachment ID and metadata
```

**Storage:**
```javascript
// File: backend/lib/attachmentStorage.js
- Persistent storage in JSON
- File path: backend/data/attachments/
- Metadata stored in: backend/data/attachment-storage.json
```

**List Endpoint:**
```
GET /api/enhanced/attachments
- Returns all uploaded attachments
- Includes: id, name, type, size, uploadDate
```

**Download Endpoint:**
```
GET /api/enhanced/attachments/:id/download
- Streams file to browser
- Sets proper Content-Disposition headers
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Upload works and saves to disk
- [ ] List shows all uploaded files
- [ ] Download streams file correctly
- [ ] Campaign dropdown shows attachments

---

## 2. SMTP Configuration Workflow

### User Flow
1. **Configure** single or bulk SMTP
2. **Test** connection before saving
3. **Verify** credentials work
4. **Health check** SMTP status
5. **Save** to disk for persistence

### Technical Implementation

**Single SMTP:**
```
POST /api/config
{
  "service": "gmail",
  "secureConnection": true,
  "user": "user@gmail.com",
  "pass": "password",
  "bulk": "false"
}
```

**Bulk SMTP:**
```
POST /api/config
{
  "service": "gmail",
  "secureConnection": true,
  "smtplist": "pass1|user1@gmail.com\npass2|user2@gmail.com",
  "bulk": "true"
}
```

**Test Endpoints:**
- `POST /api/smtp/test` - Test connection
- `POST /api/smtp/verify` - Verify credentials
- `POST /api/smtp/health` - Health check

**Storage:**
```
File: backend/data/smtp-config.json
- Persists across server restarts
- Contains type (single/bulk) and credentials
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Single SMTP configures and saves
- [ ] Bulk SMTP accepts list format
- [ ] Test returns connection status
- [ ] Verify checks credentials
- [ ] Health check shows status
- [ ] Config persists to disk

---

## 3. Proxy Management Workflow

### User Flow
1. **Add** proxies (single or multiple)
2. **Test** proxies with Google.com
3. **See** open ports for each proxy (25, 465, 587, 2525)
4. **View** list of active proxies
5. **Remove** failed proxies
6. **Use** in campaigns with rotation

### Technical Implementation

**Add Proxies:**
```
POST /api/proxy
{
  "proxies": [
    "proxy1.com:8080",
    "user:pass@proxy2.com:3128"
  ],
  "protocol": "http"
}
```

**Test Proxies:**
```
POST /api/proxy/test
{
  "indices": [0, 1, 2]
}

Response:
{
  "results": [
    {
      "index": 0,
      "success": true,
      "google": { "success": true, "responseTime": 234 },
      "ports": {
        "25": { "open": false },
        "465": { "open": true, "responseTime": 156 },
        "587": { "open": true, "responseTime": 142 },
        "2525": { "open": false }
      }
    }
  ]
}
```

**Storage:**
```
File: backend/data/proxy-config.json
{
  "proxies": [
    { "host": "...", "port": "...", "username": "...", "password": "..." }
  ],
  "protocol": "http|socks4|socks5"
}
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Add proxies saves to disk
- [ ] Test connects to Google.com
- [ ] Port testing (25, 465, 587, 2525) works
- [ ] Results show open/closed ports
- [ ] List shows all proxies
- [ ] Remove failed proxies works
- [ ] Campaign uses proxy rotation

---

## 4. Campaign Creation Workflow

### User Flow
1. **Select** campaign type: Email or SMS
2. **Enter** sender information:
   - Email: sender name + sender email
   - SMS: sender name + phone number
3. **Write** subject (email only)
4. **Write** message
5. **Get AI suggestion** (optional)
   - Input message first
   - Click to get AI rephrase
6. **Select attachments** from dropdown
7. **Add recipients** (email list)
8. **Configure options:**
   - ☑️ Proxy rotation
   - ☑️ Link protection
9. **Create** campaign

### Technical Implementation

**Campaign UI:**
```html
<!-- Type selection -->
<select id="page-campaign-type">
  <option value="email">Email Campaign</option>
  <option value="sms">SMS Campaign</option>
</select>

<!-- Sender info -->
<input id="page-sender-name" placeholder="Sender Name">
<input id="page-sender-email" placeholder="sender@example.com">

<!-- Content -->
<input id="page-subject" placeholder="Subject">
<textarea id="page-message"></textarea>

<!-- AI Rephrase -->
<button onclick="rephraseWithAI()">✨ Suggest with AI</button>

<!-- Attachments dropdown -->
<select id="page-attachments" multiple>
  <!-- Populated from /api/enhanced/attachments -->
</select>

<!-- Recipients -->
<textarea id="page-recipients"></textarea>

<!-- Options -->
<input type="checkbox" id="page-use-proxy"> Proxy Rotation
<input type="checkbox" id="page-protect-links"> Link Protection

<!-- Create -->
<button onclick="createCampaign()">Create Campaign</button>
```

**AI Rephrase:**
```
POST /api/chatgpt/rephrase
{
  "message": "original message",
  "apiKey": "user-api-key"
}

Response:
{
  "success": true,
  "rephrased": "improved message"
}
```

**Campaign Creation:**
```
POST /api/enhanced/campaigns/create
{
  "name": "Campaign Name",
  "mode": "email",
  "sender": { "name": "...", "email": "..." },
  "content": { "subject": "...", "message": "...", "link": "..." },
  "recipients": ["email1@example.com", "email2@example.com"],
  "attachments": ["attach_id_1", "attach_id_2"],
  "options": {
    "useProxy": true,
    "protectLinks": true,
    "delay": 500
  }
}
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Email/SMS type selection works
- [ ] Sender info fields work
- [ ] AI rephrase requires message input
- [ ] AI rephrase returns suggestion
- [ ] Attachments dropdown populates
- [ ] Multi-select attachments works
- [ ] Proxy rotation checkbox saves
- [ ] Link protection checkbox saves
- [ ] Campaign creates successfully

---

## 5. SMTP Combo Validator Workflow

**Concept:** Tool from Matt Katzmiller's ideas

### User Flow
1. **Paste** combo list (email:password format)
2. **Start** validation process
3. **Auto-detect** SMTP settings for each combo
4. **See** real-time progress
5. **View** results: valid/invalid
6. **Save** valid SMTPs
7. **Download** results
8. **Export** for Inbox Searcher or Contact Extractor

### Technical Implementation

**Input Format:**
```
user1@gmail.com:password123
user2@yahoo.com:secret456
admin@outlook.com:pass789
```

**Parse Endpoint:**
```
POST /api/smtp/combo/parse
{
  "comboList": "email:pass\nemail:pass\n..."
}

Response:
{
  "success": true,
  "combos": [
    { "email": "user1@gmail.com", "password": "password123" },
    { "email": "user2@yahoo.com", "password": "secret456" }
  ],
  "count": 2
}
```

**Process Endpoint (WebSocket):**
```
POST /api/smtp/combo/process
{
  "combos": [...],
  "sessionId": "unique-id"
}

WebSocket: ws://localhost:9090/ws/combo/process/:sessionId
- Real-time progress updates
- Validation status per combo
- SMTP auto-detection results
```

**Auto-Detection:**
```javascript
// Uses SMTP Database (891 domains)
GET /api/smtp/database/:domain

// Returns SMTP config:
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": true,
  "requiresAuth": true
}
```

**Results:**
```
GET /api/smtp/combo/results/:sessionId

{
  "valid": [
    {
      "email": "user1@gmail.com",
      "password": "password123",
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": true
      },
      "status": "verified"
    }
  ],
  "invalid": [
    {
      "email": "user2@yahoo.com",
      "password": "secret456",
      "error": "Authentication failed"
    }
  ]
}
```

**Export Format (for Inbox/Contact tools):**
```
# Compatible format
email1@gmail.com:password123
email2@yahoo.com:secret456
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Parse accepts combo list
- [ ] Auto-detects SMTP from domain
- [ ] Tests each combo
- [ ] WebSocket shows real-time progress
- [ ] Results show valid/invalid
- [ ] Can save valid SMTPs
- [ ] Can download results
- [ ] Export format works with other tools

---

## 6. Inbox Searcher Workflow

### User Flow
1. **Import** SMTP Combo Validator results
2. **Enter** search keywords
3. **Start** search
4. **See** real-time progress
5. **View** results in expandable rows
6. **Expand** each email to see details
7. **Download** results

### Technical Implementation

**Import Format (from SMTP Combo Validator):**
```
email1@gmail.com:password123
email2@yahoo.com:secret456
```

**Search Endpoint:**
```
POST /api/enhanced/inbox/search
{
  "combos": [
    { "email": "...", "password": "..." }
  ],
  "keywords": ["invoice", "payment", "order"],
  "sessionId": "unique-id"
}

WebSocket: ws://localhost:9090/ws/inbox/:sessionId
```

**Results Display:**
```html
<div class="inbox-results">
  <!-- Row 1: Expandable -->
  <div class="result-row" onclick="toggleExpand(0)">
    <span>user1@gmail.com</span>
    <span>5 matches found</span>
    <span class="expand-icon">▼</span>
  </div>
  <div class="result-details" id="details-0" style="display:none">
    <div class="email-match">
      <p><strong>From:</strong> sender@example.com</p>
      <p><strong>Subject:</strong> Your invoice #12345</p>
      <p><strong>Date:</strong> 2025-10-19</p>
      <p><strong>Snippet:</strong> ...invoice details...</p>
    </div>
    <!-- More matches -->
  </div>

  <!-- Row 2: Expandable -->
  <!-- ... -->
</div>
```

**Results Endpoint:**
```
GET /api/enhanced/inbox/results/:sessionId

{
  "results": [
    {
      "email": "user1@gmail.com",
      "matches": [
        {
          "from": "sender@example.com",
          "subject": "Your invoice #12345",
          "date": "2025-10-19",
          "snippet": "...",
          "matchedKeywords": ["invoice"]
        }
      ]
    }
  ]
}
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Import accepts combo format
- [ ] Search connects to each inbox
- [ ] Keywords search works
- [ ] WebSocket shows progress
- [ ] Results display in rows
- [ ] Row expansion shows details
- [ ] Each email shows from/subject/date
- [ ] Download results works

---

## 7. Contact Extractor Workflow

### User Flow
1. **Import** SMTP Combo Validator results
2. **Start** extraction
3. **See** real-time progress
4. **View** extracted contacts
5. **Download** contacts

### Technical Implementation

**Import Format (from SMTP Combo Validator):**
```
email1@gmail.com:password123
email2@yahoo.com:secret456
```

**Extract Endpoint:**
```
POST /api/enhanced/contact/extract
{
  "combos": [
    { "email": "...", "password": "..." }
  ],
  "sessionId": "unique-id"
}

WebSocket: ws://localhost:9090/ws/contacts/:sessionId
```

**Extraction Logic:**
```javascript
// Searches inbox for:
- Email addresses in To/From/CC/BCC
- Names in From fields
- Contact information in email bodies
- Phone numbers (regex patterns)
```

**Results:**
```
GET /api/enhanced/contact/results/:sessionId

{
  "contacts": [
    {
      "email": "contact1@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "source": "user1@gmail.com",
      "foundIn": "From field",
      "date": "2025-10-19"
    },
    {
      "email": "contact2@example.com",
      "name": "Jane Smith",
      "source": "user1@gmail.com",
      "foundIn": "Email body",
      "date": "2025-10-18"
    }
  ],
  "count": 2
}
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Import accepts combo format
- [ ] Connects to each inbox
- [ ] Extracts email addresses
- [ ] Extracts names
- [ ] Extracts phone numbers
- [ ] WebSocket shows progress
- [ ] Results show contacts
- [ ] Download works

---

## 8. Tool Integration Map

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SMTP Combo Validator                    │
│  Input: email:password combos                               │
│  Output: Valid SMTP credentials + configs                   │
│  Format: email:password (one per line)                      │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │ Export Format              │ Export Format
             ▼                            ▼
┌────────────────────────┐   ┌───────────────────────────────┐
│   Inbox Searcher       │   │    Contact Extractor          │
│  Uses combo format     │   │   Uses combo format           │
│  to search inboxes     │   │   to extract contacts         │
│  for keywords          │   │   from emails                 │
└────────────────────────┘   └───────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      Campaign Creation                        │
│  Uses:                                                        │
│    - SMTP Config (from SMTP Configuration)                   │
│    - Proxies (from Proxy Management)                         │
│    - Attachments (from Attachment Upload)                    │
│    - Recipients (manual or from Contact Extractor)           │
└──────────────────────────────────────────────────────────────┘
```

### Integration Points

**1. SMTP Combo Validator → Inbox Searcher**
```
Format: email:password\nemail:password
Compatible: ✅ YES
Auto-import: User pastes results directly
```

**2. SMTP Combo Validator → Contact Extractor**
```
Format: email:password\nemail:password
Compatible: ✅ YES
Auto-import: User pastes results directly
```

**3. Contact Extractor → Campaign**
```
Format: email addresses (extracted)
Compatible: ✅ YES
Usage: Copy extracted emails to campaign recipients
```

**4. SMTP Config → Campaign**
```
Automatic: Campaign uses configured SMTP
Loaded from: backend/data/smtp-config.json
```

**5. Proxy Config → Campaign**
```
Optional: Campaign checkbox enables proxy rotation
Loaded from: backend/data/proxy-config.json
```

**6. Attachments → Campaign**
```
Dropdown: Shows all uploaded attachments
Multi-select: Can select multiple attachments
```

### Verification Status
✅ **TO BE VERIFIED**
- [ ] Combo Validator export format matches Inbox Searcher import
- [ ] Combo Validator export format matches Contact Extractor import
- [ ] Contact Extractor results can be used in campaigns
- [ ] Campaigns load SMTP config automatically
- [ ] Campaigns can toggle proxy usage
- [ ] Campaign attachment dropdown works

---

## Next Steps

### Verification Process
1. ✅ Create this verification document
2. ⏳ Test each workflow manually
3. ⏳ Verify all integrations
4. ⏳ Document any issues found
5. ⏳ Fix issues if any
6. ⏳ Final end-to-end test

### Testing Order
1. Attachments (simple, no dependencies)
2. SMTP Configuration (independent)
3. Proxy Management (independent)
4. SMTP Combo Validator (uses SMTP Database)
5. Campaign Creation (uses all above)
6. Inbox Searcher (uses Combo Validator results)
7. Contact Extractor (uses Combo Validator results)
8. Full Integration Test (all tools together)

---

## Status: READY FOR VERIFICATION

All workflows documented and ready for systematic testing.
