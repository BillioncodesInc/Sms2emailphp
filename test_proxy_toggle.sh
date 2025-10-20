#!/bin/bash

# Test script for proxy toggle functionality
# This simulates the frontend API calls with mock data

API_BASE="http://localhost:9090/api"
API_ENHANCED="http://localhost:9090/api/enhanced"

echo "=================================================="
echo "SE Gateway - Proxy Toggle Test Simulation"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}[1] Checking if server is running on port 9090...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:9090 > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on port 9090${NC}"
    echo -e "${YELLOW}Please start the server first with: node backend/server/app.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: Submit proxies without authentication
echo -e "${BLUE}[2] Testing: Submit proxies WITHOUT authentication${NC}"
echo "Endpoint: POST ${API_BASE}/proxy"
echo "Payload: 2 proxies without auth (host:port format)"
RESPONSE=$(curl -s -X POST "${API_BASE}/proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "proxies": ["proxy1.example.com:8080", "proxy2.example.com:3128"],
    "protocol": "http"
  }')
echo "Response: ${RESPONSE}"
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Proxies without auth submitted successfully${NC}"
else
    echo -e "${RED}✗ Failed to submit proxies without auth${NC}"
fi
echo ""

# Test 2: Submit proxies with authentication
echo -e "${BLUE}[3] Testing: Submit proxies WITH authentication${NC}"
echo "Endpoint: POST ${API_BASE}/proxy"
echo "Payload: 2 proxies with auth (user:pass@host:port format)"
RESPONSE=$(curl -s -X POST "${API_BASE}/proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "proxies": ["testuser:testpass@proxy3.example.com:8080", "admin:secret123@proxy4.example.com:3128"],
    "protocol": "socks5"
  }')
echo "Response: ${RESPONSE}"
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Proxies with auth submitted successfully${NC}"
else
    echo -e "${RED}✗ Failed to submit proxies with auth${NC}"
fi
echo ""

# Test 3: List all proxies
echo -e "${BLUE}[4] Testing: List all saved proxies${NC}"
echo "Endpoint: GET ${API_BASE}/proxy/list"
RESPONSE=$(curl -s -X GET "${API_BASE}/proxy/list")
echo "Response: ${RESPONSE}"
PROXY_COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
if [ ! -z "$PROXY_COUNT" ]; then
    echo -e "${GREEN}✓ Found ${PROXY_COUNT} proxies in storage${NC}"
else
    echo -e "${RED}✗ Failed to list proxies${NC}"
fi
echo ""

# Test 4: Verify proxy storage on disk
echo -e "${BLUE}[5] Testing: Verify proxy persistence on disk${NC}"
STORAGE_FILE="backend/data/proxy-config.json"
if [ -f "$STORAGE_FILE" ]; then
    echo -e "${GREEN}✓ Proxy config file exists: ${STORAGE_FILE}${NC}"
    echo "File contents:"
    cat "$STORAGE_FILE" | python3 -m json.tool 2>/dev/null || cat "$STORAGE_FILE"
else
    echo -e "${RED}✗ Proxy config file not found${NC}"
fi
echo ""

# Test 5: Send campaign WITH proxy enabled
echo -e "${BLUE}[6] Testing: Send campaign WITH proxy enabled (useProxy=true)${NC}"
echo "Endpoint: POST ${API_BASE}/email"
echo "Payload: 2 recipients, useProxy=true"
RESPONSE=$(curl -s -X POST "${API_BASE}/email" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["test1@example.com", "test2@example.com"],
    "subject": "Test Email with Proxy",
    "message": "This is a test email sent through proxy rotation.",
    "sender": "Test Sender",
    "senderAd": "sender@example.com",
    "useProxy": true
  }')
echo "Response: ${RESPONSE}"
if [ "$RESPONSE" = "true" ] || echo "$RESPONSE" | grep -q 'success'; then
    echo -e "${GREEN}✓ Campaign sent with proxy enabled${NC}"
    echo -e "${YELLOW}Check server logs for: '🔀 Using proxy: ...'${NC}"
else
    echo -e "${RED}✗ Campaign send failed${NC}"
    echo "Error: ${RESPONSE}"
fi
echo ""

# Test 6: Send campaign WITHOUT proxy (proxy disabled)
echo -e "${BLUE}[7] Testing: Send campaign WITHOUT proxy (useProxy=false)${NC}"
echo "Endpoint: POST ${API_BASE}/email"
echo "Payload: 2 recipients, useProxy=false"
RESPONSE=$(curl -s -X POST "${API_BASE}/email" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["test3@example.com", "test4@example.com"],
    "subject": "Test Email without Proxy",
    "message": "This is a test email sent directly without proxy.",
    "sender": "Test Sender",
    "senderAd": "sender@example.com",
    "useProxy": false
  }')
echo "Response: ${RESPONSE}"
if [ "$RESPONSE" = "true" ] || echo "$RESPONSE" | grep -q 'success'; then
    echo -e "${GREEN}✓ Campaign sent with proxy disabled${NC}"
    echo -e "${YELLOW}Check server logs for: '🚫 Proxy disabled for this request'${NC}"
else
    echo -e "${RED}✗ Campaign send failed${NC}"
    echo "Error: ${RESPONSE}"
fi
echo ""

# Test 7: Send campaign with default behavior (useProxy not specified)
echo -e "${BLUE}[8] Testing: Send campaign with default behavior (useProxy omitted)${NC}"
echo "Endpoint: POST ${API_BASE}/email"
echo "Payload: 2 recipients, useProxy not specified (should auto-detect)"
RESPONSE=$(curl -s -X POST "${API_BASE}/email" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["test5@example.com", "test6@example.com"],
    "subject": "Test Email with Auto Proxy",
    "message": "This is a test email with automatic proxy detection.",
    "sender": "Test Sender",
    "senderAd": "sender@example.com"
  }')
echo "Response: ${RESPONSE}"
if [ "$RESPONSE" = "true" ] || echo "$RESPONSE" | grep -q 'success'; then
    echo -e "${GREEN}✓ Campaign sent with default proxy behavior${NC}"
    echo -e "${YELLOW}Check server logs - should use proxy if available (backward compatibility)${NC}"
else
    echo -e "${RED}✗ Campaign send failed${NC}"
    echo "Error: ${RESPONSE}"
fi
echo ""

echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo ""
echo "✅ Tests Completed!"
echo ""
echo "Expected Results:"
echo "  • Proxies saved to: backend/data/proxy-config.json"
echo "  • With auth: {host, port, username, password}"
echo "  • Without auth: {host, port}"
echo "  • useProxy=true: Should show '🔀 Using proxy' in logs"
echo "  • useProxy=false: Should show '🚫 Proxy disabled' in logs"
echo "  • useProxy omitted: Should use proxy by default (backward compatibility)"
echo ""
echo "Next Steps:"
echo "  1. Check backend/data/proxy-config.json for saved proxies"
echo "  2. Review server console logs for proxy usage indicators"
echo "  3. Verify SMTP config is set before running email tests"
echo ""
