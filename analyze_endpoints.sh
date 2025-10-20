#!/bin/bash

# Comprehensive API endpoint analyzer for SE Gateway

echo "======================================================"
echo "SE Gateway - API Endpoint Analysis"
echo "======================================================"
echo ""

OUTPUT_FILE="ENDPOINT_ANALYSIS.md"

# Start markdown file
cat > "$OUTPUT_FILE" << 'MDSTART'
# SE Gateway - API Endpoint Analysis

Generated: $(date)

## Summary

This document catalogs all API endpoints in the SE Gateway application, organized by category.

---

MDSTART

echo "Analyzing endpoints from all route files..."

# Function to extract endpoints from a file
analyze_file() {
    local file=$1
    local base_path=$2

    echo ""
    echo "### File: $file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Extract GET endpoints
    grep -n "^\s*\(app\|router\)\.get(" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
        # Extract the route path
        route=$(echo "$line_content" | sed -E "s/.*\.get\(['\"]([^'\"]+)['\"].*/\1/")
        # Add base path if provided
        if [ ! -z "$base_path" ]; then
            full_route="$base_path$route"
        else
            full_route="$route"
        fi
        echo "- **GET** \`$full_route\` (line $line_num)" >> "$OUTPUT_FILE"
    done

    # Extract POST endpoints
    grep -n "^\s*\(app\|router\)\.post(" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
        route=$(echo "$line_content" | sed -E "s/.*\.post\(['\"]([^'\"]+)['\"].*/\1/")
        if [ ! -z "$base_path" ]; then
            full_route="$base_path$route"
        else
            full_route="$route"
        fi
        echo "- **POST** \`$full_route\` (line $line_num)" >> "$OUTPUT_FILE"
    done

    # Extract PUT endpoints
    grep -n "^\s*\(app\|router\)\.put(" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
        route=$(echo "$line_content" | sed -E "s/.*\.put\(['\"]([^'\"]+)['\"].*/\1/")
        if [ ! -z "$base_path" ]; then
            full_route="$base_path$route"
        else
            full_route="$route"
        fi
        echo "- **PUT** \`$full_route\` (line $line_num)" >> "$OUTPUT_FILE"
    done

    # Extract DELETE endpoints
    grep -n "^\s*\(app\|router\)\.delete(" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
        route=$(echo "$line_content" | sed -E "s/.*\.delete\(['\"]([^'\"]+)['\"].*/\1/")
        if [ ! -z "$base_path" ]; then
            full_route="$base_path$route"
        else
            full_route="$route"
        fi
        echo "- **DELETE** \`$full_route\` (line $line_num)" >> "$OUTPUT_FILE"
    done

    # Extract PATCH endpoints
    grep -n "^\s*\(app\|router\)\.patch(" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
        route=$(echo "$line_content" | sed -E "s/.*\.patch\(['\"]([^'\"]+)['\"].*/\1/")
        if [ ! -z "$base_path" ]; then
            full_route="$base_path$route"
        else
            full_route="$route"
        fi
        echo "- **PATCH** \`$full_route\` (line $line_num)" >> "$OUTPUT_FILE"
    done

    echo "" >> "$OUTPUT_FILE"
}

# Analyze main app.js
echo "" >> "$OUTPUT_FILE"
echo "## Main Application Routes (app.js)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "app.js" ""

# Analyze enhanced routes
echo "" >> "$OUTPUT_FILE"
echo "## Enhanced Routes (mounted at /api/enhanced)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "enhancedRoutes.js" "/api/enhanced"

# Analyze campaign routes
echo "" >> "$OUTPUT_FILE"
echo "## Campaign Routes (mounted at /api/enhanced)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "campaignRoutes.js" "/api/enhanced"

# Analyze SMTP database routes
echo "" >> "$OUTPUT_FILE"
echo "## SMTP Database Routes (mounted at /api/smtp/database)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "smtpDatabaseRoutes.js" "/api/smtp/database"

# Analyze combo routes
echo "" >> "$OUTPUT_FILE"
echo "## SMTP Combo Routes (mounted at /api/smtp/combo)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "comboRoutes.js" "/api/smtp/combo"

# Analyze inbox routes
echo "" >> "$OUTPUT_FILE"
echo "## Inbox Searcher Routes (mounted at /api/enhanced/inbox)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "inboxRoutes.js" "/api/enhanced/inbox"

# Analyze contact routes
echo "" >> "$OUTPUT_FILE"
echo "## Contact Extractor Routes (mounted at /api/enhanced/contact)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
analyze_file "contactRoutes.js" "/api/enhanced/contact"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## Analysis Complete" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Total endpoint files analyzed: 7" >> "$OUTPUT_FILE"

echo ""
echo "Analysis complete! Results written to: $OUTPUT_FILE"
echo ""
